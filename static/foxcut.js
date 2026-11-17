document.addEventListener('DOMContentLoaded', () => {
  const videoFile = document.getElementById('videoFile');
  const videoPlayer = document.getElementById('videoPlayer');
  const previewContainer = document.getElementById('preview-container');
  const timelineContainer = document.getElementById('timeline-container');
  const timeline = document.getElementById('timeline');
  const startInput = document.getElementById('start');
  const endInput = document.getElementById('end');
  const cutBtn = document.getElementById('cutBtn');
  const saveBtn = document.getElementById('saveBtn');
  const statusText = document.getElementById('status');
  const dropZone = document.querySelector('.dropzone');

  let videoBlob = null;
  let videoDuration = 0;

  // Manejar arrastre y clic
  dropZone.addEventListener('click', () => videoFile.click());
  videoFile.addEventListener('change', handleFileSelect);
  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.style.borderColor = '#6a6af0';
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#ccc';
  });
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.style.borderColor = '#ccc';
    if (e.dataTransfer.files.length) {
      videoFile.files = e.dataTransfer.files;
      handleFileSelect(e);
    }
  });

  function handleFileSelect(e) {
    const file = videoFile.files[0];
    if (!file || !file.type.startsWith('video/')) {
      statusText.textContent = 'Por favor, selecciona un archivo de video válido.';
      return;
    }

    statusText.textContent = 'Cargando video...';
    const url = URL.createObjectURL(file);
    videoPlayer.src = url;
    videoPlayer.onloadmetadata = () => {
      videoDuration = videoPlayer.duration;
      startInput.max = endInput.max = videoDuration;
      startInput.value = '00:00';
      endInput.value = formatTime(videoDuration);
      timeline.max = videoDuration;
      timeline.value = 0;

      previewContainer.style.display = 'block';
      timelineContainer.style.display = 'block';
      cutBtn.disabled = true;
      saveBtn.disabled = true;
      statusText.textContent = 'Video cargado. Selecciona el rango a cortar.';
    };
    videoPlayer.onerror = () => {
      statusText.textContent = 'No se pudo cargar el video. Prueba con otro archivo.';
    };
  }

  // Actualizar timeline al mover el cursor
  timeline.addEventListener('input', () => {
    const time = parseFloat(timeline.value);
    videoPlayer.currentTime = time;
    startInput.value = formatTime(time);
  });

  // Sincronizar el reproductor con el timeline
  videoPlayer.addEventListener('timeupdate', () => {
    if (!videoPlayer.readyState) return;
    timeline.value = videoPlayer.currentTime;
    startInput.value = formatTime(videoPlayer.currentTime);
  });

  // Actualizar el tiempo de fin cuando se seleccione un punto
  videoPlayer.addEventListener('click', () => {
    const time = videoPlayer.currentTime;
    if (time < videoDuration && time > 0) {
      endInput.value = formatTime(time);
      timeline.value = time;
      cutBtn.disabled = false;
    }
  });

  // Cortar el video
  cutBtn.addEventListener('click', () => {
    const startTime = parseFloat(startInput.value);
    const endTime = parseFloat(endInput.value);

    if (startTime >= endTime || startTime < 0 || endTime > videoDuration) {
      statusText.textContent = 'Rango inválido. Asegúrate de que el inicio sea menor que el final.';
      return;
    }

    statusText.textContent = 'Procesando video... Esto puede tomar unos segundos.';

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const blob = new Blob([arrayBuffer]);
      const url = URL.createObjectURL(blob);
      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.addEventListener('loadedmetadata', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = tempVideo.videoWidth;
        canvas.height = tempVideo.videoHeight;

        const chunks = [];
        const recorder = new MediaRecorder(tempVideo.captureStream(), { mimeType: 'video/mp4' });
        recorder.ondataavailable = e => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = () => {
          const cutBlob = new Blob(chunks, { type: 'video/mp4' });
          videoBlob = cutBlob;
          saveBtn.disabled = false;
          statusText.textContent = '¡Corte completado! Haz clic en "Descargar".';
        };
        tempVideo.currentTime = startTime;
        tempVideo.play();
        recorder.start();

        // Terminar al llegar al final
        setTimeout(() => {
          if (tempVideo.currentTime >= endTime) {
            recorder.stop();
            tempVideo.pause();
          } else {
            const interval = setInterval(() => {
              if (tempVideo.currentTime >= endTime) {
                recorder.stop();
                tempVideo.pause();
                clearInterval(interval);
              }
            }, 100);
          }
        }, 100);
      });
      tempVideo.onerror = () => {
        statusText.textContent = 'Error al procesar el video.';
      };
    };
    reader.readAsArrayBuffer(file);
  });

  // Descargar el video cortado
  saveBtn.addEventListener('click', () => {
    if (!videoBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(videoBlob);
    a.download = 'cortado.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    statusText.textContent = '¡Descargado!';
  });

  // Formato de tiempo: segundos → 00:00
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
});