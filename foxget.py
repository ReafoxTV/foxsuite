import os, re, time, uuid, sqlite3, subprocess, threading, shutil, json, signal, tempfile
from pathlib import Path
from flask import Blueprint, request, jsonify, send_file, current_app
from urllib.parse import urlparse, parse_qs

foxget_bp = Blueprint('foxget', __name__)

DATA = Path(os.getenv('DATA_DIR', '/data'))
FOXGET = DATA / 'foxget'
FOXGET.mkdir(parents=True, exist_ok=True)

MAX_RESULT_BYTES = int(os.getenv('FOXGET_MAX_RESULT_BYTES', 2 * 1024 * 1024 * 1024))
MAX_DURATION_SECONDS = int(os.getenv('FOXGET_MAX_DURATION_SECONDS', 7200))
MAX_PENDING_PER_USER = int(os.getenv('FOXGET_MAX_PENDING_PER_USER', 5))
MAX_ACTIVE_GLOBAL = int(os.getenv('FOXGET_MAX_ACTIVE_GLOBAL', 2))
KEEP_AFTER_DOWNLOAD = int(os.getenv('FOXGET_KEEP_AFTER_DOWNLOAD', 300))
MAX_READY_AGE = int(os.getenv('FOXGET_MAX_READY_AGE', 3600))
YOUTUBE_COOKIES_DIR = Path(os.getenv('FOXGET_YOUTUBE_COOKIES_DIR', '/run/secrets/youtube-cookies'))
YOUTUBE_COOKIES_FILE = os.getenv('FOXGET_YOUTUBE_COOKIES_FILE', '').strip()
INSTAGRAM_COOKIES_DIR = Path(os.getenv('FOXGET_INSTAGRAM_COOKIES_DIR', '/run/secrets/instagram-cookies'))
INSTAGRAM_COOKIES_FILE = os.getenv('FOXGET_INSTAGRAM_COOKIES_FILE', '').strip()
CODEC_FILTERS = {
    'auto': '',
    'h264': "[vcodec~='^(avc1|h264)']",
    'h265': "[vcodec~='^(hev1|hvc1|hevc|h265)']",
    'vp9': "[vcodec~='^(vp09|vp9)']",
    'av1': "[vcodec~='^(av01|av1)']",
}
YOUTUBE_AUTH_ERROR = 'YouTube rechazó las cookies de sesión del servidor porque ya no son válidas. Actualiza el archivo de cookies de YouTube en el servidor e inténtalo de nuevo.'
COOKIE_AUTH_ERROR = 'Las cookies de sesión parecen inválidas o vencidas. Actualízalas en el servidor e inténtalo de nuevo.'
INSTAGRAM_AUTH_ERROR = 'Instagram requiere cookies de sesión válidas para acceder a este contenido. Actualízalas en el servidor e inténtalo de nuevo.'
ACCESS_DENIED_ERROR = 'Acceso denegado por la plataforma. El contenido puede ser privado o estar restringido; verifica que el enlace sea público e inténtalo más tarde.'
process_lock = threading.Lock()
active_processes = {}

def is_youtube_auth_error(text):
    normalized = text.lower().replace('’', "'")
    return (
        'provided youtube account cookies are no longer valid' in normalized
        or ('sign in to confirm' in normalized and 'not a bot' in normalized)
    )

