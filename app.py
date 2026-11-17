import os, sys, time, sqlite3, secrets, hashlib, fcntl, shutil, contextlib, getpass, mimetypes
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit
from flask import Flask, request, jsonify, render_template, redirect, send_file, abort, g
from flask_wtf.csrf import CSRFError, CSRFProtect, generate_csrf
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.middleware.proxy_fix import ProxyFix
from itsdangerous import URLSafeTimedSerializer, BadSignature

D=Path(os.getenv('DATA_DIR','/data')); D.mkdir(parents=True,exist_ok=True)
(D/'files').mkdir(exist_ok=True)
MAX=10_000_000_000; CHUNK=8*1024*1024
QUOTA=int(os.getenv('QUOTA_BYTES','150000000000'))
RESERVE=int(os.getenv('MIN_FREE_BYTES','10000000000'))
PUBLIC=os.getenv('PUBLIC_URL','https://reafoxtvsite.ddns.net').rstrip('/')
PERIODS=[600,1800,3600,10800,21600,43200,86400,259200]
SESSION_TTL = 14 * 86400  # 14 días de validez de sesión

BLOCKED_EXTENSIONS = {
    '.exe', '.msi', '.dll', '.scr', '.bat', '.cmd', '.ps1', '.vbs', '.wsf',
    '.php', '.phtml', '.php3', '.php4', '.php5', '.phar',
    '.asp', '.aspx', '.jsp', '.cgi', '.sh'
}

def connect():
    c=sqlite3.connect(D/'db.sqlite',timeout=60); c.row_factory=sqlite3.Row
    c.execute('PRAGMA foreign_keys=ON')
    c.execute('PRAGMA journal_mode=WAL')
    c.execute('PRAGMA busy_timeout=5000')
    return c

@contextlib.contextmanager
def locked():
    with open(D/'write.lock','a') as f:
        fcntl.flock(f,fcntl.LOCK_EX)
        c=connect()
        try:
            c.execute('BEGIN IMMEDIATE'); yield c; c.commit()
        except BaseException:
            c.rollback(); raise
        finally:
            c.close()

def init():
    with locked() as c:
        c.executescript("""
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,name TEXT UNIQUE NOT NULL,password TEXT NOT NULL,admin INTEGER NOT NULL DEFAULT 0,active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,uid INTEGER NOT NULL,csrf TEXT NOT NULL,expires REAL NOT NULL,FOREIGN KEY(uid) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS files(id TEXT PRIMARY KEY,uid INTEGER NOT NULL,name TEXT NOT NULL,size INTEGER NOT NULL,offset INTEGER NOT NULL DEFAULT 0,ttl INTEGER NOT NULL,password TEXT,state TEXT NOT NULL DEFAULT 'uploading',touched REAL NOT NULL,expires REAL,created_at REAL,FOREIGN KEY(uid) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS attempts(key TEXT PRIMARY KEY,n INTEGER NOT NULL,until REAL NOT NULL);
CREATE TABLE IF NOT EXISTS app_settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS feedback(id INTEGER PRIMARY KEY,uid INTEGER NOT NULL,username TEXT NOT NULL,category TEXT NOT NULL CHECK(category IN ('suggestion','bug')),message TEXT NOT NULL,created_at REAL NOT NULL,status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','reviewed')));
CREATE INDEX IF NOT EXISTS feedback_user_created_idx ON feedback(uid,created_at DESC);
""")
        c.execute("INSERT OR IGNORE INTO app_settings(key,value) VALUES('module_foxdrop','available')")
        c.execute("INSERT OR IGNORE INTO app_settings(key,value) VALUES('module_foxget','available')")
        c.execute("INSERT OR IGNORE INTO app_settings(key,value) VALUES('module_foxconvert','available')")
        p=D/'secret'
        if not p.exists():
            p.write_text(secrets.token_hex(48)); p.chmod(0o600)
        csrf_secret=D/'flask-secret'
        if not csrf_secret.exists():
            csrf_secret.write_text(secrets.token_hex(48)); csrf_secret.chmod(0o600)
init()
from foxget import foxget_bp
app=Flask(__name__)
app.wsgi_app=ProxyFix(app.wsgi_app,x_for=1,x_proto=1)
app.config.update(
    MAX_CONTENT_LENGTH=CHUNK,
    SECRET_KEY=(D/'flask-secret').read_text(),
    WTF_CSRF_ENABLED=True,
    # Caddy uses Referrer-Policy: no-referrer; mutations still require exact Origin and CSRF tokens.
    WTF_CSRF_SSL_STRICT=False,
    WTF_CSRF_HEADERS=['X-WTF-CSRF-Token'],
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
)
csrf=CSRFProtect(app)
app.register_blueprint(foxget_bp)
signer=URLSafeTimedSerializer((D/'secret').read_text(),salt='download')

def digest(s): return hashlib.sha256(s.encode()).hexdigest()
def err(msg,status=400): return jsonify(error=msg),status

MODULE_STATUSES={'available','partial','unavailable'}
MODULE_LABELS={'foxdrop':'FoxDrop','foxget':'FoxGet','foxconvert':'FoxConvert'}

def requested_module():
    module=request.args.get('module')
    return module if module in MODULE_LABELS else None

def module_statuses():
    with connect() as c:
        rows=c.execute("SELECT key,value FROM app_settings WHERE key IN ('module_foxdrop','module_foxget','module_foxconvert')").fetchall()
    statuses={r['key'].removeprefix('module_'):r['value'] for r in rows}
    return {name:statuses.get(name,'available') for name in MODULE_LABELS}

def module_unavailable(module):
    label=MODULE_LABELS[module]
    message=f'{label} no está disponible temporalmente. Inténtalo más tarde.'
    if request.path.startswith('/api/'): return err(message,503)
    return render_template('module_unavailable.html',module=label,message=message),503

def user():
    if hasattr(g,'u'): return g.u
    token=request.cookies.get('rf_session','')
    with connect() as c:
        r=c.execute('SELECT u.*,s.csrf,s.token FROM sessions s JOIN users u ON u.id=s.uid WHERE s.token=? AND s.expires>? AND u.active=1',(digest(token),time.time())).fetchone()
    g.u=dict(r) if r else None
    return g.u

def require(admin=False):
    u=user()
    if not u: abort(401)
    if admin and not u['admin']: abort(403)
    return u

@app.before_request
def security():
    if request.method in ('POST','PATCH','DELETE','PUT'):
        if request.headers.get('Origin')!=PUBLIC: abort(403)
        if request.path.startswith('/api/') and request.path!='/api/login':
            u=require()
            if not secrets.compare_digest(request.headers.get('X-CSRF-Token',''),u['csrf']): abort(403)
    module = None
    if request.path == '/foxget' or request.path.startswith('/api/foxget'):
        module = 'foxget'
    elif request.path == '/foxconvert' or request.path.startswith('/api/foxconvert'):
        module = 'foxconvert'
    elif request.path in ('/files', '/foxdrop') or request.path.startswith(('/api/files', '/api/admin/files')):
        module = 'foxdrop'
    elif request.path == '/':
        module = requested_module()
    u = user() if module else None
    if module and module_statuses()[module]=='unavailable' and not (u and u['admin']):
        return module_unavailable(module)
    if u and not u['admin'] and not u[module]:
        abort(403)

