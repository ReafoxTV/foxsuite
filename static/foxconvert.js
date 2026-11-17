(() => {
  const $ = id => document.getElementById(id);
  const form = $('foxconvertForm');
  if (!form) return;

  const fileInput = $('foxconvertFile');
  const dropzone = $('foxconvertDropzone');
  const settings = $('foxconvertSettings');
  const profileSelect = $('foxconvertProfile');
  const formatSelect = $('foxconvertFormat');
  const videoOutputModeSelect = $('foxconvertVideoOutputMode');
  const qualitySelect = $('foxconvertQuality');
  const imageQualityInput = $('foxconvertImageQualityValue');
  const bitrateInput = $('foxconvertBitrate');
  const audioBitrateInput = $('foxconvertAudioBitrate');
  const widthInput = $('foxconvertWidth');
  const heightInput = $('foxconvertHeight');
  const fitSelect = $('foxconvertFit');
  const videoCodecSelect = $('foxconvertVideoCodec');
  const audioCodecSelect = $('foxconvertAudioCodec');
  const flacCompressionSelect = $('foxconvertFlacCompression');
  const startButton = $('foxconvertStart');
  const cancelButton = $('foxconvertCancel');
  const status = $('foxconvertStatus');
  const statusText = $('foxconvertStatusText');
  const statusIconPath = status.querySelector('svg path');
  const progressWrap = $('foxconvertProgressWrap');
  const progressElement = $('foxconvertProgress');
  const progressFill = progressElement.querySelector('.foxconvert-progress-fill');
  const progressValue = $('foxconvertProgressValue');
  const progressLabel = $('foxconvertProgressLabel');
  const imageTypes = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif', 'bmp', 'gif']);
  const videoTypes = new Set(['mp4', 'm4v', 'mov', 'mkv', 'webm', 'avi', 'mpg', 'mpeg', '3gp']);
  const audioTypes = new Set(['mp3', 'm4a', 'aac', 'wav', 'flac', 'ogg', 'oga', 'opus', 'wma']);
  const formats = {
    image: [
      { value: 'image/jpeg', label: 'JPEG', extension: 'jpg' },
      { value: 'image/png', label: 'PNG', extension: 'png' },
      { value: 'image/webp', label: 'WebP', extension: 'webp' },
      { value: 'image/avif', label: 'AVIF', extension: 'avif' },
      { value: 'image/bmp', label: 'BMP', extension: 'bmp' }
    ],
    video: [
      {
        value: 'mp4', label: 'MP4', extension: 'mp4', engineClass: 'Mp4OutputFormat', mimeType: 'video/mp4',
        videoCodecs: ['avc', 'hevc', 'vp9', 'av1', 'vp8'], audioCodecs: ['aac', 'opus', 'mp3', 'vorbis', 'flac']
      },
      {
        value: 'mov', label: 'MOV (QuickTime)', extension: 'mov', engineClass: 'MovOutputFormat', mimeType: 'video/quicktime',
        videoCodecs: ['avc', 'hevc', 'vp9', 'av1', 'vp8'], audioCodecs: ['aac', 'opus', 'mp3', 'vorbis', 'flac']
      },
      {
        value: 'mkv', label: 'MKV (Matroska)', extension: 'mkv', engineClass: 'MkvOutputFormat', mimeType: 'video/x-matroska',
        videoCodecs: ['avc', 'hevc', 'vp9', 'av1', 'vp8'], audioCodecs: ['aac', 'opus', 'mp3', 'vorbis', 'flac', 'pcm-s16']
      },
      {
        value: 'webm', label: 'WebM', extension: 'webm', engineClass: 'WebMOutputFormat', mimeType: 'video/webm',
        videoCodecs: ['vp8', 'vp9', 'av1'], audioCodecs: ['opus', 'vorbis']
      }
    ],
    audio: [
      {
        value: 'm4a', label: 'M4A (AAC)', extension: 'm4a', engineClass: 'Mp4OutputFormat', mimeType: 'audio/mp4',
        audioCodecs: ['aac']
      },
      {
        value: 'mp3', label: 'MP3', extension: 'mp3', engineClass: 'Mp3OutputFormat', mimeType: 'audio/mpeg',
        audioCodecs: ['mp3']
      },
      {
        value: 'wav', label: 'WAV', extension: 'wav', engineClass: 'WavOutputFormat', mimeType: 'audio/wav',
        audioCodecs: ['pcm-s16', 'pcm-s24', 'pcm-s32']
      },
      {
        value: 'flac', label: 'FLAC', extension: 'flac', engineClass: 'FlacOutputFormat', mimeType: 'audio/flac',
        audioCodecs: ['flac']
      },
      {
        value: 'ogg', label: 'Ogg', extension: 'ogg', engineClass: 'OggOutputFormat', mimeType: 'application/ogg',
        audioCodecs: ['opus', 'vorbis']
      },
      {
        value: 'webm', label: 'WebM', extension: 'webm', engineClass: 'WebMOutputFormat', mimeType: 'audio/webm',
        audioCodecs: ['opus', 'vorbis']
      },
      {
        value: 'mkv', label: 'MKV (Matroska)', extension: 'mkv', engineClass: 'MkvOutputFormat', mimeType: 'audio/x-matroska',
        audioCodecs: ['aac', 'opus', 'mp3', 'vorbis', 'flac', 'pcm-s16', 'pcm-s24', 'pcm-s32']
      }
    ]
  };
  const videoCodecCatalog = [
    { value: 'avc', label: 'H.264 (AVC)', webCodecs: 'avc1.64001f' },
    { value: 'hevc', label: 'H.265 (HEVC)', webCodecs: 'hev1.1.6.L93.B0' },
    { value: 'vp8', label: 'VP8', webCodecs: 'vp8' },
    { value: 'vp9', label: 'VP9', webCodecs: 'vp09.00.10.08' },
    { value: 'av1', label: 'AV1', webCodecs: 'av01.0.04M.08' }
  ];
  const audioCodecCatalog = [
    { value: 'aac', label: 'AAC (M4A)', webCodecs: 'mp4a.40.2' },
    { value: 'opus', label: 'Opus (Ogg)', webCodecs: 'opus' },
    { value: 'mp3', label: 'MP3', webCodecs: 'mp3' },
    { value: 'vorbis', label: 'Vorbis', webCodecs: 'vorbis' },
    { value: 'flac', label: 'FLAC', webCodecs: 'flac' },
    { value: 'pcm-s16', label: 'PCM 16-bit (WAV)', webCodecs: 'pcm-s16' },
    { value: 'pcm-s24', label: 'PCM 24-bit (WAV)', webCodecs: 'pcm-s24' },
    { value: 'pcm-s32', label: 'PCM 32-bit (WAV)', webCodecs: 'pcm-s32' }
  ];
  const bundledAudioEncoders = new Set(['aac', 'flac', 'mp3', 'pcm-s16', 'pcm-s24', 'pcm-s32']);
  const audioFormatByCodec = {
    aac: 'm4a',
    mp3: 'mp3',
    opus: 'ogg',
    vorbis: 'ogg',
    flac: 'flac',
    'pcm-s16': 'wav',
    'pcm-s24': 'wav',
    'pcm-s32': 'wav'
  };
  const losslessAudioCodecs = new Set(['flac', 'pcm-s16', 'pcm-s24', 'pcm-s32']);
  const conversionControls = [
    profileSelect, formatSelect, videoOutputModeSelect, qualitySelect, imageQualityInput, bitrateInput, audioBitrateInput,
    widthInput, heightInput, fitSelect, videoCodecSelect, audioCodecSelect, flacCompressionSelect,
    $('foxconvertOutputName')
  ];
  let selectedFile = null;
  let category = null;
  let currentConversion = null;
  let busy = false;
  let cancelRequested = false;
  let allowUnload = false;
  let clearFileAfterConversion = false;
  let leavePromptPromise = null;
  let savePickerSupported = false;
  let device = { name: 'GPU', detected: false };
  let enginePromise = null;
  let codecUpdateToken = 0;
  let conversionProgressPercent = 0;

  function resetConversionProgress() {
    conversionProgressPercent = 0;
    progressElement.classList.remove('is-indeterminate');
    progressElement.setAttribute('aria-valuenow', '0');
    progressFill.style.width = '0%';
    progressValue.textContent = '';
  }

  function setIndeterminateProgress(label) {
    progressElement.removeAttribute('aria-valuenow');
    progressElement.classList.add('is-indeterminate');
    progressFill.style.width = '';
    progressValue.textContent = '';
    if (label) progressLabel.textContent = label;
  }

  function updateConversionProgress(progress) {
    if (!Number.isFinite(progress)) return;
    const percent = Math.floor(Math.max(0, Math.min(1, progress)) * 100);
    if (percent < conversionProgressPercent) return;
    conversionProgressPercent = percent;
    const videoConversion = category === 'video' && !isVideoAudioOnly();
    if (videoConversion) {
      const visiblePercent = percent;
      if (visiblePercent === 100) {
        progressElement.setAttribute('aria-valuenow', '100');
        progressFill.style.width = '100%';
        progressValue.textContent = '100%';
        setIndeterminateProgress('Finalizando conversión…');
        return;
      }
      progressElement.classList.remove('is-indeterminate');
      progressElement.setAttribute('aria-valuenow', String(visiblePercent));
      progressFill.style.width = `${visiblePercent}%`;
      progressValue.textContent = `${visiblePercent}%`;
      progressLabel.textContent = 'Convirtiendo video…';
      return;
    }
    progressElement.classList.remove('is-indeterminate');
    if (percent === 100) {
      setIndeterminateProgress('Finalizando conversión…');
      return;
    }
    progressLabel.textContent = 'Convirtiendo…';
    progressElement.setAttribute('aria-valuenow', String(percent));
    progressFill.style.width = `${percent}%`;
    progressValue.textContent = `${percent}%`;
  }

  function isVideoAudioOnly() {
    return category === 'video' && videoOutputModeSelect.value === 'audio';
  }

  function setStatus(text, error = false) {
    statusText.textContent = text;
    status.hidden = !text;
    status.dataset.state = error ? 'warning' : 'success';
    statusIconPath.setAttribute('d', error
      ? 'M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z'
      : 'M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z');
  }

  function fileCategory(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (imageTypes.has(extension)) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (videoTypes.has(extension)) return 'video';
    if (audioTypes.has(extension)) return 'audio';
    return null;
  }

  function prettySize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function fillSelect(select, options, value) {
    select.replaceChildren(...options.map(option => {
      const element = document.createElement('option');
      element.value = option.value;
      element.textContent = option.label;
      return element;
    }));
    if (value !== undefined) select.value = value;
  }

  function applyProfile(profile) {
    const values = {
      maximum: { imageQuality: '100', audioBitrate: 320, videoBitrate: 20000, resolution: 'original' },
      balanced: { imageQuality: '90', audioBitrate: 192, videoBitrate: 5000, resolution: 'original' },
      quality: { imageQuality: '95', audioBitrate: 256, videoBitrate: 10000, resolution: 'original' },
      small: { imageQuality: '75', audioBitrate: 128, videoBitrate: 2500, resolution: '720' },
      tiny: { imageQuality: '55', audioBitrate: 64, videoBitrate: 1000, resolution: '480' }
    }[profile];
    if (!values) return;
    qualitySelect.value = values.imageQuality;
    imageQualityInput.value = values.imageQuality;
    bitrateInput.value = String(category === 'video' && !isVideoAudioOnly() ? values.videoBitrate : values.audioBitrate);
    audioBitrateInput.value = String(values.audioBitrate);
    if (category === 'video' && !isVideoAudioOnly()) qualitySelect.value = values.resolution;
    updateQualityOptions();
  }

  function markProfileCustom() {
    profileSelect.value = 'custom';
    profileSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function updateQualityOptions() {
    if (category !== 'image') {
      $('foxconvertCustomImageQuality').hidden = true;
      imageQualityInput.disabled = true;
      imageQualityInput.required = false;
    } else {
      bitrateInput.disabled = false;
    }
    if (category === 'video' && !isVideoAudioOnly()) {
      bitrateInput.disabled = false;
      $('foxconvertQualityLabel').textContent = 'Resolución máxima';
      fillSelect(qualitySelect, [
        { value: 'original', label: 'Resolución original' },
        { value: '2160', label: 'Hasta 2160p (4K)' },
        { value: '1440', label: 'Hasta 1440p' },
        { value: '1080', label: 'Hasta 1080p' },
        { value: '720', label: 'Hasta 720p' },
        { value: '480', label: 'Hasta 480p' },
        { value: 'custom', label: 'Personalizada' }
      ], qualitySelect.value || 'original');
      $('foxconvertQualityGroup').hidden = false;
      const customResolution = qualitySelect.value === 'custom';
      $('foxconvertCustomResolution').hidden = !customResolution;
      widthInput.disabled = !customResolution;
      heightInput.disabled = !customResolution;
      fitSelect.disabled = !customResolution;
      widthInput.required = customResolution;
      heightInput.required = customResolution;
      $('foxconvertBitrateLabel').textContent = 'Bitrate de video';
      bitrateInput.min = '250';
      bitrateInput.max = '50000';
      bitrateInput.step = '250';
      $('foxconvertBitrateGroup').hidden = false;
      audioBitrateInput.min = '32';
      audioBitrateInput.max = '512';
      audioBitrateInput.step = '8';
      $('foxconvertAudioBitrateGroup').hidden = losslessAudioCodecs.has(audioCodecSelect.value);
    } else if (category === 'image') {
      $('foxconvertQualityLabel').textContent = 'Calidad de imagen';
      fillSelect(qualitySelect, [
        { value: '100', label: 'Máxima (100%)' },
        { value: '95', label: 'Muy alta (95%)' },
        { value: '90', label: 'Alta (90%)' },
        { value: '85', label: 'Buena (85%)' },
        { value: '80', label: 'Estándar (80%)' },
        { value: '75', label: 'Media (75%)' },
        { value: '60', label: 'Ligera (60%)' },
        { value: '40', label: 'Mínimo tamaño (40%)' },
        { value: 'custom', label: 'Personalizada…' }
      ], qualitySelect.value || '90');
      const supportsQuality = !['image/png', 'image/bmp'].includes(formatSelect.value);
      $('foxconvertQualityGroup').hidden = !supportsQuality;
      $('foxconvertCustomImageQuality').hidden = !supportsQuality || qualitySelect.value !== 'custom';
      imageQualityInput.disabled = !supportsQuality || qualitySelect.value !== 'custom';
      imageQualityInput.required = !imageQualityInput.disabled;
      $('foxconvertCustomResolution').hidden = true;
      widthInput.disabled = true;
      heightInput.disabled = true;
      fitSelect.disabled = true;
      widthInput.required = false;
      heightInput.required = false;
      $('foxconvertBitrateGroup').hidden = true;
      $('foxconvertAudioBitrateGroup').hidden = true;
    } else {
      $('foxconvertBitrateLabel').textContent = 'Bitrate de audio';
      bitrateInput.min = '32';
      bitrateInput.max = '512';
      bitrateInput.step = '8';
      $('foxconvertBitrateGroup').hidden = category === 'video' || losslessAudioCodecs.has(audioCodecSelect.value);
      bitrateInput.disabled = isVideoAudioOnly();
      audioBitrateInput.min = '32';
      audioBitrateInput.max = '512';
      audioBitrateInput.step = '8';
      $('foxconvertAudioBitrateGroup').hidden = category !== 'video'
        || isVideoAudioOnly() && losslessAudioCodecs.has(audioCodecSelect.value);
      $('foxconvertQualityGroup').hidden = true;
      $('foxconvertCustomImageQuality').hidden = true;
      $('foxconvertCustomResolution').hidden = true;
      widthInput.disabled = true;
      heightInput.disabled = true;
      fitSelect.disabled = true;
      widthInput.required = false;
      heightInput.required = false;
    }
    $('foxconvertFlacCompressionGroup').hidden = category === 'image' || audioCodecSelect.value !== 'flac';
  }

  function supportedCandidates(catalog, values) {
    return catalog.filter(codec => values.includes(codec.value));
  }

  async function filterSupportedCodecs(candidates, categoryForCodec, token) {
    const encoder = categoryForCodec === 'video' ? globalThis.VideoEncoder : globalThis.AudioEncoder;
    const supported = await Promise.all(candidates.map(async candidate => {
      if (categoryForCodec === 'audio' && bundledAudioEncoders.has(candidate.value)) return candidate;
      if (!encoder?.isConfigSupported) return null;
      const config = categoryForCodec === 'video'
        ? { codec: candidate.webCodecs, width: 1280, height: 720, bitrate: 5000000, framerate: 30 }
        : { codec: candidate.webCodecs, sampleRate: 48000, numberOfChannels: 2, bitrate: 192000 };
      try {
        return (await encoder.isConfigSupported(config)).supported ? candidate : null;
      } catch (error) {
        console.debug(`FoxConvert no pudo comprobar el códec ${candidate.value}.`, error);
        return null;
      }
    }));
    return token === codecUpdateToken ? supported.filter(Boolean) : [];
  }

  async function updateCodecOptions() {
    const token = ++codecUpdateToken;
    const videoGroup = $('foxconvertVideoCodecGroup');
    const audioGroup = $('foxconvertAudioCodecGroup');
    const audioOnly = isVideoAudioOnly();
    $('foxconvertVideoOutputModeGroup').hidden = category !== 'video';
    $('foxconvertFormatGroup').hidden = category === 'audio' || audioOnly;
    formatSelect.disabled = category === 'audio' || audioOnly;
    videoGroup.hidden = category !== 'video' || audioOnly;
    audioGroup.hidden = category === 'image';
    if (category === 'image') return;

    const format = category === 'video' && !audioOnly ? formats.video.find(item => item.value === formatSelect.value) : null;
    if (category === 'video' && !audioOnly && !format) return;
    const videoCandidates = category === 'video' && !audioOnly
      ? supportedCandidates(videoCodecCatalog, format.videoCodecs || [])
      : [];
    const audioValues = category === 'audio'
      ? Object.keys(audioFormatByCodec)
      : audioOnly
        ? Object.keys(audioFormatByCodec)
        : (format.audioCodecs || []);
    const audioCandidates = supportedCandidates(audioCodecCatalog, [...new Set(audioValues)]);
    const previousVideo = videoCodecSelect.value;
    const previousAudio = audioCodecSelect.value;
    fillSelect(videoCodecSelect, []);
    fillSelect(audioCodecSelect, []);
    startButton.disabled = true;
    const [availableVideo, availableAudio] = await Promise.all([
      category === 'video' && !audioOnly ? filterSupportedCodecs(videoCandidates, 'video', token) : [],
      filterSupportedCodecs(audioCandidates, 'audio', token)
    ]);
    if (token !== codecUpdateToken) return;
    if (category === 'video' && !audioOnly) {
      const selectedVideo = availableVideo.some(option => option.value === previousVideo)
        ? previousVideo
        : availableVideo[0]?.value;
      fillSelect(videoCodecSelect, availableVideo, selectedVideo);
    }
    const selectedAudio = availableAudio.some(option => option.value === previousAudio)
      ? previousAudio
      : availableAudio[0]?.value;
    fillSelect(audioCodecSelect, availableAudio, selectedAudio);
    updateQualityOptions();
    const hasUnsupportedCodec = (category === 'video' && !audioOnly && !availableVideo.length) || !availableAudio.length;
    startButton.disabled = hasUnsupportedCodec;
    if (hasUnsupportedCodec) {
      $('foxconvertSettingsHint').textContent = category === 'audio' || audioOnly
        ? 'Este navegador no informa códecs de audio compatibles. Prueba con un navegador que admita WebCodecs.'
        : 'Este navegador no informa códecs compatibles para este contenedor. Prueba otro formato o un navegador con más compatibilidad WebCodecs.';
      setStatus('No hay códecs de salida compatibles disponibles para esta selección.', true);
    } else {
      setStatus('');
    }
  }

  function reveal(element) {
    element.classList.remove('is-entering');
    void element.offsetWidth;
    element.classList.add('is-entering');
  }

  function selectFile(file) {
    if (!file || busy) return;
    progressWrap.hidden = true;
    resetConversionProgress();
    const type = fileCategory(file);
    if (!type) {
      clearFile();
      setStatus('Este formato no está admitido. Selecciona una imagen, audio o video compatible.', true);
      return;
    }
    selectedFile = file;
    category = type;
    flacCompressionSelect.value = '5';
    videoOutputModeSelect.value = 'video';
    $('foxconvertFileName').textContent = file.name;
    $('foxconvertFileMeta').textContent = `${type === 'image' ? 'Imagen' : type === 'video' ? 'Video' : 'Audio'} · ${prettySize(file.size)}`;
    $('foxconvertFileInfo').hidden = false;
    reveal($('foxconvertFileInfo'));
    settings.hidden = false;
    reveal(settings);
    $('foxconvertSettingsTitle').textContent = `Opciones de ${type === 'image' ? 'imagen' : type === 'video' ? 'video' : 'audio'}`;
    $('foxconvertCategoryBadge').textContent = type === 'image' ? 'IMAGEN' : type === 'video' ? 'VIDEO' : 'AUDIO';
    $('foxconvertFormatLabel').textContent = type === 'image' ? 'Formato de imagen' : 'Contenedor';
    const availableFormats = type === 'image'
      ? formats.image.filter(item => item.value !== 'image/avif' || supportsAvifEncoding())
      : formats[type];
    fillSelect(formatSelect, availableFormats, availableFormats[0].value);
    $('foxconvertOutputName').value = file.name.replace(/\.[^.]+$/, '');
    profileSelect.value = 'balanced';
    profileSelect.dispatchEvent(new Event('change', { bubbles: true }));
    savePickerSupported = typeof window.showSaveFilePicker === 'function';
    startButton.disabled = false;
    formatSelect.disabled = false;
    updateQualityOptions();
    void updateCodecOptions();
    $('foxconvertSettingsHint').textContent = type === 'image'
      ? 'JPEG, WebP y AVIF usan compresión con calidad ajustable; PNG y BMP se exportan sin pérdida. AVIF aparece solo si el navegador puede codificarlo.'
      : type === 'audio'
        ? 'MP3, FLAC, WAV y AAC usan codificadores locales incluidos. WAV permite PCM de 16, 24 o 32 bits; FLAC permite ajustar la compresión del nivel 0 al 8 sin afectar la calidad. Opus y otros códecs aparecen si el navegador puede codificarlos.'
        : 'Los códecs se filtran según el contenedor y lo que este navegador informa como compatible. La conversión final también depende del archivo y el dispositivo.';
    renderDeviceNotice();
    if (!savePickerSupported) {
      $('foxconvertSettingsHint').textContent += ' Sin selector de carpeta, el resultado se descargará con el sistema habitual del navegador; audio y video usarán memoria temporal.';
      setStatus('');
    } else {
      setStatus('');
    }
  }

  function clearFile() {
    if (busy) return;
    selectedFile = null;
    category = null;
    videoOutputModeSelect.value = 'video';
    codecUpdateToken++;
    fileInput.value = '';
    $('foxconvertFileInfo').hidden = true;
    settings.hidden = true;
    formatSelect.disabled = true;
    formatSelect.replaceChildren();
    $('foxconvertFormatGroup').hidden = false;
    qualitySelect.replaceChildren();
    $('foxconvertCustomImageQuality').hidden = true;
    imageQualityInput.disabled = true;
    imageQualityInput.required = false;
    $('foxconvertCustomResolution').hidden = true;
    widthInput.disabled = true;
    heightInput.disabled = true;
    fitSelect.disabled = true;
    widthInput.required = false;
    heightInput.required = false;
    videoCodecSelect.replaceChildren();
    audioCodecSelect.replaceChildren();
    startButton.disabled = true;
    progressWrap.hidden = true;
    resetConversionProgress();
    $('foxconvertQualityGroup').hidden = false;
    renderDeviceNotice();
    setStatus('');
    savePickerSupported = false;
  }

  function classifyGpu(details) {
    if (/nvidia|geforce|quadro|rtx|tesla|\b(?:0x)?0*10de\b/i.test(details)) return 'NVIDIA';
    if (/amd|radeon|advanced micro devices|\b(?:0x)?0*1002\b/i.test(details)) return 'AMD';
    if (/intel|arc graphics|iris|uhd graphics|\b(?:0x)?0*8086\b/i.test(details)) return 'Intel';
    return null;
  }

  async function detectDevice() {
    let details = '';
    let adapterDetected = false;
    let adapterInfoRestricted = false;
    let webglAvailable = false;
    let webglInfoRestricted = false;
    if (navigator.gpu) {
      for (const options of [{ powerPreference: 'high-performance' }, {}, { powerPreference: 'low-power' }]) {
        try {
          const adapter = await navigator.gpu.requestAdapter(options);
          if (!adapter) continue;
          adapterDetected = true;
          let info = adapter.info;
          if ((!info?.vendor && !info?.description) && adapter.requestAdapterInfo) {
            info = await adapter.requestAdapterInfo();
          }
          const adapterDetails = [info?.vendor, info?.architecture, info?.description].filter(Boolean).join(' ');
          details += ` ${adapterDetails}`;
          if (!adapterDetails || /^(?:unknown|generic|default)$/i.test(adapterDetails.trim())) {
            adapterInfoRestricted = true;
          }
        } catch (error) {
          console.info('WebGPU no permitió identificar uno de los adaptadores; se probará otra fuente.', error);
        }
      }
    }
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      webglAvailable = true;
      const extension = gl.getExtension('WEBGL_debug_renderer_info');
      if (extension) {
        details += ` ${gl.getParameter(extension.UNMASKED_VENDOR_WEBGL) || ''}`;
        details += ` ${gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) || ''}`;
      } else {
        const rendererDetails = `${gl.getParameter(gl.VENDOR) || ''} ${gl.getParameter(gl.RENDERER) || ''}`;
        details += ` ${rendererDetails}`;
        webglInfoRestricted = !classifyGpu(rendererDetails)
          && !/\b(?:swiftshader|llvmpipe|softpipe|software rasterizer|warp)\b/i.test(rendererDetails);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }

    const detectedVendor = classifyGpu(details);
    const softwareRenderer = /\b(?:swiftshader|llvmpipe|softpipe|software rasterizer|warp)\b/i.test(details);
    device = {
      detected: adapterDetected || webglAvailable || softwareRenderer,
      name: detectedVendor,
      cpu: softwareRenderer,
      unavailable: !adapterDetected && !webglAvailable,
      restricted: adapterInfoRestricted || webglInfoRestricted || (!adapterDetected && !webglAvailable)
    };
    renderDeviceNotice();
  }

  function renderDeviceNotice() {
    const notice = $('foxconvertDeviceNotice');
    let title;
    let description = 'FoxConvert siempre prefiere la aceleración por GPU cuando el navegador y el formato la admiten. La detección no garantiza que el navegador la use; puede recurrir a software/CPU.';
    if (device.detected && device.name) {
      title = `GPU detectada · Aceleración por hardware de ${device.name}`;
    } else if (device.cpu) {
      title = 'Procesamiento por software · CPU';
      description = 'El navegador no expone una GPU utilizable para FoxConvert; las conversiones se procesarán por software/CPU.';
    } else if (device.unavailable) {
      title = 'GPU no expuesta · posible procesamiento por CPU';
      description = 'El navegador no permite comprobar si hay una GPU utilizable. La conversión podrá recurrir a software/CPU.';
    } else if (device.detected) {
      title = 'GPU detectada · Fabricante no identificado';
      if (device.restricted) {
        description = 'Un posible AdBlock o una protección de privacidad podría estar impidiendo obtener el fabricante. Desactívelo para obtener el fabricante.';
      }
    } else {
      title = 'GPU no disponible · Procesamiento por software/CPU';
      description += ' El navegador no expuso información suficiente para identificar el fabricante.';
    }
    $('foxconvertDeviceTitle').textContent = title;
    $('foxconvertDeviceDescription').textContent = description;
    notice.dataset.provider = device.name ? device.name.toLowerCase() : '';
    const logo = $('foxconvertGpuLogo');
    const logoImage = $('foxconvertGpuLogoImage');
    if (device.name) {
      logoImage.src = `/static/foxconvert/gpu/${device.name.toLowerCase()}.png`;
      logoImage.alt = `Logo de ${device.name}`;
      logo.hidden = false;
    } else {
      logo.hidden = true;
      logoImage.removeAttribute('src');
      logoImage.alt = '';
    }
    const deviceIcon = $('foxconvertDeviceIcon');
    const iconPath = deviceIcon.querySelector('path');
    const detectedProvider = Boolean(device.name);
    deviceIcon.dataset.state = detectedProvider ? 'success' : 'warning';
    iconPath.setAttribute('d', detectedProvider
      ? 'M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z'
      : 'M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z');
  }

  function loadEngine() {
    if (!enginePromise) {
      enginePromise = new Promise((resolve, reject) => {
        if (window.FoxConvertEngine) {
          initializeAudioEncoders(window.FoxConvertEngine).then(resolve, reject);
          return;
        }
        const script = document.createElement('script');
        script.src = '/static/foxconvert/mediabunny.bundle.js?v=1.65.2-flac-compression';
        script.onload = () => initializeAudioEncoders(window.FoxConvertEngine).then(resolve, reject);
        script.onerror = () => {
          enginePromise = null;
          reject(new Error('No se pudo cargar el motor local de conversión.'));
        };
        document.head.append(script);
      });
    }
    return enginePromise;
  }

  async function initializeAudioEncoders(engine) {
    engine.registerAacEncoder();
    engine.registerFlacEncoder();
    for (const [codec, register] of [['mp3', engine.registerMp3Encoder]]) {
      if (!(await engine.canEncodeAudio(codec))) register();
    }
    return engine;
  }

  function outputName(file, extension) {
    const requested = $('foxconvertOutputName').value.trim();
    const safeName = (requested || file.name.replace(/\.[^.]+$/, '') || 'archivo')
      .replace(/\.(?:jpg|jpeg|png|webp|avif|bmp|mp4|mov|mkv|webm|m4a|mp3|wav|flac|ogg)$/i, '')
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
      .replace(/[. ]+$/, '')
      .trim();
    return `${safeName || 'archivo'}.${extension}`;
  }

  function selectedFormatDefinition(outputFormat = formatSelect.value) {
    const definitions = category === 'audio' || isVideoAudioOnly() ? formats.audio : formats[category];
    return definitions.find(item => item.value === outputFormat);
  }

  function supportsAvifEncoding() {
    try {
      return document.createElement('canvas').toDataURL('image/avif').startsWith('data:image/avif,');
    } catch (error) {
      console.debug('FoxConvert no pudo comprobar la codificación AVIF.', error);
      return false;
    }
  }

  function selectedOutputFormat() {
    return category === 'audio' || isVideoAudioOnly()
      ? audioFormatByCodec[audioCodecSelect.value]
      : formatSelect.value;
  }

  function outputMimeType(outputFormat) {
    if (outputFormat.startsWith('image/')) return outputFormat;
    return selectedFormatDefinition(outputFormat).mimeType;
  }

  function savePickerOptions(file, outputFormat) {
    const definition = selectedFormatDefinition(outputFormat);
    const extension = definition.extension;
    return {
      suggestedName: outputName(file, extension),
      types: [{
        description: `${definition.label} multimedia`,
        accept: { [outputMimeType(outputFormat)]: [`.${extension}`] }
      }]
    };
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  async function saveBlob(fileHandle, blob) {
    const writable = await fileHandle.createWritable();
    try {
      await writable.write(blob);
      await writable.close();
    } catch (error) {
      try {
        await writable.abort(error);
      } catch (abortError) {
        console.warn('FoxConvert no pudo cancelar la escritura local.', abortError);
      }
      throw error;
    }
  }

  async function conversionSettings(engine, outputFormat, hardwareAcceleration, target, settings) {
    const definition = selectedFormatDefinition(outputFormat);
    const Format = engine[definition.engineClass];
    if (!Format) throw new Error(`El motor no incluye el contenedor ${definition.label}.`);
    const format = ['Mp4OutputFormat', 'MovOutputFormat'].includes(definition.engineClass)
      ? new Format({ fastStart: 'fragmented' })
      : new Format();
    const output = new engine.Output({ format, target });
    const input = new engine.Input({
      formats: engine.ALL_FORMATS,
      source: new engine.BlobSource(selectedFile)
    });
    const options = {
      input,
      output,
      tracks: 'primary',
      copy: false
    };
    if (category === 'video' && !isVideoAudioOnly()) {
      const customSize = qualitySelect.value === 'custom';
      const height = ['original', 'custom'].includes(qualitySelect.value) ? undefined : Number(qualitySelect.value);
      options.video = {
        codec: settings.videoCodec,
        bitrate: Number(settings.bitrate) * 1000,
        hardwareAcceleration,
        ...(customSize ? {
          width: Number(widthInput.value),
          height: Number(heightInput.value),
          fit: fitSelect.value
        } : {}),
        ...(height ? { height } : {})
      };
      options.audio = losslessAudioCodecs.has(settings.audioCodec)
        ? { codec: settings.audioCodec }
        : { codec: settings.audioCodec, bitrate: Number(settings.bitrateAudio) * 1000 };
    } else if (isVideoAudioOnly()) {
      options.video = { discard: true };
      options.audio = losslessAudioCodecs.has(settings.audioCodec)
        ? { codec: settings.audioCodec }
        : { codec: settings.audioCodec, bitrate: Number(settings.bitrateAudio) * 1000 };
    } else {
      options.audio = losslessAudioCodecs.has(settings.audioCodec)
        ? { codec: settings.audioCodec }
        : { codec: settings.audioCodec, bitrate: Number(settings.bitrate) * 1000 };
    }
    try {
      return await engine.Conversion.init(options);
    } catch (error) {
      input.dispose();
      throw error;
    }
  }

  async function convertImage(file, outputFormat) {
    if (file.name.toLowerCase().endsWith('.gif')) {
      throw new Error('Los GIF animados no se admiten todavía. Convierte una imagen estática.');
    }
    const bitmap = await createImageBitmap(file);
    try {
      if (cancelRequested) return;
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('El navegador no pudo preparar el lienzo de imagen.');
      if (['image/jpeg', 'image/bmp'].includes(outputFormat)) {
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(bitmap, 0, 0);
      if (outputFormat === 'image/bmp') return encodeBmp(context, canvas.width, canvas.height);
      const qualityValue = qualitySelect.value === 'custom'
        ? Number(imageQualityInput.value)
        : Number(qualitySelect.value);
      const quality = qualityValue / 100;
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(result => result ? resolve(result) : reject(new Error('El navegador no pudo codificar esta imagen.')), outputFormat, quality);
      });
      if (blob.type !== outputFormat) {
        throw new Error(`Este navegador no pudo codificar la imagen como ${outputFormat.split('/')[1].toUpperCase()}.`);
      }
      return blob;
    } finally {
      bitmap.close();
    }
  }

  function encodeBmp(context, width, height) {
    const pixels = context.getImageData(0, 0, width, height).data;
    const rowSize = Math.ceil(width * 3 / 4) * 4;
    const pixelBytes = rowSize * height;
    const buffer = new ArrayBuffer(54 + pixelBytes);
    const view = new DataView(buffer);
    view.setUint8(0, 0x42);
    view.setUint8(1, 0x4d);
    view.setUint32(2, buffer.byteLength, true);
    view.setUint32(10, 54, true);
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    view.setUint32(34, pixelBytes, true);
    for (let y = 0; y < height; y++) {
      const sourceRow = (height - 1 - y) * width * 4;
      const targetRow = 54 + y * rowSize;
      for (let x = 0; x < width; x++) {
        const source = sourceRow + x * 4;
        const target = targetRow + x * 3;
        view.setUint8(target, pixels[source + 2]);
        view.setUint8(target + 1, pixels[source + 1]);
        view.setUint8(target + 2, pixels[source]);
      }
    }
    return new Blob([buffer], { type: 'image/bmp' });
  }

  async function convertMedia(file, outputFormat, conversionOptions, fileHandle) {
    const audioOnly = isVideoAudioOnly();
    const encoderAvailable = category === 'audio' || audioOnly
      ? typeof AudioEncoder !== 'undefined' && typeof AudioDecoder !== 'undefined'
      : typeof VideoEncoder !== 'undefined' && typeof VideoDecoder !== 'undefined';
    if (!encoderAvailable) {
      throw new Error('Este navegador no ofrece WebCodecs para convertir este tipo de archivo. Prueba con una versión reciente de Chrome, Edge o Safari.');
    }
    const engine = await loadEngine();
    if (cancelRequested) return null;
    if (conversionOptions.audioCodec === 'flac') {
      engine.setFlacCompressionLevel(Number(conversionOptions.flacCompression));
    }
    setIndeterminateProgress('Preparando conversión…');
    const hardwareModes = category === 'video' && !audioOnly
      ? ['prefer-hardware', 'no-preference', 'prefer-software']
      : ['no-preference'];

    async function runConversion(hardwareAcceleration) {
      resetConversionProgress();
      const writable = fileHandle ? await fileHandle.createWritable() : null;
      const bufferTarget = writable ? null : new engine.BufferTarget();
      const target = writable ? new engine.StreamTarget(writable) : bufferTarget;
      let conversion;
      try {
        conversion = await conversionSettings(engine, outputFormat, hardwareAcceleration, target, conversionOptions);
        currentConversion = conversion;
        conversion.onProgress = updateConversionProgress;
        if (!conversion.isValid) {
          const undecodableAudio = audioOnly && conversion.discardedTracks.some(({ track, reason }) =>
            track.type === 'audio' && reason === 'undecodable_source_codec');
          const error = new Error(undecodableAudio
            ? 'Este navegador no puede decodificar el códec de audio de este video. Prueba con un navegador compatible con ese códec.'
            : 'El navegador no admite la configuración de conversión seleccionada.');
          error.name = 'NotSupportedError';
          throw error;
        }
        if (cancelRequested) {
          await conversion.cancel();
          const error = new Error('Conversión cancelada.');
          error.name = 'ConversionCanceledError';
          throw error;
        }
        await conversion.execute();
        return writable
          ? { saved: true }
          : { blob: new Blob([bufferTarget.buffer], { type: outputMimeType(outputFormat) }) };
      } catch (error) {
        if (writable) {
          try {
            await writable.abort(error);
          } catch (abortError) {
            console.warn('FoxConvert no pudo cancelar la escritura local.', abortError);
          }
        }
        throw error;
      } finally {
        conversion?.input.dispose();
        currentConversion = null;
      }
    }

    for (let attempt = 0; attempt < hardwareModes.length; attempt++) {
      try {
        return await runConversion(hardwareModes[attempt]);
      } catch (error) {
        const unsupported = error?.name === 'NotSupportedError'
          || /not supported in this environment|unsupported.*config|config.*not supported/i.test(error?.message || '');
        if (!unsupported || attempt === hardwareModes.length - 1) {
          if (unsupported && audioOnly) throw error;
          if (unsupported) {
            throw new Error('El navegador no admite este códec con la resolución o el bitrate seleccionados. Prueba reducir estos parámetros o elegir otro códec.');
          }
          throw error;
        }
        if (cancelRequested) throw error;
        $('foxconvertProgressLabel').textContent = 'La aceleración por GPU no admite estos parámetros; intentando con otro modo…';
      }
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!selectedFile || busy) return;
    const sourceFile = selectedFile;
    busy = true;
    fileInput.disabled = true;
    $('foxconvertClearFile').disabled = true;
    cancelRequested = false;
    startButton.disabled = true;
    conversionControls.forEach(control => { control.disabled = true; });
    cancelButton.hidden = false;
    progressWrap.hidden = false;
    resetConversionProgress();
    progressLabel.hidden = false;
    setIndeterminateProgress(category === 'image' ? 'Convirtiendo imagen…' : 'Preparando conversión…');
    setStatus('');
    let completed = false;
    try {
      const outputFormat = selectedOutputFormat();
      const conversionOptions = {
        videoCodec: videoCodecSelect.value,
        audioCodec: audioCodecSelect.value,
        flacCompression: flacCompressionSelect.value,
        bitrate: bitrateInput.value,
        bitrateAudio: category === 'video' ? audioBitrateInput.value : bitrateInput.value,
        width: widthInput.value,
        height: heightInput.value,
        fit: fitSelect.value
      };
      const fileHandle = savePickerSupported
        ? await window.showSaveFilePicker(savePickerOptions(sourceFile, outputFormat))
        : null;
      let result;
      if (category === 'image') {
        result = await convertImage(sourceFile, outputFormat);
        if (result && !cancelRequested) {
          progressLabel.textContent = 'Guardando imagen…';
          if (fileHandle) {
            await saveBlob(fileHandle, result);
            result = { saved: true };
          } else {
            downloadBlob(result, outputName(sourceFile, selectedFormatDefinition(outputFormat).extension));
            result = { saved: true, downloaded: true };
          }
        }
      } else {
        $('foxconvertProgressLabel').textContent = fileHandle
          ? 'Convirtiendo y guardando directamente en la ubicación elegida…'
          : 'Convirtiendo y preparando la descarga…';
        result = await convertMedia(sourceFile, outputFormat, conversionOptions, fileHandle);
        if (result?.blob && !cancelRequested) {
          downloadBlob(result.blob, outputName(sourceFile, selectedFormatDefinition(outputFormat).extension));
          result = { saved: true, downloaded: true };
        }
      }
      if (cancelRequested) {
        setStatus('Conversión cancelada.', true);
      } else if (result?.saved) {
        progressElement.classList.remove('is-indeterminate');
        progressElement.setAttribute('aria-valuenow', '100');
        progressFill.style.width = '100%';
        progressValue.textContent = '100%';
        setStatus('Conversión completada.');
        completed = true;
      }
    } catch (error) {
      if (cancelRequested || error.name === 'ConversionCanceledError') {
        setStatus('Conversión cancelada.', true);
      } else if (error.name === 'AbortError') {
        setStatus('Guardado cancelado.', true);
      } else {
        console.error('FoxConvert no pudo completar la conversión.', error);
        setStatus(error.message || 'No se pudo convertir este archivo.', true);
      }
    } finally {
      currentConversion = null;
      busy = false;
      fileInput.disabled = false;
      $('foxconvertClearFile').disabled = false;
      conversionControls.forEach(control => { control.disabled = !selectedFile; });
      formatSelect.disabled = category === 'audio' || isVideoAudioOnly();
      updateQualityOptions();
      startButton.disabled = !selectedFile
        || (category !== 'image' && (!audioCodecSelect.value
          || (category === 'video' && !isVideoAudioOnly() && !videoCodecSelect.value)));
      cancelButton.hidden = true;
      cancelButton.disabled = false;
      const cancelled = cancelRequested || statusText.textContent === 'Guardado cancelado.';
      if (completed) {
        progressElement.classList.remove('is-indeterminate');
        progressElement.setAttribute('aria-valuenow', '100');
        progressFill.style.width = '100%';
        progressValue.textContent = '100%';
        progressLabel.hidden = true;
      } else if (cancelled) {
        progressWrap.hidden = true;
        resetConversionProgress();
        progressLabel.textContent = '';
        progressLabel.hidden = true;
      } else {
        progressElement.classList.remove('is-indeterminate');
        const percent = Math.min(conversionProgressPercent, 99);
        progressElement.setAttribute('aria-valuenow', String(percent));
        progressFill.style.width = `${percent}%`;
        progressValue.textContent = conversionProgressPercent ? `${Math.min(conversionProgressPercent, 99)}%` : '';
        progressLabel.textContent = cancelRequested ? 'Conversión cancelada' : 'Conversión detenida';
        progressLabel.hidden = false;
      }
      if (clearFileAfterConversion) {
        clearFileAfterConversion = false;
        clearFile();
      }
    }
  });

  fileInput.addEventListener('change', () => selectFile(fileInput.files[0]));
  $('foxconvertClearFile').addEventListener('click', clearFile);
  profileSelect.addEventListener('change', () => {
    if (profileSelect.value !== 'custom') applyProfile(profileSelect.value);
  });
  formatSelect.addEventListener('change', () => {
    markProfileCustom();
    updateQualityOptions();
    setStatus('');
    void updateCodecOptions();
  });
  videoOutputModeSelect.addEventListener('change', () => {
    markProfileCustom();
    updateQualityOptions();
    $('foxconvertSettingsHint').textContent = isVideoAudioOnly()
      ? 'Se extraerá el audio del video y se guardará únicamente en el formato del códec de audio seleccionado.'
      : 'Los códecs se filtran según el contenedor y lo que este navegador informa como compatible. La conversión final también depende del archivo y el dispositivo.';
    if (!savePickerSupported) {
      $('foxconvertSettingsHint').textContent += ' Sin selector de carpeta, el resultado se descargará con el sistema habitual del navegador; audio y video usarán memoria temporal.';
    }
    setStatus('');
    void updateCodecOptions();
  });
  qualitySelect.addEventListener('change', () => {
    markProfileCustom();
    updateQualityOptions();
  });
  [bitrateInput, audioBitrateInput, widthInput, heightInput, fitSelect, imageQualityInput].forEach(control => {
    control.addEventListener('change', () => {
      markProfileCustom();
    });
  });
  [videoCodecSelect, audioCodecSelect].forEach(control => {
    control.addEventListener('change', () => {
      markProfileCustom();
      updateQualityOptions();
    });
    flacCompressionSelect.addEventListener('change', markProfileCustom);
  });
  cancelButton.addEventListener('click', async () => {
    cancelRequested = true;
    cancelButton.disabled = true;
    setStatus('Cancelando conversión…', true);
    if (currentConversion) await currentConversion.cancel();
  });
  dropzone.addEventListener('dragover', event => {
    event.preventDefault();
    dropzone.classList.add('is-dragging');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragging'));
  dropzone.addEventListener('drop', event => {
    event.preventDefault();
    dropzone.classList.remove('is-dragging');
    if (busy) return;
    const file = event.dataTransfer.files[0];
    if (file) selectFile(file);
  });
  window.foxConvertOnEnter = () => {
    allowUnload = false;
    detectDevice();
  };
  window.foxConvertConfirmLeave = () => {
    if (!busy) return Promise.resolve(true);
    if (leavePromptPromise) return leavePromptPromise;

    const previous = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'fox-resume-modal fox-convert-leave-modal';
    dialog.setAttribute('aria-labelledby', 'fcl-title');
    dialog.setAttribute('aria-describedby', 'fcl-description');
    dialog.innerHTML = '<button type="button" class="fr-close" aria-label="Cerrar">×</button><div class="fr-icon" aria-hidden="true"></div><span class="fr-eyebrow">CONVERSIÓN EN CURSO</span><h2 id="fcl-title">¿Salir de FoxConvert?</h2><p class="fr-description" id="fcl-description">Si sales ahora, se cancelará la conversión y se quitará el archivo seleccionado.</p><div class="fr-file"><span class="fr-file-icon" aria-hidden="true">↻</span><span class="fr-file-name"></span></div><div class="fr-actions"><button type="button" class="fr-cancel secondary">Seguir convirtiendo</button><button type="button" class="fr-resume">Salir y cancelar</button></div>';
    dialog.querySelector('.fr-file-name').textContent = selectedFile?.name || 'Conversión en curso';
    document.body.append(dialog);

    const prompt = new Promise(resolve => {
      let finished = false;
      const finish = answer => {
        if (finished) return;
        finished = true;
        if (window.foxCloseDialog) {
          window.foxCloseDialog(dialog).then(() => {
            if (previous?.isConnected) previous.focus();
            resolve(answer);
          });
        } else {
          if (dialog.open) dialog.close();
          dialog.remove();
          if (previous?.isConnected) previous.focus();
          resolve(answer);
        }
      };
      dialog.querySelector('.fr-close').addEventListener('click', () => finish(false));
      dialog.querySelector('.fr-cancel').addEventListener('click', () => finish(false));
      dialog.querySelector('.fr-resume').addEventListener('click', () => finish(true));
      dialog.addEventListener('cancel', event => {
        event.preventDefault();
        finish(false);
      });
      dialog.addEventListener('click', event => {
        if (event.target === dialog) finish(false);
      });
      dialog.showModal();
      dialog.querySelector('.fr-cancel').focus();
    });
    leavePromptPromise = prompt;
    return prompt.finally(() => {
      if (leavePromptPromise === prompt) leavePromptPromise = null;
    });
  };
  window.foxConvertOnLeave = () => {
    allowUnload = true;
    if (busy) {
      clearFileAfterConversion = true;
      cancelRequested = true;
      fileInput.value = '';
      selectedFile = null;
      $('foxconvertFileInfo').hidden = true;
      settings.hidden = true;
      if (currentConversion) currentConversion.cancel();
    } else {
      clearFile();
    }
  };
  window.addEventListener('beforeunload', event => {
    if (!busy || allowUnload) return;
    event.preventDefault();
    event.returnValue = '';
  });
})();