def foxget_error_message(text, platform):
    normalized = str(text or '').lower().replace('’', "'")
    if str(text or '') == YOUTUBE_AUTH_ERROR:
        return YOUTUBE_AUTH_ERROR
    if platform == 'youtube' and is_youtube_auth_error(normalized):
        return YOUTUBE_AUTH_ERROR
    if platform == 'instagram' and any(marker in normalized for marker in (
        'empty media response', 'login required', 'login to view',
        'not logged in', 'instagram login'
    )):
        return INSTAGRAM_AUTH_ERROR
    if any(marker in normalized for marker in (
        'invalid cookie', 'cookies are invalid', 'cookie has expired',
        'cookies have expired', 'cookies are no longer valid',
        'no se encontró el archivo de cookies', 'archivo de cookies está vacío',
        'archivo de cookies de youtube', 'archivo de cookies de instagram'
    )):
        return COOKIE_AUTH_ERROR
    if any(marker in normalized for marker in (
        'access denied', 'http error 401', 'http error 403', 'http error 451',
        '401 unauthorized', '403 forbidden', '451 unavailable',
        'error 1020', 'status code 401', 'status code 403',
        'not authorized', 'unauthorized', 'forbidden', 'video is private',
        'private video', 'not publicly available'
    )):
        return ACCESS_DENIED_ERROR
    return 'No se pudo obtener o convertir el contenido. Verifica que el enlace sea público e inténtalo de nuevo.'

def cookie_args(platform, writable_dir=None):
    if platform not in ('youtube', 'instagram'):
        return ['--no-cookies']
    cookie_dir, configured_file = (
        (YOUTUBE_COOKIES_DIR, YOUTUBE_COOKIES_FILE)
        if platform == 'youtube'
        else (INSTAGRAM_COOKIES_DIR, INSTAGRAM_COOKIES_FILE)
    )
    if not configured_file and platform == 'instagram':
        return ['--no-cookies']
    if configured_file and Path(configured_file).name != configured_file:
        raise RuntimeError(f'El nombre del archivo de cookies de {platform} no es válido.')
    cookies = cookie_dir / configured_file if configured_file else None
    if platform == 'youtube' and cookies is None:
        candidates = sorted(path for path in cookie_dir.glob('*.txt') if path.is_file())
        if not candidates:
            return ['--no-cookies']
        if len(candidates) > 1:
            raise RuntimeError('Deja un solo archivo .txt de cookies de YouTube o configura FOXGET_YOUTUBE_COOKIES_FILE.')
        cookies = candidates[0]
    try:
        cookie_stat = cookies.stat()
    except FileNotFoundError:
        raise RuntimeError(f'No se encontró el archivo de cookies configurado para {platform}.')
    if not cookies.is_file():
        raise RuntimeError(f'El archivo de cookies de {platform} no es un archivo regular.')
    if cookie_stat.st_size == 0:
        raise RuntimeError(f'El archivo de cookies de {platform} está vacío.')
    if writable_dir is None:
        raise RuntimeError(f'No se pudo preparar una copia temporal de las cookies de {platform}.')
    writable_cookies = Path(writable_dir) / f'{platform}-cookies.txt'
    shutil.copyfile(cookies, writable_cookies)
    os.chmod(writable_cookies, 0o600)
    return ['--cookies', str(writable_cookies)]

def request_args(platform):
    return ['--impersonate', 'chrome'] if platform == 'instagram' else []

def youtube_extractor_args():
    return [
        '--js-runtimes', 'node',
        '--extractor-args', 'youtubepot-bgutilhttp:base_url=http://bgutil:4416',
    ]

def video_format_selector(quality='best', codec='auto'):
    height_filter = '' if quality == 'best' else f'[height<={quality}]'
    codec_filter = CODEC_FILTERS.get(codec, '')
    return f'bestvideo{height_filter}{codec_filter}+bestaudio/best{height_filter}{codec_filter}'

def filter_format_selector(selector, codec='auto'):
    codec_filter = CODEC_FILTERS.get(codec, '')
    if not codec_filter: return selector
    return '/'.join(part + codec_filter for part in selector.split('/'))

def db():
    c = sqlite3.connect(DATA / 'db.sqlite', timeout=60)
    c.row_factory = sqlite3.Row
    return c