@app.after_request
def headers(r):
    if user():
        with locked() as c:
            c.execute('UPDATE sessions SET expires=? WHERE token=?',(time.time()+SESSION_TTL,user()['token']))
        token=request.cookies.get('rf_session')
        r.set_cookie('rf_session',token,max_age=SESSION_TTL,secure=True,httponly=True,samesite='Lax')
    return r

@app.errorhandler(400)
@app.errorhandler(401)
@app.errorhandler(403)
@app.errorhandler(404)
@app.errorhandler(409)
@app.errorhandler(413)
def http_error(e):
    if request.path.startswith('/api/'): return err({401:'Inicia sesión.',403:'Acceso denegado.',404:'No encontrado.',409:'Conflicto de subida.',413:'Bloque demasiado grande.'}.get(e.code,'Solicitud inválida.'),e.code)
    return render_template('message.html',message='El enlace no está disponible o no tienes acceso.'),e.code

@app.errorhandler(CSRFError)
def csrf_error(e):
    if request.path.startswith('/api/'): return err('La protección CSRF rechazó la solicitud. Recarga la página e inténtalo de nuevo.',400)
    return render_template('message.html',message='El formulario venció o no es válido. Recarga la página e inténtalo de nuevo.'),400

def allowed_attempt(key):
    key=digest(key+'|'+request.remote_addr)
    with locked() as c:
        now=time.time(); r=c.execute('SELECT * FROM attempts WHERE key=?',(key,)).fetchone()
        if r and r['until']>now and r['n']>=20: return False
        if not r or r['until']<=now:
            c.execute('INSERT OR REPLACE INTO attempts VALUES(?,1,?)',(key,now+900))
        else: c.execute('UPDATE attempts SET n=n+1 WHERE key=?',(key,))
    return True

@app.get('/')
def index(): return render_template('index.html')

@app.post('/api/login')
def login():
    if not allowed_attempt('login'): return err('Demasiados intentos. Espera 15 minutos.',429)
    j=request.get_json(silent=True) or {}; name=str(j.get('name',''))[:64]; pw=str(j.get('password',''))
    if len(pw)>256: return err('Credenciales inválidas.',401)
    with connect() as c: u=c.execute('SELECT * FROM users WHERE name=? AND active=1',(name,)).fetchone()
    if not u or not check_password_hash(u['password'],pw): return err('Credenciales inválidas.',401)
    token=secrets.token_urlsafe(32)
    with locked() as c:
        c.execute('INSERT INTO sessions VALUES(?,?,?,?)',(digest(token),u['id'],secrets.token_urlsafe(24),time.time()+SESSION_TTL))
    r=jsonify(ok=True); r.set_cookie('rf_session',token,max_age=SESSION_TTL,secure=True,httponly=True,samesite='Lax'); return r

@app.get('/api/me')
def me():
    u=require(); return jsonify(name=u['name'],admin=bool(u['admin']),csrf=u['csrf'],csrf_token=generate_csrf(),chunk=CHUNK,display_name=u['display_name'] or u['name'],avatar=avatar_url(u),accent=u['accent'],foxdrop=bool(u['foxdrop']),foxget=bool(u['foxget']),foxconvert=bool(u['foxconvert']),module_statuses=module_statuses())

@app.get('/api/csrf')
def csrf_token_api():
    return jsonify(csrf_token=generate_csrf())

