const box = document.getElementById('mediaPreview');
const base = location.pathname.replace(/\/$/, '');
let tries = 0;
const iconPaths = {
  play: ['M5 4.98951C5 4.01835 5 3.53277 5.20249 3.2651C5.37889 3.03191 5.64852 2.88761 5.9404 2.87018C6.27544 2.85017 6.67946 3.11953 7.48752 3.65823L18.0031 10.6686C18.6708 11.1137 19.0046 11.3363 19.1209 11.6168C19.2227 11.8621 19.2227 12.1377 19.1209 12.383C19.0046 12.6635 18.6708 12.886 18.0031 13.3312L7.48752 20.3415C6.67946 20.8802 6.27544 21.1496 5.9404 21.1296C5.64852 21.1122 5.37889 20.9679 5.20249 20.7347C5 20.467 5 19.9814 5 19.0103V4.98951Z'],
  pause: ['M8 5h3v14H8z', 'M14 5h3v14h-3z'],
  volumeOn: [
    'M19.7479 4.99993C21.1652 6.97016 22 9.38756 22 11.9999C22 14.6123 21.1652 17.0297 19.7479 18.9999M15.7453 7.99993C16.5362 9.13376 17 10.5127 17 11.9999C17 13.4872 16.5362 14.8661 15.7453 15.9999',
    'M9.63432 4.36561L6.46863 7.5313C6.29568 7.70425 6.2092 7.79073 6.10828 7.85257C6.01881 7.9074 5.92127 7.9478 5.81923 7.9723C5.70414 7.99993 5.58185 7.99993 5.33726 7.99993H3.6C3.03995 7.99993 2.75992 7.99993 2.54601 8.10892C2.35785 8.20479 2.20487 8.35777 2.10899 8.54594C2 8.75985 2 9.03987 2 9.59993V14.3999C2 14.96 2 15.24 2.10899 15.4539C2.20487 15.6421 2.35785 15.7951 2.54601 15.8909C2.75992 15.9999 3.03995 15.9999 3.6 15.9999H5.33726C5.58185 15.9999 5.70414 15.9999 5.81923 16.0276C5.92127 16.0521 6.01881 16.0925 6.10828 16.1473C6.2092 16.2091 6.29568 16.2956 6.46863 16.4686L9.63431 19.6342C10.0627 20.0626 10.2769 20.2768 10.4608 20.2913C10.6203 20.3038 10.7763 20.2392 10.8802 20.1175C11 19.9773 11 19.6744 11 19.0686V4.9313C11 4.32548 11 4.02257 10.8802 3.88231C10.7763 3.76061 10.6203 3.69602 10.4608 3.70858C10.2769 3.72305 10.0627 3.93724 9.63432 4.36561Z'
  ],
  volumeOff: [
    'M22 8.99993L16 14.9999M16 8.99993L22 14.9999',
    'M9.63432 4.36561L6.46863 7.5313C6.29568 7.70425 6.2092 7.79073 6.10828 7.85257C6.01881 7.9074 5.92127 7.9478 5.81923 7.9723C5.70414 7.99993 5.58185 7.99993 5.33726 7.99993H3.6C3.03995 7.99993 2.75992 7.99993 2.54601 8.10892C2.35785 8.20479 2.20487 8.35777 2.10899 8.54594C2 8.75985 2 9.03987 2 9.59993V14.3999C2 14.96 2 15.24 2.10899 15.4539C2.20487 15.6421 2.35785 15.7951 2.54601 15.8909C2.75992 15.9999 3.03995 15.9999 3.6 15.9999H5.33726C5.58185 15.9999 5.70414 15.9999 5.81923 16.0276C5.92127 16.0521 6.01881 16.0925 6.10828 16.1473C6.2092 16.2091 6.29568 16.2956 6.46863 16.4686L9.63431 19.6342C10.0627 20.0626 10.2769 20.2768 10.4608 20.2913C10.6203 20.3038 10.7763 20.2392 10.8802 20.1175C11 19.9773 11 19.6744 11 19.0686V4.9313C11 4.32548 11 4.02257 10.8802 3.88231C10.7763 3.76061 10.6203 3.69602 10.4608 3.70858C10.2769 3.72305 10.0627 3.93724 9.63432 4.36561Z'
  ]
};