def init_foxget():
    with db() as c:
        c.executescript('''
        CREATE TABLE IF NOT EXISTS foxget_jobs(
          id TEXT PRIMARY KEY,
          uid INTEGER NOT NULL,
          source_url TEXT NOT NULL,
          platform TEXT NOT NULL,
          format TEXT NOT NULL,
          quality TEXT NOT NULL,
          codec TEXT NOT NULL DEFAULT 'auto',
          title TEXT,
          state TEXT NOT NULL DEFAULT queued,
          progress REAL NOT NULL DEFAULT 0,
          error TEXT,
          file_path TEXT,
          file_name TEXT,
          file_size INTEGER,
          created REAL NOT NULL,
          started REAL,
          finished REAL,
          first_download REAL,
          delete_after REAL,
          FOREIGN KEY(uid) REFERENCES users(id)
        );
        ''')
        columns = {row['name'] for row in c.execute('PRAGMA table_info(foxget_jobs)')}
        if 'codec' not in columns:
            c.execute("ALTER TABLE foxget_jobs ADD COLUMN codec TEXT NOT NULL DEFAULT 'auto'")

def clean_name(value):
    value = ''.join(ch if ch.isalnum() or ch in ' ._-' else '_' for ch in (value or 'FoxGet'))
    return value.strip(' ._')[:120] or 'FoxGet'

def platform_of(url):
    host = (urlparse(url).hostname or '').lower()
    if host == 'youtu.be' or host == 'youtube.com' or host.endswith('.youtube.com'): return 'youtube'
    if host == 'instagram.com' or host.endswith('.instagram.com'): return 'instagram'
    if host == 'tiktok.com' or host.endswith('.tiktok.com'): return 'tiktok'
    if host == 'x.com' or host.endswith('.x.com') or host == 'twitter.com' or host.endswith('.twitter.com'): return 'x'
    return ''

def job_dict(r):
    expires_at = r['delete_after'] or (
        (r['finished'] + MAX_READY_AGE) if r['finished'] is not None else None
    )
    return {
        'id': r['id'], 'state': r['state'], 'progress': r['progress'],
        'title': r['title'], 'error': r['error'], 'format': r['format'],
        'quality': r['quality'], 'codec': r['codec'], 'fileName': r['file_name'],
        'fileSize': r['file_size'], 'createdAt': r['created'],
        'firstDownloadAt': r['first_download'], 'finishedAt': r['finished'],
        'expiresAt': expires_at, 'sourceUrl': r['source_url']
    }

def worker_loop():
    while True:
        with db() as c:
            active = c.execute("SELECT COUNT(*) n FROM foxget_jobs WHERE state IN ('downloading','converting','cancelling')").fetchone()['n']
            job = None
            if active < MAX_ACTIVE_GLOBAL:
                job = c.execute("SELECT * FROM foxget_jobs WHERE state='queued' ORDER BY created LIMIT 1").fetchone()
                if job:
                    c.execute("UPDATE foxget_jobs SET state='downloading', started=?, progress=0 WHERE id=?", (time.time(), job['id']))
        if not job:
            time.sleep(2); continue
        try:
            run_job(job['id'])
        except Exception as e:
            with db() as c:
                c.execute(
                    "UPDATE foxget_jobs SET state='error', error=? "
                    "WHERE id=? AND state IN ('downloading','converting')",
                    (foxget_error_message(e, job['platform']), job['id'])
                )
            with process_lock:
                active_processes.pop(job['id'], None)

def run_job(job_id):
    with db() as c:
        r = c.execute('SELECT * FROM foxget_jobs WHERE id=?', (job_id,)).fetchone()
    if not r: return
    with tempfile.TemporaryDirectory(prefix='foxget-cookies-') as cookie_dir:
        run_job_with_cookies(job_id, r, cookie_args(r['platform'], cookie_dir))