@app.post('/api/admin/modules')
def edit_module_statuses():
    require(True)
    data=request.get_json(silent=True)
    if not isinstance(data,dict) or not data:
        return err('Selecciona el estado de al menos un módulo.')
    updates={}
    for module in MODULE_LABELS:
        if module not in data: continue
        if not isinstance(data[module],str) or data[module] not in MODULE_STATUSES:
            return err(f'Estado no válido para {MODULE_LABELS[module]}.')
        updates[module]=data[module]
    if not updates:
        return err('No se recibieron estados de módulos válidos.')
    with locked() as c:
        c.executemany('INSERT INTO app_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[(f'module_{name}',status) for name,status in updates.items()])
    return jsonify(ok=True,module_statuses=module_statuses())

@app.post('/api/logout')
def logout():
    u=require()
    with locked() as c: c.execute('DELETE FROM sessions WHERE token=?',(u['token'],))
    g.u=None
    r=jsonify(ok=True); r.delete_cookie('rf_session',secure=True,httponly=True,samesite='Lax'); return r

def pack(r):
    file_data={k:r[k] for k in ('id','name','size','offset','ttl','state','expires','uid')}
    if file_data['expires'] is not None:
        file_data['expires']=datetime.fromtimestamp(file_data['expires'],timezone.utc).isoformat().replace('+00:00','Z')
    recorded_at=file_data['expires']
    if file_data['state']=='ready' and recorded_at:
        recorded_at=datetime.fromtimestamp(datetime.fromisoformat(recorded_at.replace('Z','+00:00')).timestamp()-file_data['ttl'],timezone.utc).isoformat().replace('+00:00','Z')
    else:
        recorded_at=datetime.fromtimestamp(r['created_at'] or r['touched'],timezone.utc).isoformat().replace('+00:00','Z')
    file_data['recorded_at']=recorded_at
    return file_data | {'protected':bool(r['password']),'url':PUBLIC+'/f/'+r['id']} | {'owner':profile_owner(r['uid'])}

@app.get('/api/files')
def listing():
    u=require()
    with connect() as c:
        query='SELECT * FROM files WHERE (state != ? OR expires > ?) '
        params=['ready',time.time()]
        if not u['admin']:
            query+='AND uid=? '
            params.append(u['id'])
        rows=c.execute(query+'ORDER BY touched DESC',params).fetchall()
        used=c.execute('SELECT COALESCE(SUM(size),0) FROM files').fetchone()[0]
    return jsonify(files=[pack(r) for r in rows],reserved=used,quota=QUOTA)

def owned(c,fid,u):
    r=c.execute('SELECT * FROM files WHERE id=?',(fid,)).fetchone()
    if not r or (r['uid']!=u['id'] and not u['admin']): abort(404)
    return r

@app.post('/api/files')
def create():
    u=require(); j=request.get_json(silent=True) or {}
    try: size=int(j['size']); ttl=int(j['ttl'])
    except (KeyError,ValueError,TypeError): return err('Tamaño o duración inválidos.')
    name=str(j.get('name','')).replace('\\','/').split('/')[-1]
    name=''.join(x for x in name if ord(x)>=32 and ord(x)!=127)[:200]
    ext=Path(name).suffix.lower()
    if ext in BLOCKED_EXTENSIONS:
        return err(f'La extensión {ext} no está permitida por motivos de seguridad.')
    pw=str(j.get('password',''))
    if not name or not 1<=size<=MAX: return err('El archivo debe tener entre 1 byte y 10 GB.')
    if ttl not in PERIODS or (size>5_000_000_000 and ttl>86400): return err('Expiración no permitida para este tamaño.')
    if len(pw)>256: return err('Contraseña demasiado larga.')
    ph=generate_password_hash(pw) if pw else None
    with locked() as c:
        total=c.execute('SELECT COALESCE(SUM(size),0) FROM files').fetchone()[0]
        outstanding=c.execute("SELECT COALESCE(SUM(size-offset),0) FROM files WHERE state='uploading'").fetchone()[0]
        active=c.execute("SELECT COUNT(*) FROM files WHERE state='uploading' AND uid=?",(u['id'],)).fetchone()[0]
        if active>=5: return err('Máximo 5 subidas pendientes por usuario. Reanuda o elimina alguna.',409)
        if total+size>QUOTA:
            if total>=QUOTA:
                return err('Cuota general alcanzada. Espera a que se libere espacio para subir archivos.',507)
            if size>QUOTA:
                return err('El archivo supera el límite total de la cuota general.',507)
            return err('El archivo no cabe en el espacio restante de la cuota general. Espera a que se libere espacio o selecciona uno más pequeño.',507)
        if shutil.disk_usage(D).free-outstanding-size<RESERVE:
            return err('No hay espacio de almacenamiento disponible para completar la subida.',507)
        fid=secrets.token_urlsafe(24)
        (D/'files'/fid).touch()
        now=time.time()
        c.execute('INSERT INTO files(id,uid,name,size,ttl,password,touched,created_at) VALUES(?,?,?,?,?,?,?,?)',(fid,u['id'],name,size,ttl,ph,now,now))
        c.execute('UPDATE files SET password_enc=? WHERE id=?',(encrypt_link_password(fid,pw) if pw else None,fid))
    return jsonify(id=fid),201

@app.get('/api/files/<fid>')
def status(fid):
    u=require()
    with connect() as c: r=owned(c,fid,u)
    return jsonify(pack(r))

@app.post('/api/files/<fid>/verify')
def verify_upload_chunk(fid):
    u=require()
    try: offset=int(request.headers.get('Upload-Offset','-1'))
    except ValueError: return err('Offset inválido.')
    data=request.get_data()
    if offset<0 or not data or len(data)>CHUNK: return err('Bloque de verificación inválido.')
    with connect() as c: r=owned(c,fid,u)
    if r['state']!='uploading' or offset+len(data)>r['offset']:
        return err('El bloque todavía no se ha recibido.')
    with open(D/'files'/fid,'rb') as f:
        f.seek(offset)
        matches=secrets.compare_digest(f.read(len(data)),data)
    return jsonify(matches=matches)

@app.patch('/api/files/<fid>')
def upload(fid):
    u=require()
    try: offset=int(request.headers.get('Upload-Offset','-1'))
    except ValueError: return err('Offset inválido.')
    data=request.get_data()
    if not data or len(data)>CHUNK: return err('Bloque vacío o demasiado grande.')
    with locked() as c:
        r=owned(c,fid,u)
        if r['state']!='uploading' or offset!=r['offset']: abort(409)
        if offset+len(data)>r['size']: return err('Tamaño excedido.')
        if shutil.disk_usage(D).free-len(data)<RESERVE: return err('Espacio insuficiente.',507)
        with open(D/'files'/fid,'r+b') as f:
            f.truncate(offset); f.seek(offset); f.write(data); f.flush(); os.fsync(f.fileno())
        end=offset+len(data); done=end==r['size']; now=time.time()
        c.execute('UPDATE files SET offset=?,touched=?,state=?,expires=? WHERE id=?',(end,now,'ready' if done else 'uploading',now+r['ttl'] if done else None,fid))
    return jsonify(offset=end,done=done)

@app.delete('/api/files/<fid>')
def delete(fid):
    u=require()
    with locked() as c:
        owned(c,fid,u); [(PREV/(fid+s)).unlink(missing_ok=True) for s in ('.jpg','.mp4','.fail')]; (D/'files'/fid).unlink(missing_ok=True); c.execute('DELETE FROM files WHERE id=?',(fid,))
    return jsonify(ok=True)

@app.get('/api/users')
def users():
    require(True)
    with connect() as c: rows=c.execute('SELECT id,name,display_name,accent,avatar,admin,active,foxdrop,foxget,foxconvert FROM users ORDER BY id').fetchall()
    return jsonify(users=[{'id':r['id'],'name':r['name'],'display_name':r['display_name'] or r['name'],'avatar':avatar_url(r),'accent':r['accent'],'admin':bool(r['admin']),'active':bool(r['active']),'foxdrop':bool(r['foxdrop']),'foxget':bool(r['foxget']),'foxconvert':bool(r['foxconvert'])} for r in rows])

@app.post('/api/users')
def add_user():
    require(True); j=request.get_json(silent=True) or {}; name=str(j.get('name','')).strip(); pw=str(j.get('password',''))
    if not name or len(name)>64 or not 12<=len(pw)<=256: return err('Usuario de 1–64 caracteres y contraseña de 12–256 caracteres.')
    ph=generate_password_hash(pw)
    try:
        with locked() as c: c.execute('INSERT INTO users(name,password) VALUES(?,?)',(name,ph))
    except sqlite3.IntegrityError: return err('Ese usuario ya existe.')
    return jsonify(ok=True)

@app.post('/api/users/<int:uid>')
def edit_user(uid):
    u=require(True); j=request.get_json(silent=True) or {}
    if uid==u['id']: return err('Usa la consola para modificar tu propia cuenta administradora.')
    ph=None
    if 'password' in j:
        pw=str(j['password'])
        if not 12<=len(pw)<=256: return err('Contraseña de 12–256 caracteres.')
        ph=generate_password_hash(pw)
    updates={}
    for field in ('active','foxdrop','foxget','foxconvert'):
        if field in j:
            if not isinstance(j[field],bool): return err('Los permisos y el estado deben ser valores booleanos.')
            updates[field]=int(j[field])
    with locked() as c:
        target=c.execute('SELECT admin FROM users WHERE id=?',(uid,)).fetchone()
        if not target: abort(404)
        if target['admin']:
            updates.pop('foxdrop',None)
            updates.pop('foxget',None)
            updates.pop('foxconvert',None)
        if ph: updates['password']=ph
        if updates:
            assignments=', '.join(f'{field}=?' for field in updates)
            c.execute(f'UPDATE users SET {assignments} WHERE id=?',(*updates.values(),uid))
        if ph or 'active' in updates or not j:
            c.execute('DELETE FROM sessions WHERE uid=?',(uid,))
    return jsonify(ok=True)

@app.delete('/api/users/<int:uid>')
def delete_user(uid):
    u=require(True)
    if uid==u['id']: return err('No puedes eliminar tu propia cuenta de administrador.',400)
    with locked() as c:
        target=c.execute('SELECT id,admin,name FROM users WHERE id=?',(uid,)).fetchone()
        if not target: abort(404)
        if target['admin']: return err('No se pueden eliminar cuentas de administrador desde el panel.',400)
        user_files=c.execute('SELECT id FROM files WHERE uid=?',(uid,)).fetchall()
        for f in user_files:
            fid=f['id']
            (D/'files'/fid).unlink(missing_ok=True)
            for s in ('.jpg','.mp4','.mp3','.fail'):
                (D/'previews'/(fid+s)).unlink(missing_ok=True)
        c.execute('DELETE FROM files WHERE uid=?',(uid,))
        c.execute('DELETE FROM sessions WHERE uid=?',(uid,))
        c.execute('DELETE FROM feedback WHERE uid=?',(uid,))
        (D/'avatars'/(str(uid)+'.jpg')).unlink(missing_ok=True)
        c.execute('DELETE FROM users WHERE id=?',(uid,))
    return jsonify(ok=True)

@app.post('/api/feedback')
def submit_feedback():
    u=require(); j=request.get_json(silent=True)
    if not isinstance(j,dict): return err('El mensaje enviado no es válido.')
    category=j.get('category')
    message=str(j.get('message','')).strip()
    if category not in ('suggestion','bug'): return err('Selecciona si es una sugerencia o un error.')
    if not 5<=len(message)<=2000: return err('El mensaje debe tener entre 5 y 2000 caracteres.')
    now=time.time()
    with locked() as c:
        recent=c.execute('SELECT COUNT(*) FROM feedback WHERE uid=? AND created_at>?',(u['id'],now-3600)).fetchone()[0]
        if recent>=10: return err('Ya enviaste varios mensajes. Inténtalo de nuevo más tarde.',429)
        cursor=c.execute('INSERT INTO feedback(uid,username,category,message,created_at) VALUES(?,?,?,?,?)',(u['id'],u['name'],category,message,now))
    return jsonify(ok=True,id=cursor.lastrowid)

@app.get('/api/admin/feedback')
def list_feedback():
    require(True)
    with connect() as c:
        rows=c.execute('SELECT id,username,category,message,created_at,status FROM feedback ORDER BY CASE status WHEN ? THEN 0 ELSE 1 END,created_at DESC LIMIT 500',('new',)).fetchall()
    return jsonify(feedback=[dict(row) for row in rows])

@app.post('/api/admin/feedback/<int:feedback_id>')
def review_feedback(feedback_id):
    require(True); j=request.get_json(silent=True)
    if not isinstance(j,dict) or not isinstance(j.get('reviewed'),bool):
        return err('El estado del mensaje no es válido.')
    status='reviewed' if j['reviewed'] else 'new'
    with locked() as c:
        cursor=c.execute('UPDATE feedback SET status=? WHERE id=?',(status,feedback_id))
        if not cursor.rowcount: abort(404)
    return jsonify(ok=True,status=status)

@app.delete('/api/admin/feedback/<int:feedback_id>')
def delete_feedback(feedback_id):
    require(True)
    with locked() as c:
        cursor=c.execute('DELETE FROM feedback WHERE id=?',(feedback_id,))
        if not cursor.rowcount: abort(404)
    return jsonify(ok=True)

def available(fid):
    with connect() as c: r=c.execute("SELECT * FROM files WHERE id=? AND state='ready' AND expires>?",(fid,time.time())).fetchone()
    if not r: abort(404)
    return r

def grant_name(fid): return 'rf_dl_'+fid

def granted(fid):
    try:
        return signer.loads(request.cookies.get(grant_name(fid),''),max_age=3600)==fid
    except BadSignature: return False

@app.route('/f/<fid>',methods=['GET','POST'])
def share(fid):
    r=available(fid); error=None
    if request.method=='POST':
        if not allowed_attempt('unlock|'+fid): return render_template('message.html',message='Demasiados intentos. Espera 15 minutos.'),429
        pw=request.form.get('password','')
        if len(pw)<=256 and r['password'] and check_password_hash(r['password'],pw):
            res=redirect('/f/'+fid)
            res.set_cookie(grant_name(fid),signer.dumps(fid),max_age=3600,path='/f/'+fid,secure=True,httponly=True,samesite='Lax')
            return res
        error='Contraseña incorrecta.'
    unlocked=not r['password'] or granted(fid)
    return render_template('share.html',f=r,unlocked=unlocked,error=error)

@app.get('/f/<fid>/download')
def download(fid):
    r=available(fid)
    if r['password'] and not granted(fid): return redirect('/f/'+fid)
    try: return send_file(D/'files'/fid,as_attachment=True,download_name=r['name'],mimetype='application/octet-stream',conditional=True,max_age=0)
    except FileNotFoundError: abort(404)

def clean():
    now=time.time()
    with locked() as c:
        rows=c.execute("SELECT id FROM files WHERE (state='ready' AND expires<=?) OR (state='uploading' AND touched<?)",(now,now-86400)).fetchall()
        for r in rows:
            (D/'files'/r['id']).unlink(missing_ok=True); c.execute('DELETE FROM files WHERE id=?',(r['id'],))
        sweep_previews()
        c.execute('DELETE FROM sessions WHERE expires<=?',(now,)); c.execute('DELETE FROM attempts WHERE until<=?',(now,))
        known={r[0] for r in c.execute('SELECT id FROM files')}
        for p in (D/'files').iterdir():
            if p.is_file() and p.name not in known and p.stat().st_mtime<now-3600: p.unlink()


# FoxDrop previews v1
import subprocess, json, mimetypes
PREV=D/'previews'
PREV.mkdir(exist_ok=True)
PREVIEW_MAX=1_000_000_000
FORMATS='mov,matroska,webm,avi,flv,ogg,mpeg,mpegts,asf,mp3,mp3float,flac,wav,aac,aiff,image2,png_pipe,jpeg_pipe,webp_pipe,gif,bmp_pipe,tiff_pipe'
AUDIO_EXTENSIONS={'aac','aif','aiff','alac','flac','m4a','m4b','mp3','mpga','oga','ogg','opus','wav','wma'}

def media_category(name):
    hint=mimetypes.guess_type(name)[0] or ''
    suffix=Path(name).suffix.lower().lstrip('.')
    if hint.startswith('image/') and suffix!='svg': return 'image'
    if hint.startswith('video/'): return 'video'
    if hint.startswith('audio/') or suffix in AUDIO_EXTENSIONS: return 'audio'
    return ''

def preview_kind(fid):
    if (PREV/(fid+'.jpg')).is_file(): return 'image'
    if (PREV/(fid+'.mp4')).is_file(): return 'video'
    if (PREV/(fid+'.mp3')).is_file(): return 'audio'
    if (PREV/(fid+'.fail')).is_file(): return 'failed'
    return 'pending'

def preview_access(fid):
    r=available(fid)
    if r['password'] and not granted(fid): abort(403)
    return r

@app.get('/f/<fid>/preview-status')
def preview_status(fid):
    r=preview_access(fid)
    if media_category(r['name'])=='video':
        return jsonify(status='video_stream')
    return jsonify(status=preview_kind(fid))

@app.get('/f/<fid>/preview')
def preview_file(fid):
    preview_access(fid)
    kind=preview_kind(fid)
    if kind not in ('image','video','audio'): abort(404)
    suffix={'image':'.jpg','video':'.mp4','audio':'.mp3'}[kind]
    mimetype={'image':'image/jpeg','video':'video/mp4','audio':'audio/mpeg'}[kind]
    path=PREV/(fid+suffix)
    try:
        return send_file(path,mimetype=mimetype,conditional=True,max_age=0)
    except FileNotFoundError: abort(404)

def probe_media(path):
    p=subprocess.run(['ffprobe','-v','error','-protocol_whitelist','file,pipe','-format_whitelist',FORMATS,'-show_streams','-show_format','-of','json',str(path)],capture_output=True,timeout=25,check=True)
    return json.loads(p.stdout)

def sweep_previews():
    now=time.time()
    with connect() as c:
        ids={r[0] for r in c.execute("SELECT id FROM files WHERE state='ready' AND expires>?",(now,))}
    for p in PREV.iterdir():
        if p.is_file() and p.name.split('.')[0] not in ids: p.unlink(missing_ok=True)

def make_preview(r):
    fid=r['id']; src=D/'files'/fid
    category=media_category(r['name'])
    if not category:
        (PREV/(fid+'.fail')).touch(); return
    tmp=None
    try:
        info=probe_media(src)
        image=category=='image'
        audio=category=='audio'
        media_type='audio' if audio else 'video'
        streams=[s for s in info.get('streams',[]) if s.get('codec_type')==media_type]
        if not streams: raise ValueError('No compatible media stream')
        if not audio and int(streams[0].get('width',0))*int(streams[0].get('height',0))>50_000_000:
            raise ValueError('Image dimensions limit')
        if shutil.disk_usage(D).free<RESERVE+PREVIEW_MAX: raise ValueError('Free space reserve')
        total=sum(p.stat().st_size for p in PREV.iterdir() if p.is_file())
        if total+PREVIEW_MAX>20_000_000_000: raise ValueError('Preview quota reached')
        suffix='.jpg' if image else '.mp3' if audio else '.mp4'
        tmp=PREV/(fid+'.working'+suffix)
        cmd=['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-y','-max_alloc','268435456','-threads','2','-protocol_whitelist','file,pipe','-format_whitelist',FORMATS,'-i',str(src),'-map_metadata','-1','-map_chapters','-1']
        if image:
            cmd+=['-map','0:v:0','-vf',"scale=w='min(1600,iw)':h='min(1600,ih)':force_original_aspect_ratio=decrease",'-frames:v','1','-q:v','3','-threads','2']
        elif audio:
            cmd+=['-map','0:a:0','-vn','-c:a','libmp3lame','-b:a','128k','-threads','1']
        else:
            cmd+=['-map','0:v:0','-map','0:a:0?','-vf',"scale=w='min(1280,iw)':h='min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1",'-c:v','libx264','-preset','veryfast','-crf','28','-maxrate','1500k','-bufsize','3000k','-pix_fmt','yuv420p','-threads','2','-c:a','aac','-b:a','96k','-movflags','+faststart']
        cmd+=['-fs',str(PREVIEW_MAX),str(tmp)]
        subprocess.run(cmd,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,check=True,timeout=3600)
        if not tmp.exists() or tmp.stat().st_size<1 or tmp.stat().st_size>PREVIEW_MAX-2_000_000: raise ValueError('Output limit')
        if not image:
            out=probe_media(tmp)
            original=float(info.get('format',{}).get('duration',0))
            converted=float(out.get('format',{}).get('duration',0))
            if original>0 and converted+3<original: raise ValueError('Incomplete preview')
        with locked() as c:
            live=c.execute("SELECT id FROM files WHERE id=? AND state='ready' AND expires>?",(fid,time.time())).fetchone()
            if live:
                os.replace(tmp,PREV/(fid+suffix))
                (PREV/(fid+'.fail')).unlink(missing_ok=True)
    except Exception as e:
        print('Preview not available:',fid,type(e).__name__,flush=True)
        with connect() as c:
            live=c.execute('SELECT id FROM files WHERE id=? AND expires>?',(fid,time.time())).fetchone()
        if live: (PREV/(fid+'.fail')).touch()
    finally:
        if tmp: tmp.unlink(missing_ok=True)

def preview_loop():
    attempted_audio_previews=set()
    while True:
        try:
            sweep_previews()
            with connect() as c:
                rows=c.execute("SELECT * FROM files WHERE state='ready' AND expires>? ORDER BY touched",(time.time(),)).fetchall()
            for r in rows:
                category=media_category(r['name'])
                kind=preview_kind(r['id'])
                retry_failed_audio=category=='audio' and kind=='failed' and r['id'] not in attempted_audio_previews
                if category!='video' and (kind=='pending' or retry_failed_audio):
                    if category=='audio':
                        attempted_audio_previews.add(r['id'])
                    make_preview(r)
                    sweep_previews()
        except Exception as e: print('Preview worker:',repr(e),flush=True)
        time.sleep(5)


# FoxDrop UI2 and live preview
import selectors, signal
from flask import Response, stream_with_context

def format_size(value):
    n=float(value)
    for unit in ('B','KB','MB','GB','TB'):
        if n<1000 or unit=='TB':
            return (str(int(n)) if unit=='B' else ('%.2f'%n).rstrip('0').rstrip('.'))+' '+unit
        n/=1000

def file_label(name):
    ext=Path(name).suffix.lower()
    mt=mimetypes.guess_type(name)[0] or ''
    if mt.startswith('image/'): return '🖼 Imagen'+(' · '+ext[1:].upper() if ext else '')
    if mt.startswith('video/'): return '🎬 Vídeo'+(' · '+ext[1:].upper() if ext else '')
    if mt.startswith('audio/'): return '🎵 Audio'+(' · '+ext[1:].upper() if ext else '')
    if ext=='.pdf': return '📕 Documento PDF'
    if ext in ('.zip','.rar','.7z','.gz','.tar','.bz2','.xz'): return '📦 Archivo comprimido'
    if ext in ('.doc','.docx','.odt','.txt','.md','.rtf'): return '📄 Documento'
    if ext in ('.xls','.xlsx','.csv','.ods'): return '📊 Hoja de cálculo'
    if ext in ('.ppt','.pptx','.odp'): return '📽 Presentación'
    if ext in ('.py','.js','.ts','.json','.html','.css','.java','.sh','.yml','.yaml'): return '⌨ Código / configuración'
    if ext in ('.exe','.msi','.apk','.deb','.rpm'): return '⚙ Aplicación'
    return '📁 '+(ext[1:].upper() if ext else 'Archivo')
app.jinja_env.globals.update(format_size=format_size,file_label=file_label)

@app.get('/foxget')
def foxget_page():
    require()
    return render_template('index.html')

@app.get('/foxconvert')
def foxconvert_page():
    if not user(): return redirect('/')
    return render_template('index.html')

@app.get('/foxdrop')
def foxdrop_page():
    if not user(): return redirect('/')
    return render_template('index.html')

@app.get('/files')
def files_page():
    if not user(): return redirect('/')
    return render_template('index.html',page='files')

@app.get('/users')
def users_page():
    if not user(): return redirect('/')
    require(True)
    return render_template('index.html',page='users')

@app.get('/f/<fid>/preview-stream')
def preview_stream(fid):
    r=preview_access(fid)
    if not (mimetypes.guess_type(r['name'])[0] or '').startswith('video/'): abort(404)
    source=D/'files'/fid
    try:
        info=probe_media(source)
        videos=[s for s in info.get('streams',[]) if s.get('codec_type')=='video']
        if not videos or int(videos[0].get('width',0))*int(videos[0].get('height',0))>50_000_000: abort(415)
    except (subprocess.SubprocessError,ValueError,OSError): abort(415)
    lock=None
    for n in range(2):
        handle=open(D/('preview-stream-'+str(n)+'.lock'),'a')
        try:
            fcntl.flock(handle,fcntl.LOCK_EX|fcntl.LOCK_NB);lock=handle;break
        except BlockingIOError: handle.close()
    if lock is None:
        return Response('Las dos previews están ocupadas. Prueba de nuevo en unos segundos.',status=503,headers={'Retry-After':'10'})
    cmd=['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-threads','1','-filter_threads','1','-max_alloc','268435456','-protocol_whitelist','file,pipe','-format_whitelist',FORMATS,'-i',str(source),'-map','0:v:0','-map','0:a:0?','-map_metadata','-1','-map_chapters','-1','-vf',"scale=w='min(854,iw)':h='min(480,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1,fps=24",'-c:v','libx264','-preset','ultrafast','-tune','zerolatency','-crf','32','-maxrate','900k','-bufsize','900k','-pix_fmt','yuv420p','-threads','1','-g','24','-keyint_min','24','-sc_threshold','0','-c:a','aac','-b:a','64k','-ac','2','-movflags','+frag_keyframe+empty_moov+default_base_moof','-frag_duration','1000000','-flush_packets','1','-f','mp4','pipe:1']
    try:
        proc=subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,start_new_session=True)
    except OSError:
        lock.close();raise
    stopped=[False]
    def stop():
        if stopped[0]: return
        stopped[0]=True
        if proc.poll() is None:
            try: os.killpg(proc.pid,signal.SIGTERM)
            except ProcessLookupError: pass
            try: proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                try: os.killpg(proc.pid,signal.SIGKILL)
                except ProcessLookupError: pass
                proc.wait()
        proc.stdout.close();lock.close()
    @stream_with_context
    def chunks():
        selector=selectors.DefaultSelector();selector.register(proc.stdout,selectors.EVENT_READ)
        deadline=time.monotonic()+3600
        try:
            while time.monotonic()<deadline and time.time()<r['expires']:
                # Recheck deletion and expiry while streaming; no dependency on login.
                with connect() as c:
                    live=c.execute("SELECT 1 FROM files WHERE id=? AND state='ready' AND expires>?",(fid,time.time())).fetchone()
                if not live: break
                events=selector.select(timeout=2)
                if not events:
                    if proc.poll() is not None: break
                    continue
                data=os.read(proc.stdout.fileno(),65536)
                if not data: break
                yield data
        finally:
            selector.close();stop()
    response=Response(chunks(),mimetype='video/mp4')
    response.headers['X-Accel-Buffering']='no'
    response.headers['Accept-Ranges']='none'
    response.call_on_close(stop)
    return response