function makeIcon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.setAttribute('aria-hidden', 'true');
  for (const pathData of iconPaths[name]) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    if (name === 'pause') {
      path.setAttribute('fill', 'currentColor');
      path.setAttribute('stroke', 'none');
    } else {
      path.setAttribute('fill', 'none');
    }
    svg.append(path);
  }
  return svg;
}

function updateIcon(button, name, label, text) {
  button.replaceChildren(makeIcon(name));
  if (text) button.append(document.createTextNode(' ' + text));
  button.setAttribute('aria-label', label);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
}

function makeRange(className, label) {
  const range = document.createElement('input');
  range.className = 'media-range ' + className;
  range.type = 'range';
  range.min = '0';
  range.max = '1000';
  range.value = '0';
  range.setAttribute('aria-label', label);
  return range;
}

function makeVolumeControls(media, className) {
  const group = document.createElement('div');
  group.className = className;
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = className + '-button';
  toggle.setAttribute('aria-label', 'Silenciar');
  const volume = makeRange(className + '-range', 'Volumen');
  volume.min = '0';
  volume.max = '1';
  volume.step = '0.01';
  volume.value = '0.8';
  media.volume = 0.8;

  const update = () => {
    const isMuted = media.muted || media.volume === 0;
    updateIcon(toggle, isMuted ? 'volumeOff' : 'volumeOn', isMuted ? 'Activar sonido' : 'Silenciar');
    volume.value = isMuted ? '0' : String(media.volume);
  };
  toggle.addEventListener('click', () => {
    if (media.muted || media.volume === 0) {
      if (media.volume === 0) media.volume = Number(volume.dataset.previousVolume || 0.8);
      media.muted = false;
    } else {
      volume.dataset.previousVolume = String(media.volume);
      media.muted = true;
    }
    update();
  });
  volume.addEventListener('input', () => {
    const nextVolume = Number(volume.value);
    media.volume = nextVolume;
    if (nextVolume > 0) volume.dataset.previousVolume = String(nextVolume);
    media.muted = media.volume === 0;
    update();
  });
  media.addEventListener('volumechange', update);
  group.append(toggle, volume);
  update();
  return group;
}