def run_job_with_cookies(job_id, r, cookie_options):
    work = FOXGET / job_id
    work.mkdir(parents=True, exist_ok=True)
    action, quality, codec = r['format'], r['quality'], r['codec'] or 'auto'
    url = r['source_url']
    common = ['yt-dlp','--ignore-config',*cookie_options,*request_args(r['platform']),'--no-playlist','--no-warnings',
              '--restrict-filenames','--max-filesize',str(MAX_RESULT_BYTES),
              '--newline','--progress','--progress-delta','0.5',url]
    youtube_client_args=youtube_extractor_args()
    if action == 'youtube_video':
        selector = video_format_selector(quality,codec)
        cmd = common[:-1] + youtube_client_args + ['-f',selector,'--merge-output-format','mp4',
              '-o',str(work/'%(title).120B.%(ext)s'),url]
    elif action == 'youtube_audio':
        audio_quality = quality if quality in ('320K', '192K', '128K') else '0'
        cmd = common[:-1] + youtube_client_args + ['-f','bestaudio/best','--extract-audio',
              '--audio-format','mp3','--audio-quality',audio_quality,
              '-o',str(work/'%(title).120B.%(ext)s'),url]
    elif action == 'tiktok_nowatermark':
        selector = filter_format_selector('download_addr-0/download_addr/best',codec)
        cmd = common[:-1] + ['-f',selector,
              '--merge-output-format','mp4',
              '-o',str(work/'%(title).120B.%(ext)s'),url]
    elif action == 'tiktok_watermark':
        selector = filter_format_selector('play_addr-0/play_addr/best',codec)
        cmd = common[:-1] + ['-f',selector,
              '--merge-output-format','mp4',
              '-o',str(work/'%(title).120B.%(ext)s'),url]
    elif action == 'tiktok_audio':
        cmd = common[:-1] + ['-f','bestaudio/best','--extract-audio',
              '--audio-format','mp3','--audio-quality','0',
              '-o',str(work/'%(title).120B.%(ext)s'),url]
    elif action == 'x_video':
        cmd = common[:-1] + ['-f',video_format_selector('best',codec),
              '--merge-output-format','mp4',
              '-o',str(work/'%(title).120B.%(ext)s'),url]
    elif action == 'x_audio':
        cmd = common[:-1] + ['-f','bestaudio/best','--extract-audio',
              '--audio-format','mp3','--audio-quality','0',
              '-o',str(work/'%(title).120B.%(ext)s'),url]
    elif action == 'instagram_video':
        cmd = common[:-1] + ['-f',video_format_selector('best',codec),
              '--merge-output-format','mp4',
              '-o',str(work/'%(title).120B.%(ext)s'),url]
    elif action == 'instagram_image':
        cmd = common[:-1] + ['--ignore-no-formats-error','--write-thumbnail','--skip-download',
              '-o',str(work/'%(title).120B.%(ext)s'),url]
    elif action == 'instagram_audio':
        cmd = common[:-1] + ['-f','bestaudio/best','--extract-audio',
              '--audio-format','mp3','--audio-quality','0',
              '-o',str(work/'%(title).120B.%(ext)s'),url]
    else:
        raise ValueError('Accion no compatible.')
    with process_lock:
        with db() as c:
            current = c.execute('SELECT state FROM foxget_jobs WHERE id=?', (job_id,)).fetchone()
        if not current or current['state'] not in ('downloading', 'converting'):
            return
        process = subprocess.Popen(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
            errors='replace', start_new_session=True
        )
        active_processes[job_id] = process
    youtube_auth_error = False
    diagnostic_lines = []
    for line in process.stdout:
        if r['platform'] == 'youtube' and is_youtube_auth_error(line):
            youtube_auth_error = True
        if any(marker in line.lower() for marker in (
            'error', '401', '403', '451', '1020', 'cookie', 'denied',
            'forbidden', 'private', 'not authorized'
        )) and len(diagnostic_lines) < 12:
            diagnostic_lines.append(line[:500])
        try:
            with db() as c:
                if '[download]' in line and '%' in line:
                    match = re.search(r'\[download\]\s+([\d.]+)%', line)
                    if not match:
                        continue
                    pct = float(match.group(1))
                    progress = min(100.0, max(0.0, round(pct, 1)))
                    c.execute(
                        "UPDATE foxget_jobs SET state='downloading', progress=? "
                        "WHERE id=? AND state IN ('downloading','converting')",
                        (progress, job_id)
                    )
                elif any(marker in line for marker in ('[Merger]', '[ExtractAudio]', '[VideoRemuxer]', '[Fixup')):
                    c.execute(
                        "UPDATE foxget_jobs SET state='converting' "
                        "WHERE id=? AND state IN ('downloading','converting')",
                        (job_id,)
                    )
        except (ValueError, IndexError):
            continue
    code = process.wait()
    with process_lock:
        try:
            with db() as c:
                current = c.execute('SELECT state FROM foxget_jobs WHERE id=?', (job_id,)).fetchone()
            if not current:
                shutil.rmtree(work, ignore_errors=True)
                return
            if current['state'] in ('cancelling', 'cancelled'):
                shutil.rmtree(work, ignore_errors=True)
                with db() as c:
                    c.execute("UPDATE foxget_jobs SET state='cancelled', error=NULL WHERE id=? AND state IN ('cancelling','cancelled')", (job_id,))
                return
            files = [p for p in work.iterdir() if p.is_file()] if work.exists() else []
            if code != 0 or not files:
                shutil.rmtree(work, ignore_errors=True)
                error = YOUTUBE_AUTH_ERROR if youtube_auth_error else foxget_error_message('\n'.join(diagnostic_lines), r['platform'])
                with db() as c:
                    c.execute("UPDATE foxget_jobs SET state='error', error=? WHERE id=? AND state IN ('downloading','converting')", (error, job_id))
                return
            path = max(files, key=lambda p: p.stat().st_size)
            size = path.stat().st_size
            if size > MAX_RESULT_BYTES:
                shutil.rmtree(work, ignore_errors=True)
                with db() as c:
                    c.execute("UPDATE foxget_jobs SET state='error', error='El resultado supera el limite de tamano.' WHERE id=? AND state IN ('downloading','converting')", (job_id,))
                return
            finished = time.time()
            with db() as c:
                c.execute("UPDATE foxget_jobs SET state='ready', progress=100, title=COALESCE(NULLIF(title,''),?), file_path=?, file_name=?, file_size=?, finished=?, delete_after=? WHERE id=? AND state IN ('downloading','converting')", (clean_name(path.stem), str(path), path.name, size, finished, finished + MAX_READY_AGE, job_id))
        finally:
            active_processes.pop(job_id, None)