# FoxDrop SPA3 queue
@app.get('/favicon.ico')
def favicon():
    return app.send_static_file('favicon.ico')


# FoxDrop profiles4
from io import BytesIO
from PIL import Image, ImageOps, UnidentifiedImageError
Image.MAX_IMAGE_PIXELS=12_000_000
AVATARS=D/'avatars'
AVATARS.mkdir(exist_ok=True)
ACCENTS={'orange','pink','blue','purple','green','teal'}

def migrate_profiles():
    with locked() as c:
        cols={r[1] for r in c.execute('PRAGMA table_info(users)')}
        for name,definition in [('display_name',"TEXT NOT NULL DEFAULT ''"),('bio',"TEXT NOT NULL DEFAULT ''"),('accent',"TEXT NOT NULL DEFAULT 'orange'"),('avatar',"TEXT NOT NULL DEFAULT ''"),('foxdrop',"INTEGER NOT NULL DEFAULT 1"),('foxget',"INTEGER NOT NULL DEFAULT 1"),('foxconvert',"INTEGER NOT NULL DEFAULT 1")]:
            if name not in cols: c.execute('ALTER TABLE users ADD COLUMN '+name+' '+definition)
migrate_profiles()

def avatar_url(u):
    version=u['avatar'] if 'avatar' in u.keys() else ''
    return '/api/avatars/'+str(u['id'])+'?v='+version if version else None