function makeAudioPlayer() {
  const player = document.createElement('section');
  player.className = 'audio-preview';
  const audio = document.createElement('audio');
  audio.src = base + '/preview';
  audio.preload = 'metadata';
  audio.hidden = true;
  let audioContext = null;
  let analyser = null;
  let waveformData = null;
  let waveformLevels = [];
  let waveformTargets = [];
  let source = null;
  let visualFrame = 0;
  let lastWaveformFrame = 0;
  const waveform = document.createElement('canvas');
  waveform.className = 'audio-preview-waveform';
  waveform.setAttribute('aria-hidden', 'true');

  const clearWaveform = () => {
    const context = waveform.getContext('2d');
    if (context) context.clearRect(0, 0, waveform.width, waveform.height);
  };
  const stopWaveform = () => {
    if (visualFrame) cancelAnimationFrame(visualFrame);
    visualFrame = 0;
    waveformLevels = [];
    waveformTargets = [];
    clearWaveform();
  };
  const fadeWaveform = () => {
    waveformTargets.fill(0);
    if (!visualFrame && analyser) visualFrame = requestAnimationFrame(drawWaveform);
  };
  const drawWaveform = (timestamp) => {
    if (!analyser) {
      stopWaveform();
      return;
    }
    const bounds = waveform.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * pixelRatio));
    const height = Math.max(1, Math.round(bounds.height * pixelRatio));
    if (waveform.width !== width || waveform.height !== height) {
      waveform.width = width;
      waveform.height = height;
    }

    const context = waveform.getContext('2d');
    if (!context || !waveformData) {
      stopWaveform();
      return;
    }
    const bars = Math.min(180, Math.floor(bounds.width / 2.5));
    if (waveformTargets.length !== bars) {
      waveformTargets = new Array(bars).fill(0);
      waveformLevels = new Array(bars).fill(0);
    }
    if (!audio.paused) {
      analyser.getByteTimeDomainData(waveformData);
      for (let index = 0; index < bars; index += 1) {
        const start = Math.floor(index / bars * waveformData.length);
        const end = Math.max(start + 1, Math.floor((index + 1) / bars * waveformData.length));
        let peak = 0;
        for (let sample = start; sample < end; sample += 1) {
          peak = Math.max(peak, Math.abs(waveformData[sample] - 128));
        }
        waveformTargets[index] = Math.min(1, peak / 128 * 2.2);
      }
    }
    const elapsed = lastWaveformFrame ? Math.min(timestamp - lastWaveformFrame, 50) : 16;
    lastWaveformFrame = timestamp;
    const smoothing = 1 - Math.exp(-elapsed / (audio.paused ? 450 : 85));
    context.clearRect(0, 0, width, height);
    const barWidth = width / Math.max(1, bars) * 0.58;
    for (let index = 0; index < bars; index += 1) {
      const amplitude = waveformLevels[index] +=
        (waveformTargets[index] - waveformLevels[index]) * smoothing;
      if (amplitude < 0.008) continue;
      const barHeight = Math.max(pixelRatio, amplitude * height * 0.9);
      const x = index / bars * width + (width / bars - barWidth) / 2;
      context.fillStyle = `rgba(130, 142, 163, ${0.04 + amplitude * 0.25})`;
      context.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
    }
    if (audio.paused && waveformLevels.every(level => level < 0.008)) {
      stopWaveform();
      return;
    }
    visualFrame = requestAnimationFrame(drawWaveform);
  };
  const prepareWaveform = async () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      if (!audioContext) {
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        waveformData = new Uint8Array(analyser.fftSize);
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      }
      await audioContext.resume();
    } catch {
      stopWaveform();
    }
  };

  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'audio-preview-play';
  updateIcon(play, 'play', 'Reproducir audio');
  const showError = (message) => {
    let note = box.querySelector('.preview-note');
    if (!note) {
      note = document.createElement('p');
      note.className = 'preview-note';
      box.append(note);
    }
    note.textContent = message;
  };
  play.addEventListener('click', async () => {
    if (audio.paused) {
      try {
        await prepareWaveform();
        await audio.play();
      } catch {
        showError('No se pudo reproducir el audio. Recarga la página para volver a intentarlo.');
      }
    } else {
      audio.pause();
    }
  });

  const content = document.createElement('div');
  content.className = 'audio-preview-content';
  const title = document.createElement('strong');
  title.className = 'audio-preview-title';
  title.textContent = 'Audio actual';
  const controls = document.createElement('div');
  controls.className = 'audio-preview-controls';
  const track = document.createElement('div');
  track.className = 'audio-preview-track';
  track.append(waveform);
  const seek = makeRange('audio-preview-seek', 'Posición del audio');
  track.append(seek);
  const time = document.createElement('span');
  time.className = 'audio-preview-time';
  seek.addEventListener('input', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = Number(seek.value) / 1000 * audio.duration;
    }
  });
  const update = () => {
    updateIcon(play, audio.paused ? 'play' : 'pause', audio.paused ? 'Reproducir audio' : 'Pausar audio');
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      seek.value = String(Math.round(audio.currentTime / audio.duration * 1000));
    }
    time.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
  };
  audio.addEventListener('play', () => {
    update();
    if (analyser) {
      if (!visualFrame) {
        lastWaveformFrame = 0;
        visualFrame = requestAnimationFrame(drawWaveform);
      }
    }
  });
  audio.addEventListener('timeupdate', update);
  audio.addEventListener('loadedmetadata', update);
  audio.addEventListener('pause', () => {
    update();
    fadeWaveform();
  });
  audio.addEventListener('ended', () => {
    update();
    fadeWaveform();
  });
  audio.addEventListener('error', () => {
    showError('No se pudo cargar la vista previa de audio. El archivo original sigue disponible.');
  });

  controls.append(track, time);
  const volume = makeVolumeControls(audio, 'audio-preview-volume');
  content.append(controls, volume);
  player.append(audio, title, play, content);
  window.addEventListener('pagehide', () => {
    stopWaveform();
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    source?.disconnect();
    analyser?.disconnect();
    if (audioContext && audioContext.state !== 'closed') audioContext.close();
  }, { once: true });
  return player;
}