def cleaner_loop():
    while True:
        now = time.time()
        with db() as c:
            rows = c.execute("SELECT id,file_path FROM foxget_jobs WHERE state='ready' AND COALESCE(delete_after, finished + ?, created + ?) <=? AND id NOT IN (SELECT id FROM foxget_jobs WHERE state='downloading' OR state='converting')", (MAX_READY_AGE, MAX_READY_AGE, now)).fetchall()
            for r in rows:
                shutil.rmtree(FOXGET / r['id'], ignore_errors=True)
                c.execute("UPDATE foxget_jobs SET state='expired', file_path=NULL, file_name=NULL, file_size=NULL WHERE id=?", (r['id'],))
        time.sleep(30)

@foxget_bp.get('/api/foxget')
def list_jobs():
    from app import require
    u = require()
    now = time.time()
    with db() as c:
        rows = c.execute('SELECT * FROM foxget_jobs WHERE uid=? ORDER BY created DESC LIMIT 30', (u['id'],)).fetchall()
        recent = c.execute(
            "SELECT * FROM foxget_jobs WHERE uid=? "
            "AND state NOT IN ('queued','downloading','converting','cancelling','cancelled') "
            "ORDER BY created DESC LIMIT 5",
            (u['id'],)
        ).fetchall()
        available = c.execute(
            "SELECT * FROM foxget_jobs WHERE uid=? AND state='ready' "
            "AND COALESCE(delete_after, finished + ?, created + ?) > ? ORDER BY created DESC",
            (u['id'], MAX_READY_AGE, MAX_READY_AGE, now)
        ).fetchall()
    return jsonify({
        'jobs': [job_dict(r) for r in rows],
        'recent': [job_dict(r) for r in recent],
        'available': [job_dict(r) for r in available]
    })