def profile_owner(uid):
    with connect() as c:
        u=c.execute('SELECT id,name,display_name,accent,avatar FROM users WHERE id=?',(uid,)).fetchone()
    if not u: return {'id':uid,'name':'Usuario','display_name':'Usuario','avatar':None,'accent':'orange'}
    return {'id':u['id'],'name':u['name'],'display_name':u['display_name'] or u['name'],'avatar':avatar_url(u),'accent':u['accent']}

def profile_data(u):
    return {'name':u['name'],'display_name':u['display_name'] or u['name'],'accent':u['accent'],'avatar':avatar_url(u),'admin':bool(u['admin'])}

@app.get('/profile')
def profile_page():
    if not user(): return redirect('/')
    return render_template('index.html')

@app.get('/api/profile')
def get_profile():
    return jsonify(profile_data(require()))

@app.post('/api/profile')
def save_profile():
    u=require();j=request.get_json(silent=True) or {}
    display=str(j.get('display_name','')).strip();bio='';accent=str(j.get('accent','orange'))
    if not 1<=len(display)<=60: return err('El nombre visible debe tener entre 1 y 60 caracteres.')
    if len(bio)>280: return err('La descripción admite hasta 280 caracteres.')
    if accent not in ACCENTS: return err('Color no válido.')
    if any(ord(x)<32 for x in display): return err('El nombre contiene caracteres no válidos.')
    with locked() as c:
        c.execute('UPDATE users SET display_name=?,bio=?,accent=? WHERE id=?',(display,bio,accent,u['id']))
    return jsonify(ok=True)