function makeVideoPlayer(streaming) {
  const player = document.createElement('div');
  player.className = 'video-preview-player';
  const video = document.createElement('video');
  video.className = 'video-preview-media';
  video.src = base + (streaming ? '/preview-stream' : '/preview');
  video.preload = 'none';
  video.playsInline = true;
  video.controlsList = 'nodownload';
  video.disablePictureInPicture = true;
  video.addEventListener('contextmenu', event => event.preventDefault());

  const note = document.createElement('p');
  note.className = 'preview-note';
  note.textContent = streaming
    ? 'Preview rápida · hasta 480p · Pulsa reproducir. La primera carga puede tardar unos segundos.'
    : 'Vista previa de vídeo';
  const controls = document.createElement('div');
  controls.className = 'video-preview-controls';

  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'video-preview-play';
  updateIcon(play, 'play', 'Reproducir vídeo', 'Reproducir');
  play.addEventListener('click', async () => {
    if (video.paused) {
      try {
        await video.play();
      } catch {
        note.textContent = 'No se pudo reproducir la preview. Recarga para volver a intentarlo.';
      }
    } else {
      video.pause();
    }
  });

  const seek = makeRange('video-preview-seek', 'Posición del vídeo');
  seek.disabled = streaming;
  seek.title = streaming ? 'La preview rápida no permite buscar libremente.' : 'Buscar en el vídeo';
  seek.addEventListener('input', () => {
    if (!streaming && Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = Number(seek.value) / 1000 * video.duration;
    }
  });
  const elapsed = document.createElement('span');
  elapsed.className = 'video-preview-time';
  const update = () => {
    updateIcon(play, video.paused ? 'play' : 'pause', video.paused ? 'Reproducir vídeo' : 'Pausar vídeo', video.paused ? 'Reproducir' : 'Pausar');
    elapsed.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
    if (!streaming && Number.isFinite(video.duration) && video.duration > 0) {
      seek.value = String(Math.round(video.currentTime / video.duration * 1000));
    }
  };
  video.addEventListener('timeupdate', update);
  video.addEventListener('loadedmetadata', update);
  video.addEventListener('play', update);
  video.addEventListener('pause', update);
  video.addEventListener('ended', update);
  video.addEventListener('error', () => {
    note.textContent = 'No se pudo reproducir la preview. Puede haber dos reproducciones activas o un formato no compatible. Recarga para reintentar; el original sigue disponible.';
  });

  const volume = makeVolumeControls(video, 'video-preview-volume');
  const fullscreen = document.createElement('button');
  fullscreen.type = 'button';
  fullscreen.className = 'video-preview-fullscreen';
  fullscreen.textContent = '⛶';
  fullscreen.setAttribute('aria-label', 'Ver en pantalla completa');
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (player.requestFullscreen) await player.requestFullscreen();
      else throw new Error('Fullscreen is not supported for the preview player.');
    } catch {
      note.textContent = 'No se pudo abrir la vista previa en pantalla completa.';
    }
  });

  controls.append(play, seek, elapsed, volume, fullscreen);
  player.append(video, note, controls);
  return player;
}

async function poll() {
  try {
    const response = await fetch(base + '/preview-status');
    if (!response.ok) {
      box.textContent = 'El enlace expiró o necesitas desbloquearlo de nuevo.';
      return;
    }
    const data = await response.json();
    box.replaceChildren();
    box.classList.remove('is-empty');

    if (data.status === 'audio') {
      box.append(makeAudioPlayer());
      return;
    }
    if (data.status === 'video' || data.status === 'video_stream') {
      box.append(makeVideoPlayer(data.status === 'video_stream'));
      return;
    }
    if (data.status === 'image') {
      const image = document.createElement('img');
      image.src = base + '/preview';
      image.alt = 'Vista previa de la imagen';
      image.loading = 'lazy';
      box.append(image);
      return;
    }

    const note = document.createElement('p');
    note.className = 'preview-note';
    note.textContent = data.status === 'failed'
      ? 'No hay vista previa para este tipo de archivo. Puedes descargar el original.'
      : 'Preparando vista previa…';
    if (data.status === 'failed') box.classList.add('is-empty');
    box.append(note);
    if (data.status === 'pending' && ++tries < 720) window.setTimeout(poll, 5000);
  } catch {
    if (++tries < 720) window.setTimeout(poll, 5000);
  }
}

poll();
const copy = document.getElementById('shareCopy');
const code = document.getElementById('shareURL');
code.textContent = location.origin + base;
copy.onclick = async () => {
  const hint = copy.querySelector('small');
  try {
    await navigator.clipboard.writeText(location.origin + base);
    copy.classList.add('copied');
    const icon = hint.querySelector('svg')?.cloneNode(true);
    hint.replaceChildren();
    if (icon) hint.append(icon);
    hint.append(document.createTextNode('COPIADO AL PORTAPAPELES'));
  } catch {
    hint.textContent = 'Selecciona el enlace para copiarlo manualmente.';
    const selection = getSelection();
    const range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};