@foxget_bp.post('/api/foxget')
def create_job():
    from app import require
    u = require()
    data = request.get_json(silent=True) or {}
    url = (data.get('url') or '').strip()
    action = data.get('action') or ''
    quality = str(data.get('quality') or 'best')
    codec = str(data.get('codec') or 'auto').lower()
    title = str(data.get('title') or '').strip()[:300]
    if not url.startswith(('http://', 'https://')): return jsonify(error='Introduce un enlace valido.'), 400
    platform = platform_of(url)
    if not platform: return jsonify(error='Plataforma no compatible.'), 400
    valid = {
      'youtube': ('youtube_video','youtube_audio'),
      'tiktok': ('tiktok_nowatermark','tiktok_watermark','tiktok_audio'),
            'instagram': ('instagram_video','instagram_audio','instagram_image'),
            'x': ('x_video','x_audio')
    }.get(platform, ())
    if action not in valid: return jsonify(error='Opcion no disponible para este enlace.'), 400
    if codec not in CODEC_FILTERS: return jsonify(error='Codec no disponible.'), 400
    if action == 'youtube_video' and quality not in ('360','480','720','1080','1440','2160','best'):
        return jsonify(error='Calidad no valida.'), 400
    if action == 'youtube_audio' and quality not in ('best', '320K', '192K', '128K'):
        return jsonify(error='Calidad de audio no valida.'), 400
    with db() as c:
        pending = c.execute("SELECT COUNT(*) n FROM foxget_jobs WHERE uid=? AND state IN ('queued','downloading','converting','cancelling')", (u['id'],)).fetchone()['n']
        if pending >= MAX_PENDING_PER_USER: return jsonify(error='Tienes demasiados trabajos pendientes.'), 429
        active = c.execute("SELECT COUNT(*) n FROM foxget_jobs WHERE state IN ('queued','downloading','converting','cancelling')").fetchone()['n']
        if active >= MAX_ACTIVE_GLOBAL + MAX_PENDING_PER_USER: return jsonify(error='El servicio esta saturado. Intenta mas tarde.'), 429
        job_id = uuid.uuid4().hex
        c.execute('INSERT INTO foxget_jobs(id,uid,source_url,platform,format,quality,codec,title,created) VALUES(?,?,?,?,?,?,?,?,?)',
              (job_id, u['id'], url, platform, action, quality, codec, title, time.time()))
    return jsonify({'id': job_id}), 201