def normalize_avatar(data):
    with Image.open(BytesIO(data),formats=['JPEG','PNG','WEBP']) as image:
        if image.width*image.height>12_000_000: raise ValueError('Máximo 12 megapíxeles.')
        image.load()
        image=ImageOps.exif_transpose(image)
        image=ImageOps.fit(image.convert('RGB'),(256,256),method=Image.Resampling.LANCZOS)
        output=BytesIO();image.save(output,format='JPEG',quality=88)
        return output.getvalue()

@app.post('/api/profile/avatar')
def set_avatar():
    u=require()
    if not allowed_attempt('profile-avatar|'+str(u['id'])): return err('Demasiados cambios de foto. Espera 15 minutos.',429)
    if request.content_length is None or request.content_length>3_000_000: return err('La imagen debe pesar como máximo 2 MB.',413)
    f=request.files.get('avatar')
    if not f: return err('Selecciona una imagen JPG, PNG o WebP.')
    data=f.read(2_000_001)
    if not data or len(data)>2_000_000: return err('La imagen debe pesar como máximo 2 MB.',413)
    try: output=normalize_avatar(data)
    except (UnidentifiedImageError,Image.DecompressionBombError,OSError,ValueError): return err('Imagen no válida. Usa JPG, PNG o WebP de hasta 12 megapíxeles.')
    temp=AVATARS/(str(u['id'])+'.'+secrets.token_hex(8)+'.tmp')
    try:
        temp.write_bytes(output)
        with locked() as c:
            os.replace(temp,AVATARS/(str(u['id'])+'.jpg'))
            c.execute('UPDATE users SET avatar=? WHERE id=?',(secrets.token_hex(8),u['id']))
    finally: temp.unlink(missing_ok=True)
    return jsonify(ok=True)

@app.delete('/api/profile/avatar')
def remove_avatar():
    u=require()
    with locked() as c:
        (AVATARS/(str(u['id'])+'.jpg')).unlink(missing_ok=True)
        c.execute("UPDATE users SET avatar='' WHERE id=?",(u['id'],))
    return jsonify(ok=True)

@app.get('/api/avatars/<int:uid>')
def read_avatar(uid):
    require()
    with connect() as c:
        u=c.execute('SELECT avatar FROM users WHERE id=?',(uid,)).fetchone()
    if not u or not u['avatar']: abort(404)
    try: return send_file(AVATARS/(str(uid)+'.jpg'),mimetype='image/jpeg',max_age=0)
    except FileNotFoundError: abort(404)

@app.post('/api/profile/password')
def profile_password():
    u=require()
    if not allowed_attempt('profile-password|'+str(u['id'])): return err('Demasiados intentos. Espera 15 minutos.',429)
    j=request.get_json(silent=True) or {};old=str(j.get('current',''));new=str(j.get('password',''))
    if len(old)>256 or not check_password_hash(u['password'],old): return err('La contraseña actual es incorrecta.',400)
    if not 12<=len(new)<=256: return err('La contraseña nueva debe tener entre 12 y 256 caracteres.')
    hashed=generate_password_hash(new)
    with locked() as c:
        c.execute('UPDATE users SET password=? WHERE id=?',(hashed,u['id']))
        c.execute('DELETE FROM sessions WHERE uid=?',(u['id'],))
    return jsonify(ok=True)

@app.get('/api/admin/files/<fid>/download')
def admin_download(fid):
    require(True);r=available(fid)
    try: return send_file(D/'files'/fid,as_attachment=True,download_name=r['name'],mimetype='application/octet-stream',conditional=True,max_age=0)
    except FileNotFoundError: abort(404)


# FoxDrop security6
import re,base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag
from flask import make_response
KEY_FILE=Path(os.getenv('LINK_KEY_FILE','/run/secrets/link-password.key'))
_LINK_CIPHER=None
def get_link_cipher():
    global _LINK_CIPHER
    if _LINK_CIPHER is None:
        try:
            key=bytes.fromhex(KEY_FILE.read_text().strip())
            if len(key)!=32:raise ValueError('Invalid key length')
        except (OSError,ValueError):
            raise RuntimeError('No se puede leer la clave de enlaces. Revisa LINK_KEY_FILE; no regeneres una clave existente.')
        _LINK_CIPHER=AESGCM(key)
    return _LINK_CIPHER
share_form_signer=URLSafeTimedSerializer((D/'secret').read_text(),salt='public-share-form-v6')
PALETTE={'orange':('#f79c62','#b3699b'),'pink':('#eb8abd','#9c6ab0'),'blue':('#74a8f0','#5d65b9'),'purple':('#b486f2','#6963b5'),'green':('#82c692','#498d83'),'teal':('#6bc8c8','#4e7fb9')}

def migrate_security6():
    with locked() as c:
        cols={r[1] for r in c.execute('PRAGMA table_info(files)')}
        if 'password_enc' not in cols: c.execute('ALTER TABLE files ADD COLUMN password_enc TEXT')
        if 'created_at' not in cols:
            c.execute('ALTER TABLE files ADD COLUMN created_at REAL')
            c.execute('UPDATE files SET created_at=touched WHERE created_at IS NULL')
        cols={r[1] for r in c.execute('PRAGMA table_info(users)')}
        for name,default in [('color_start',''),('color_end',''),('color_mode','gradient')]:
            if name not in cols: c.execute("ALTER TABLE users ADD COLUMN "+name+" TEXT NOT NULL DEFAULT '"+default+"'")
migrate_security6()

def encrypt_link_password(fid,password):
    nonce=os.urandom(12)
    return base64.urlsafe_b64encode(nonce+get_link_cipher().encrypt(nonce,password.encode('utf-8'),fid.encode('utf-8'))).decode('ascii')

def decrypt_link_password(fid,value):
    raw=base64.urlsafe_b64decode(value)
    return get_link_cipher().decrypt(raw[:12],raw[12:],fid.encode('utf-8')).decode('utf-8')

def valid_hex(value):
    if not isinstance(value,str) or not re.fullmatch(r'#[0-9a-fA-F]{6}',value): raise ValueError('Usa un color HEX como #FFAA66.')
    return value.lower()

def profile_colors(u):
    pair=PALETTE.get(u['accent'],PALETTE['orange'])
    return {'color_start':u['color_start'] or pair[0],'color_end':u['color_end'] or pair[1],'color_mode':u['color_mode'] if u['color_mode'] in ('solid','gradient') else 'gradient'}

def profile_data(u):
    return {'name':u['name'],'display_name':u['display_name'] or u['name'],'accent':u['accent'],'avatar':avatar_url(u),'admin':bool(u['admin'])} | profile_colors(u)