@foxget_bp.post('/api/foxget/inspect')
def inspect_url():
    from app import require
    require()
    data = request.get_json(silent=True) or {}
    url = (data.get('url') or '').strip()
    if not url.startswith(('http://','https://')): return jsonify(error='Introduce un enlace valido.'), 400
    platform = platform_of(url)
    if platform not in ('youtube','tiktok','instagram','x'): return jsonify(error='Plataforma no compatible.'), 400
    try:
        with tempfile.TemporaryDirectory(prefix='foxget-inspect-cookies-') as cookie_dir:
            cookie_options = cookie_args(platform, cookie_dir)
            cmd=['yt-dlp','--ignore-config',*cookie_options,*request_args(platform),'--no-playlist','--no-warnings','--dump-single-json']
            if platform == 'youtube':
                cmd += youtube_extractor_args()
            elif platform == 'instagram':
                cmd += ['--ignore-no-formats-error']
            cmd += [url]
            out=subprocess.run(cmd,capture_output=True,text=True,timeout=60,errors='replace')
        if out.returncode!=0:
            details = out.stderr or out.stdout or ''
            user_error = foxget_error_message(details, platform)
            if user_error == YOUTUBE_AUTH_ERROR:
                current_app.logger.warning('FOXGET_INSPECT_AUTH_ERROR: YouTube rejected the configured cookies.')
                return jsonify(error=user_error), 400
            current_app.logger.error('FOXGET_INSPECT_ERROR: %s', details[:2000])
            if user_error == COOKIE_AUTH_ERROR or user_error == INSTAGRAM_AUTH_ERROR:
                return jsonify(error=user_error), 400
            if user_error == ACCESS_DENIED_ERROR:
                return jsonify(error=user_error), 400
            return jsonify(error='No se pudo analizar el enlace. Verifica que sea público y correcto.'), 400
        info=json.loads(out.stdout)
    except Exception as error:
        current_app.logger.warning('FOXGET_INSPECT_EXCEPTION: platform=%s type=%s', platform, type(error).__name__)
        message = foxget_error_message(error, platform)
        if message in (COOKIE_AUTH_ERROR, INSTAGRAM_AUTH_ERROR, ACCESS_DENIED_ERROR, YOUTUBE_AUTH_ERROR):
            return jsonify(error=message), 400
        return jsonify(error='No se pudo analizar el enlace. Verifica que sea público y correcto.'), 400
    formats=info.get('formats') or []
    heights=sorted({f.get('height') for f in formats if f.get('height')},reverse=True)
    qualities=[f'{h}p' for h in heights if h] or ['best']
    video_formats=[]
    seen_formats=set()
    for item in sorted(formats,key=lambda value:value.get('height') or 0,reverse=True):
        codec=str(item.get('vcodec') or '').lower()
        if not codec or codec=='none': continue
        if codec.startswith(('avc1','h264')): codec_name,codec_key='H.264','h264'
        elif codec.startswith(('hev1','hvc1','hevc','h265')): codec_name,codec_key='H.265','h265'
        elif codec.startswith(('vp09','vp9')): codec_name,codec_key='VP9','vp9'
        elif codec.startswith(('av01','av1')): codec_name,codec_key='AV1','av1'
        else: codec_name,codec_key=codec.split('.')[0].upper(),''
        height=item.get('height')
        ext=item.get('ext')
        key=(height,codec_name,ext)
        if key in seen_formats: continue
        seen_formats.add(key)
        video_formats.append({'height':height,'codec':codec_name,'codecKey':codec_key,'ext':ext})
        if len(video_formats)>=48: break
    media_extension = str(info.get('ext') or '').lower()
    has_video_metadata = (
        bool(video_formats)
        or (isinstance(info.get('duration'), (int, float)) and info['duration'] > 0)
        or media_extension in ('mp4', 'm4v', 'webm', 'mov')
    )
    return jsonify({
      'platform':platform,
      'title':info.get('title') or 'Contenido',
      'thumbnail':info.get('thumbnail') or '',
      'uploader':info.get('uploader') or '',
      'duration':info.get('duration'),
            'qualities':qualities,
            'videoFormats':video_formats,
            'isImage':platform=='instagram' and not has_video_metadata and bool(info.get('thumbnail'))
    })
@foxget_bp.get('/api/foxget/<job_id>')
def job_status(job_id):
    from app import require
    u = require()
    with db() as c:
        r = c.execute('SELECT * FROM foxget_jobs WHERE id=? AND uid=?', (job_id, u['id'])).fetchone()
    if not r: return jsonify(error='Trabajo no encontrado.'), 404
    return jsonify(job_dict(r))