def save_profile_v6():
    u=require();j=request.get_json(silent=True) or {};display=str(j.get('display_name','')).strip()
    if not 1<=len(display)<=60 or any(ord(x)<32 for x in display): return err('El nombre visible debe tener entre 1 y 60 caracteres válidos.')
    try: start=valid_hex(j.get('color_start'));end=valid_hex(j.get('color_end'))
    except ValueError as e: return err(str(e))
    mode=j.get('color_mode')
    if mode not in ('solid','gradient'):return err('Selecciona color sólido o degradado.')
    with locked() as c:
        c.execute("UPDATE users SET display_name=?,bio='',color_start=?,color_end=?,color_mode=? WHERE id=?",(display,start,end,mode,u['id']))
    return jsonify(ok=True)
app.view_functions['save_profile']=save_profile_v6

@app.get('/api/profile/banner')
def profile_banner():
    require()
    try: start=valid_hex(request.args.get('start'));end=valid_hex(request.args.get('end'))
    except ValueError: abort(400)
    mode=request.args.get('mode','gradient')
    if mode not in ('solid','gradient'):abort(400)
    if mode=='solid':end=start
    svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 160" preserveAspectRatio="none"><defs><linearGradient id="g"><stop stop-color="'+start+'"/><stop offset="1" stop-color="'+end+'"/></linearGradient></defs><path fill="url(#g)" d="M0 0h800v160H0z"/></svg>'
    return Response(svg,mimetype='image/svg+xml')

@app.post('/api/files/<fid>/password/reveal')
def reveal_file_password(fid):
    u=require()
    with connect() as c:r=owned(c,fid,u)
    if r['state']!='ready' or not r['expires'] or r['expires']<=time.time():abort(404)
    if not r['password']:return err('Este archivo no tiene contraseña.',409)
    if not r['password_enc']:return err('La contraseña antigua no es recuperable. Puedes establecer una nueva.',409)
    try: password=decrypt_link_password(fid,r['password_enc'])
    except (InvalidTag,ValueError,UnicodeError):
        app.logger.warning('link_password_reveal_failed reason=invalid_ciphertext')
        return err('No se pudo recuperar la contraseña. Revisa la clave o establece una nueva.',409)
    return jsonify(password=password)

@app.post('/api/files/<fid>/password')
def change_file_password(fid):
    u=require();j=request.get_json(silent=True) or {};pw=j.get('password')
    if not isinstance(pw,str) or not 1<=len(pw)<=256:return err('La contraseña del enlace debe tener entre 1 y 256 caracteres.')
    hashed=generate_password_hash(pw)
    with locked() as c:
        r=owned(c,fid,u)
        if r['state']!='ready' or not r['expires'] or r['expires']<=time.time():abort(404)
        c.execute('UPDATE files SET password=?,password_enc=? WHERE id=?',(hashed,encrypt_link_password(fid,pw),fid))
    return jsonify(ok=True)

def grant_version(r):return digest(r['password'] or '')

def granted(fid):
    try:
        value=signer.loads(request.cookies.get(grant_name(fid),''),max_age=3600)
        if not isinstance(value,dict) or value.get('fid')!=fid:return False
        with connect() as c:r=c.execute("SELECT * FROM files WHERE id=? AND state='ready' AND expires>?",(fid,time.time())).fetchone()
        return bool(r and secrets.compare_digest(str(value.get('version','')),grant_version(r)))
    except BadSignature:return False

def share_form_cookie(fid):return '__Host-rf_form_'+fid

def render_share_v6(r,error=None,status=200):
    fid=r['id'];token=share_form_signer.dumps({'fid':fid,'nonce':secrets.token_urlsafe(24)})
    unlocked=not r['password'] or granted(fid)
    response=make_response(render_template('share.html',f=r,unlocked=unlocked,error=error,share_csrf=token),status)
    if r['password'] and not unlocked:
        response.set_cookie(share_form_cookie(fid),token,max_age=1800,path='/',secure=True,httponly=True,samesite='Lax')
    return response

def share_v6(fid):
    r=available(fid)
    if request.method=='GET':return render_share_v6(r)
    origin=request.headers.get('Origin')
    if origin and origin!='null' and origin.rstrip('/')!=PUBLIC:
        app.logger.warning('share_unlock_rejected reason=origin')
        return render_share_v6(r,'Solicitud no autorizada. Abre el enlace directamente y vuelve a intentarlo.',403)
    supplied=request.form.get('share_csrf_token','');cookie=request.cookies.get(share_form_cookie(fid),'')
    try:
        if not supplied or not cookie or not secrets.compare_digest(supplied,cookie):raise ValueError('CSRF')
        payload=share_form_signer.loads(supplied,max_age=1800)
        if payload.get('fid')!=fid:raise ValueError('CSRF')
    except (BadSignature,ValueError,AttributeError):
        app.logger.warning('share_unlock_rejected reason=csrf')
        return render_share_v6(r,'El formulario venció o faltan sus cookies. Vuelve a introducir la contraseña.',400)
    if not r['password']:return redirect('/f/'+fid,code=303)
    if not allowed_attempt('unlock|'+fid):return render_share_v6(r,'Demasiados intentos. Espera 15 minutos.',429)
    pw=request.form.get('password','')
    if len(pw)>256 or not check_password_hash(r['password'],pw):return render_share_v6(r,'Contraseña incorrecta. Vuelve a intentarlo.')
    response=redirect('/f/'+fid,code=303)
    response.set_cookie(grant_name(fid),signer.dumps({'fid':fid,'version':grant_version(r)}),max_age=3600,path='/f/'+fid,secure=True,httponly=True,samesite='Lax')
    response.delete_cookie(share_form_cookie(fid),path='/',secure=True,httponly=True,samesite='Lax')
    return response
app.view_functions['share']=share_v6

def security_v6():
    # Public file forms have their own signed, cookie-bound CSRF token.
    if request.endpoint=='share' and request.method=='POST':return None
    return security()
app.before_request_funcs[None]=[security_v6 if f is security else f for f in app.before_request_funcs.get(None,[])]

if __name__=='__main__':
    cmd=sys.argv[1] if len(sys.argv)>1 else ''
    if cmd=='admin':
        name=input('Usuario administrador: ').strip(); pw=getpass.getpass('Contraseña (mínimo 12 caracteres): ')
        if not name or len(name)>64 or not 12<=len(pw)<=256: sys.exit('Usuario o contraseña inválidos.')
        if pw!=getpass.getpass('Repite la contraseña: '): sys.exit('Las contraseñas no coinciden.')
        with locked() as c:
            c.execute('INSERT INTO users(name,password,admin) VALUES(?,?,1) ON CONFLICT(name) DO UPDATE SET password=excluded.password,admin=1,active=1',(name,generate_password_hash(pw)))
            uid=c.execute('SELECT id FROM users WHERE name=?',(name,)).fetchone()[0]
            c.execute('DELETE FROM sessions WHERE uid=?',(uid,))
        print('Cuenta administradora preparada.')
    elif cmd=='preview-loop':
        preview_loop()
    elif cmd=='clean-loop':
        while True:
            try: clean()
            except Exception as e: print('Error de limpieza:',repr(e),flush=True)
            time.sleep(60)
    else: sys.exit('Uso: python app.py admin | clean-loop')