@foxget_bp.get('/api/foxget/<job_id>/download')
def job_download(job_id):
    from app import require
    u = require()
    now = time.time()
    with db() as c:
        r = c.execute('SELECT * FROM foxget_jobs WHERE id=? AND uid=?', (job_id, u['id'])).fetchone()
        if not r or r['state'] != 'ready' or not r['file_path']: return jsonify(error='El resultado no está disponible.'), 404
        expires_at = r['delete_after'] or (r['finished'] or r['created']) + MAX_READY_AGE
        if expires_at <= now:
            shutil.rmtree(FOXGET / job_id, ignore_errors=True)
            c.execute("UPDATE foxget_jobs SET state='expired', file_path=NULL, file_name=NULL, file_size=NULL WHERE id=?", (job_id,))
            return jsonify(error='El archivo ya expiró.'), 410
        path = Path(r['file_path'])
        if not path.is_file(): return jsonify(error='El archivo ya fue eliminado.'), 410
        expected_size = path.stat().st_size
        response = send_file(path, as_attachment=True, download_name=r['file_name'] or 'foxget')
        source = response.response

    def completed_transfer():
        completed_at = time.time()
        with db() as c:
            job = c.execute(
                'SELECT first_download,finished FROM foxget_jobs WHERE id=? AND uid=?',
                (job_id, u['id'])
            ).fetchone()
            if job and job['first_download'] is None:
                delete_after = min(
                    completed_at + KEEP_AFTER_DOWNLOAD,
                    (job['finished'] or completed_at) + MAX_READY_AGE
                )
                c.execute(
                    'UPDATE foxget_jobs SET first_download=?,delete_after=? WHERE id=? AND uid=?',
                    (completed_at, delete_after, job_id, u['id'])
                )

    def stream_download():
        sent = 0
        try:
            for chunk in source:
                yield chunk
                sent += len(chunk)
            if sent == expected_size:
                completed_transfer()
        finally:
            close = getattr(source, 'close', None)
            if close:
                close()

    response.response = stream_download()
    return response

@foxget_bp.delete('/api/foxget/<job_id>')
def job_delete(job_id):
    from app import require
    u = require()
    with db() as c:
        r = c.execute('SELECT * FROM foxget_jobs WHERE id=? AND uid=?', (job_id, u['id'])).fetchone()
        if not r: return jsonify(error='Trabajo no encontrado.'), 404
        if r['state'] in ('downloading', 'converting'): return jsonify(error='No puedes eliminar un trabajo en proceso.'), 409
        shutil.rmtree(FOXGET / job_id, ignore_errors=True)
        c.execute("UPDATE foxget_jobs SET state='deleted', file_path=NULL, file_name=NULL, file_size=NULL WHERE id=?", (job_id,))
    return jsonify({'ok': True})

@foxget_bp.post('/api/foxget/<job_id>/cancel')
def job_cancel(job_id):
    from app import require
    u = require()
    with process_lock:
        with db() as c:
            r = c.execute('SELECT state FROM foxget_jobs WHERE id=? AND uid=?', (job_id, u['id'])).fetchone()
            if not r: return jsonify(error='Trabajo no encontrado.'), 404
            if r['state'] == 'queued':
                c.execute("UPDATE foxget_jobs SET state='cancelled' WHERE id=? AND uid=?", (job_id, u['id']))
                return jsonify({'ok': True, 'state': 'cancelled'})
            if r['state'] == 'cancelling':
                return jsonify({'ok': True, 'state': 'cancelling'}), 202
            if r['state'] not in ('downloading', 'converting'):
                return jsonify(error='Este trabajo ya no se puede cancelar.'), 409
            process = active_processes.get(job_id)
            if not process:
                c.execute("UPDATE foxget_jobs SET state='cancelled' WHERE id=? AND uid=?", (job_id, u['id']))
                return jsonify({'ok': True, 'state': 'cancelled'})
            c.execute("UPDATE foxget_jobs SET state='cancelling' WHERE id=? AND uid=?", (job_id, u['id']))
        try:
            os.killpg(process.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        except OSError:
            current_app.logger.exception('FOXGET_CANCEL_ERROR: job=%s', job_id)
            with db() as c:
                c.execute(
                    "UPDATE foxget_jobs SET state='downloading' WHERE id=? AND uid=? AND state='cancelling'",
                    (job_id, u['id'])
                )
            return jsonify(error='No se pudo cancelar la descarga. Inténtalo de nuevo.'), 500
    return jsonify({'ok': True, 'state': 'cancelling'}), 202

init_foxget()
threading.Thread(target=worker_loop, daemon=True, name='foxget-worker').start()
threading.Thread(target=cleaner_loop, daemon=True, name='foxget-cleaner').start()
