(() => {
  const $ = id => document.getElementById(id);
  const form = $('foxgetForm');
  const urlInput = $('foxgetUrl');
  const inspectButton = $('foxgetInspect');
  const foxgetMessage = $('foxgetMessage');
  const foxgetMessageText = $('foxgetMessageText');
  const preview = $('foxgetPreview');
  const options = $('foxgetOptions');
  const jobsList = $('foxgetJobs');
  const recentList = $('foxgetRecent');
  const readyList = $('foxgetReady');
  const activeStates = new Set(['queued', 'downloading', 'converting', 'cancelling']);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stateLabels = {
    queued: 'En espera',
    downloading: 'Descargando',
    converting: 'Convirtiendo',
    cancelling: 'Cancelando',
    cancelled: 'Cancelada',
    ready: 'Lista para descargar',
    error: 'Error',
    expired: 'Expirada',
    deleted: 'Eliminada'
  };
  let inspected = null;
  let polling = false;
  const pendingAutoDownloads = new Set();
  let foxgetMessageTimer = 0;
  let foxgetMessageAutoHideTimer = 0;
  let previewTransition = 0;
  let foxgetSectionTransition = 0;
  let foxgetSectionAnimation = null;

  function showMessage(text, type = 'error', autoHideAfter = 0) {
    if (!foxgetMessage || !foxgetMessageText) {
      if (typeof message === 'function') message(text);
      return;
    }
    window.clearTimeout(foxgetMessageTimer);
    window.clearTimeout(foxgetMessageAutoHideTimer);
    if (!text) {
      if (!foxgetMessage.classList.contains('is-visible')) return;
      foxgetMessage.classList.remove('is-visible');
      foxgetMessage.setAttribute('aria-hidden', 'true');
      foxgetMessage.inert = true;
      foxgetMessageTimer = window.setTimeout(() => {
        if (foxgetMessage.classList.contains('is-visible')) return;
        foxgetMessage.hidden = true;
        foxgetMessage.classList.remove('is-error', 'is-info', 'is-success', 'is-loading');
        foxgetMessageText.textContent = '';
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220);
      return;
    }
    foxgetMessageText.textContent = text;
    foxgetMessage.hidden = false;
    foxgetMessage.classList.remove('is-visible');
    foxgetMessage.inert = false;
    foxgetMessage.setAttribute('aria-hidden', 'false');
    foxgetMessage.classList.toggle('is-error', type === 'error');
    foxgetMessage.classList.toggle('is-info', type === 'info' || type === 'cancelled');
    foxgetMessage.classList.toggle('is-success', type === 'success');
    foxgetMessage.classList.toggle('is-loading', type === 'loading');
    foxgetMessage.setAttribute('role', type === 'error' ? 'alert' : 'status');
    const iconPath = foxgetMessage.querySelector('.foxget-message-icon path');
    if (iconPath) {
      iconPath.setAttribute('d', type === 'success'
        ? 'M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z'
        : type === 'cancelled'
          ? 'M9.6 9a2.4 2.4 0 1 1 4.12 1.68c-.95.95-1.72 1.32-1.72 2.82M12 17h.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z'
          : 'M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z');
      iconPath.setAttribute('stroke-linecap', 'round');
      iconPath.setAttribute('stroke-linejoin', 'round');
    }
    void foxgetMessage.offsetWidth;
    requestAnimationFrame(() => foxgetMessage.classList.add('is-visible'));
    if (autoHideAfter > 0) {
      foxgetMessageAutoHideTimer = window.setTimeout(() => {
        showMessage('');
      }, autoHideAfter);
    }
  }

  function animateEntry(element) {
    if (reducedMotion.matches || typeof element.animate !== 'function') return;
    element.animate(
      [{ opacity: 0, transform: 'translateY(8px) scale(.99)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }],
      { duration: 240, easing: 'cubic-bezier(.22,.7,.25,1)' }
    );
  }

  function animateRemoval(element, onRemoved) {
    if (!element.isConnected || element.classList.contains('queue-card-leaving')) return;
    const delay = reducedMotion.matches ? 0 : 280;
    if (delay) {
      element.style.maxHeight = element.getBoundingClientRect().height + 'px';
      element.style.overflow = 'hidden';
      void element.offsetHeight;
      element.classList.add('queue-card-leaving');
    }
    window.setTimeout(() => {
      element.remove();
      onRemoved?.();
    }, delay);
  }

  function hidePreview() {
    const transition = ++previewTransition;
    if (preview.hidden) return;
    if (reducedMotion.matches || typeof preview.animate !== 'function') {
      preview.hidden = true;
      return;
    }
    const animation = preview.animate(
      [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-6px)' }],
      { duration: 180, easing: 'ease-in', fill: 'forwards' }
    );
    animation.onfinish = () => {
      if (transition === previewTransition) preview.hidden = true;
      animation.cancel();
    };
  }

  function setFoxgetSection(section, animate = true) {
    const sectionName = section === 'archivos' ? 'archivos' : 'descargar';
    const tabs = {
      descargar: $('foxget-tab-descargar'),
      archivos: $('foxget-tab-archivos')
    };
    const target = tabs[sectionName];
    const current = Object.values(tabs).find(tab => tab && !tab.hidden);
    document.querySelectorAll('#view-foxget [data-foxget-section]').forEach(link => {
      link.classList.toggle('active', link.dataset.foxgetSection === sectionName);
    });
    if (!target || current === target) return;

    const transition = ++foxgetSectionTransition;
    foxgetSectionAnimation?.cancel();
    foxgetSectionAnimation = null;
    if (!animate || reducedMotion.matches || typeof target.animate !== 'function') {
      if (current) current.hidden = true;
      target.hidden = false;
      return;
    }

    const showTarget = () => {
      if (transition !== foxgetSectionTransition) return;
      if (current) current.hidden = true;
      target.hidden = false;
      const enter = target.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 220, easing: 'cubic-bezier(.22,.7,.25,1)' }
      );
      foxgetSectionAnimation = enter;
      enter.finished.then(() => {
        if (transition === foxgetSectionTransition) foxgetSectionAnimation = null;
        enter.cancel();
      }).catch(() => {});
    };

    if (!current || typeof current.animate !== 'function') {
      showTarget();
      return;
    }
    const exit = current.animate(
      [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-6px)' }],
      { duration: 180, easing: 'ease-in', fill: 'forwards' }
    );
    foxgetSectionAnimation = exit;
    exit.finished.then(() => {
      exit.cancel();
      showTarget();
    }).catch(() => {});
  }

  function apiRequest(path, method = 'GET', body) {
    if (typeof api !== 'function') {
      return Promise.reject(new Error('FoxGet aún se está iniciando. Recarga la página e inténtalo de nuevo.'));
    }
    return api('/foxget' + path, method, body);
  }

  function setHidden(element, hidden) {
    if (element) element.hidden = hidden;
  }

  function formatSize(value) {
    let size = Number(value) || 0;
    for (const unit of ['B', 'KB', 'MB', 'GB']) {
      if (size < 1000 || unit === 'GB') {
        return (unit === 'B' ? String(size) : size.toFixed(1).replace(/\.0$/, '')) + ' ' + unit;
      }
      size /= 1000;
    }
  }

  function formatDuration(value) {
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds < 0) return '';
    const minutes = Math.floor(seconds / 60);
    return minutes + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
  }

  function formatTimestamp(value) {
    if (value === null || value === undefined || value === '') return '';
    const timestamp = Number(value);
    if (!Number.isFinite(timestamp)) return '';
    return new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(timestamp * 1000));
  }

  function formatTimeRemaining(value) {
    const seconds = Math.max(0, Math.ceil(Number(value) - Date.now() / 1000));
    if (seconds < 60) return seconds + ' s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return minutes + ' min' + (remainingSeconds ? ' ' + remainingSeconds + ' s' : '');
    return Math.floor(minutes / 60) + ' h ' + (minutes % 60) + ' min';
  }

  function formatExpiryLabel(job) {
    return 'Expira en ' + formatTimeRemaining(job.expiresAt);
  }

  function videoCodecs(info) {
    const available = new Set((info.videoFormats || []).map(format => format.codecKey).filter(Boolean));
    const labels = { auto: 'Automático', h264: 'H.264', h265: 'H.265', vp9: 'VP9', av1: 'AV1' };
    return ['auto', ...['h264', 'h265', 'vp9', 'av1'].filter(codec => available.has(codec))]
      .map(value => ({ value, label: labels[value] }));
  }

  const actionIcons = {
    video: '<svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M22 8.93v6.14c0 .61-.67.97-1.17.63L16 12.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6.5l4.83-3.2c.5-.34 1.17.02 1.17.63Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    download: '<svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0 5-5m-5 5-5-5M4 17v3h16v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    audio: '<svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M9 18V5l12-2v13M9 18c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2Zm12-2c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2ZM9 9l12-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    image: '<svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="1.8"/><path d="m21 15-5-5L5 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  const platformIcons = {
    youtube: { src: '/static/youtube.ico', alt: 'YouTube' },
    tiktok: { src: '/static/tiktok.ico', alt: 'TikTok' },
    instagram: { src: '/static/instagram.ico', alt: 'Instagram' },
    x: { src: '/static/x.svg', alt: 'X' }
  };

  function makeActionButton(text, icon, className, action, quality = 'best', codecSelect = null, qualitySelect = null) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'foxget-action-button ' + className;
    button.insertAdjacentHTML('afterbegin', actionIcons[icon]);
    const label = document.createElement('span');
    label.textContent = text;
    button.append(label);
    button.addEventListener('click', () => createDownload(action, qualitySelect?.value || quality, codecSelect?.value || 'auto', button));
    return button;
  }

  function makeActionGroup(title, className) {
    const group = document.createElement('div');
    group.className = 'foxget-option-group';
    if (title) {
      const heading = document.createElement('h4');
      heading.textContent = title;
      group.append(heading);
    }
    const grid = document.createElement('div');
    grid.className = 'foxget-action-grid ' + className;
    group.append(grid);
    return { group, grid };
  }

  function renderOptions(info) {
    options.replaceChildren();
    const videoFormats = info.videoFormats || [];
    const hasVideo = !info.isImage && videoFormats.length > 0;
    const codecLabel = document.createElement('label');
    codecLabel.className = 'foxget-codec-control';
    const codecCaption = document.createElement('span');
    codecCaption.textContent = 'Códec';
    const codecSelect = document.createElement('select');
    codecSelect.setAttribute('aria-label', 'Códec de video');
    for (const codec of videoCodecs(info)) {
      const option = document.createElement('option');
      option.value = codec.value;
      option.textContent = codec.label;
      codecSelect.append(option);
    }
    codecLabel.append(codecCaption, codecSelect);
    setHidden(codecLabel, !hasVideo);
    options.append(codecLabel);

    const choices = {
      youtube: ['youtube_video', 'youtube_audio'],
      tiktok: ['tiktok_nowatermark', 'tiktok_watermark', 'tiktok_audio'],
      instagram: info.isImage ? ['instagram_image'] : ['instagram_video', 'instagram_audio'],
      x: ['x_video', 'x_audio']
    }[info.platform] || [];

    if (info.platform === 'youtube') {
      const qualities = [...new Set((info.qualities || []).map(value => String(value).replace(/p$/i, '')).filter(value => /^\d+$/.test(value)))];
      if (!qualities.length) qualities.push('best');
      const resolutionLabel = document.createElement('label');
      resolutionLabel.className = 'foxget-codec-control';
      const resolutionCaption = document.createElement('span');
      resolutionCaption.textContent = 'Resolución';
      const resolutionSelect = document.createElement('select');
      resolutionSelect.className = 'foxget-quality-select';
      resolutionSelect.setAttribute('aria-label', 'Resolución de video');
      qualities.forEach(quality => {
        const option = document.createElement('option');
        option.value = quality;
        option.textContent = quality === 'best' ? 'Mejor calidad' : quality + 'p';
        resolutionSelect.append(option);
      });
      resolutionLabel.append(resolutionCaption, resolutionSelect);
      setHidden(resolutionLabel, !hasVideo);
      options.append(resolutionLabel);
      if (choices.includes('youtube_video')) {
        options.append(makeActionButton(
          'Descargar video MP4',
          'video',
          'foxget-action-primary',
          'youtube_video',
          'best',
          codecSelect,
          resolutionSelect
        ));
      }
      const audioGroup = makeActionGroup('Descargar audio MP3', 'foxget-youtube-audio-grid');
      ['320K', '192K', '128K'].forEach(quality => {
        audioGroup.grid.append(makeActionButton(quality, 'audio', 'foxget-action-audio', 'youtube_audio', quality));
      });
      if (choices.includes('youtube_audio')) options.append(audioGroup.group);
      return;
    }

    const grid = makeActionGroup('', 'foxget-platform-action-grid');
    if (choices.includes('tiktok_nowatermark')) {
      grid.grid.classList.add('foxget-action-grid-tiktok');
      grid.grid.append(makeActionButton('Descargar sin marca', 'download', 'foxget-action-primary foxget-action-no-watermark', 'tiktok_nowatermark', 'best', codecSelect));
      grid.grid.append(makeActionButton('Descargar con marca', 'download', 'foxget-action-secondary', 'tiktok_watermark', 'best', codecSelect));
      grid.grid.append(makeActionButton('Descargar audio MP3', 'audio', 'foxget-action-audio', 'tiktok_audio'));
    } else {
      const videoAction = choices.find(action => action.endsWith('_video'));
      const audioAction = choices.find(action => action.endsWith('_audio'));
      const imageAction = choices.find(action => action.endsWith('_image'));
      const actions = [videoAction, audioAction, imageAction].filter(Boolean);
      if (['instagram', 'x'].includes(info.platform) && actions.length === 2) {
        grid.grid.classList.add('foxget-action-grid-single');
      } else if (actions.length === 2) {
        grid.grid.classList.add('foxget-action-grid-dual');
      } else if (actions.length === 1) {
        grid.grid.classList.add('foxget-action-grid-single');
      }
      actions.forEach(action => {
        const image = action.endsWith('_image');
        const audio = action.endsWith('_audio');
        const label = image ? 'Descargar imagen' : audio ? 'Descargar audio MP3' : 'Descargar video MP4';
        grid.grid.append(makeActionButton(
          label,
          image ? 'image' : audio ? 'audio' : 'video',
          !audio && !image ? 'foxget-action-primary' : audio ? 'foxget-action-audio' : 'foxget-action-secondary',
          action,
          'best',
          codecSelect
        ));
      });
    }
    if (choices.length) options.append(grid.group);
  }

  async function createDownload(action, quality, codec, button) {
    if (!inspected || button.disabled) return;
    button.disabled = true;
    const label = button.querySelector('span');
    const originalText = label?.textContent || '';
    if (label) label.textContent = 'Añadiendo…';
    try {
      const result = await apiRequest('', 'POST', {
        url: urlInput.value.trim(),
        action,
        quality,
        codec,
        title: inspected.title
      });
      if (!result.id) throw new Error('El servidor no devolvió el identificador de la descarga.');
      pendingAutoDownloads.add(result.id);
      showMessage('Descarga añadida. Se descargará automáticamente cuando el archivo esté listo.', 'info');
      await refreshJobs();
      watchJobs();
    } catch (error) {
      showMessage(error.message || 'No se pudo crear la descarga.');
    } finally {
      button.disabled = false;
      if (label) label.textContent = originalText;
    }
  }

  function renderPreview(info) {
    previewTransition++;
    inspected = info;
    $('foxgetPreviewTitle').textContent = info.title || 'Contenido';
    $('foxgetUploader').textContent = info.uploader || '';
    $('foxgetPlatformText').textContent = ({ youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram', x: 'X' })[info.platform] || info.platform;

    const thumbnail = $('foxgetThumb');
    if (info.thumbnail) {
      thumbnail.src = info.thumbnail;
      thumbnail.hidden = false;
    } else {
      thumbnail.removeAttribute('src');
      thumbnail.hidden = true;
    }

    const duration = formatDuration(info.duration);
    $('foxgetDuration').textContent = duration;
    setHidden($('foxgetDurationItem'), !duration);

    const heights = (info.videoFormats || []).map(format => Number(format.height)).filter(Number.isFinite);
    const maxHeight = heights.length ? Math.max(...heights) : 0;
    $('foxgetResolution').textContent = maxHeight ? maxHeight + 'p' : '';
    $('foxgetCodecSummary').textContent = [...new Set((info.videoFormats || []).map(format => format.codec).filter(Boolean))].join(' · ');
    setHidden($('foxgetResolutionItem'), !maxHeight);
    setHidden($('foxgetPreviewTech'), !maxHeight && !$('foxgetCodecSummary').textContent);

    const platformIcon = $('foxgetPlatformIcon');
    const icon = platformIcons[info.platform];
    if (icon) {
      platformIcon.src = icon.src;
      platformIcon.alt = icon.alt;
      platformIcon.hidden = false;
    } else {
      platformIcon.hidden = true;
      platformIcon.removeAttribute('src');
    }
    renderOptions(info);
    preview.hidden = false;
    animateEntry(preview);
    urlInput.disabled = true;
    inspectButton.textContent = 'Cambiar enlace';
  }

  function renderCard(job, compact = false) {
    const card = document.createElement('article');
    card.className = 'queue-card foxget-job-card';
    card.dataset.jobId = job.id;
    card.dataset.state = job.state;
    const title = document.createElement('strong');
    title.textContent = job.title || job.fileName || job.sourceUrl || 'Descarga';
    card.append(title);
    const detail = document.createElement('p');
    detail.className = 'file-meta';
    const parts = [stateLabels[job.state] || job.state];
    if (job.format) parts.push(job.format.replaceAll('_', ' '));
    if (job.fileSize) parts.push(formatSize(job.fileSize));
    detail.textContent = parts.join(' · ');
    card.append(detail);

    if (activeStates.has(job.state)) {
      const progressValue = Math.max(0, Math.min(100, Number(job.progress) || 0));
      const progressRow = document.createElement('div');
      progressRow.className = 'foxget-progress-row';
      const hasProgress = job.state === 'downloading' && progressValue > 0;
      let progress;
      if (hasProgress) {
        progress = document.createElement('progress');
        progress.className = 'foxget-download-progress';
        progress.max = 100;
        progress.value = progressValue;
        progress.setAttribute('aria-label', 'Progreso de ' + (job.title || 'la descarga'));
      } else {
        progress = document.createElement('div');
        progress.className = 'foxget-progress-indeterminate';
        progress.setAttribute('role', 'progressbar');
        progress.setAttribute('aria-label', 'Progreso de ' + (job.title || 'la descarga'));
      }
      const progressLabel = document.createElement('span');
      progressLabel.className = 'foxget-progress-label';
      progressLabel.textContent = job.state === 'downloading' && hasProgress
        ? progressValue.toLocaleString('es-ES', { maximumFractionDigits: 1 }) + '%'
        : job.state === 'downloading' ? 'Preparando…' : (stateLabels[job.state] || job.state) + '…';
      progressRow.append(progress, progressLabel);
      card.append(progressRow);
    } else if (job.state === 'error' && job.error) {
      const error = document.createElement('p');
      error.className = 'queue-state';
      error.textContent = job.error;
      card.append(error);
    }

    if (compact) {
      const historyInfo = document.createElement('p');
      historyInfo.className = 'foxget-history-meta';
      const registeredAt = formatTimestamp(job.createdAt);
      if (registeredAt) historyInfo.append(document.createTextNode('Registrado: ' + registeredAt));
      if (historyInfo.childNodes.length) card.append(historyInfo);
    } else if (job.state === 'ready' && job.expiresAt !== null && job.expiresAt !== undefined && Number.isFinite(Number(job.expiresAt))) {
      const expiry = document.createElement('p');
      expiry.className = 'foxget-history-meta foxget-file-expiry';
      expiry.dataset.expiresAt = String(job.expiresAt);
      expiry.dataset.firstDownloadAt = job.firstDownloadAt ?? '';
      expiry.textContent = formatExpiryLabel(job);
      card.append(expiry);
    }

    const actions = document.createElement('div');
    actions.className = 'foxget-file-actions';
    if (job.state === 'ready' && !compact) {
      const download = document.createElement('a');
      download.className = 'button foxget-btn foxget-file-download';
      download.href = '/api/foxget/' + encodeURIComponent(job.id) + '/download';
      download.textContent = 'Descargar';
      actions.append(download);
    }
    if (activeStates.has(job.state) && job.state !== 'cancelling') {
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'secondary small';
      cancel.textContent = 'Cancelar';
      cancel.addEventListener('click', async () => {
        cancel.disabled = true;
        try {
          await apiRequest('/' + encodeURIComponent(job.id) + '/cancel', 'POST', {});
          pendingAutoDownloads.delete(job.id);
          showMessage('Descarga cancelada.', 'cancelled', 5000);
          await refreshJobs();
        } catch (error) {
          showMessage(error.message || 'No se pudo cancelar la descarga.');
        } finally {
          cancel.disabled = false;
        }
      });
      actions.append(cancel);
    }
    if (!compact && !activeStates.has(job.state) && job.state !== 'expired' && job.state !== 'deleted') {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'secondary small foxget-remove-button';
      remove.textContent = 'Eliminar';
      remove.addEventListener('click', async () => {
        remove.disabled = true;
        try {
          await apiRequest('/' + encodeURIComponent(job.id), 'DELETE');
          animateRemoval(card, () => {
            refreshJobs().catch(error => showMessage(error.message || 'No se pudieron actualizar tus archivos.'));
          });
        } catch (error) {
          showMessage(error.message || 'No se pudo eliminar el trabajo.');
        } finally {
          remove.disabled = false;
        }
      });
      actions.append(remove);
    }
    if (actions.childElementCount) card.append(actions);
    return card;
  }

  function updateCardProgress(card, job) {
    if (!activeStates.has(job.state)) return;
    const progressValue = Math.max(0, Math.min(100, Number(job.progress) || 0));
    const progressRow = card.querySelector('.foxget-progress-row');
    let progress = progressRow?.querySelector('progress, .foxget-progress-indeterminate');
    const label = progressRow?.querySelector('.foxget-progress-label');
    if (!progress || !label) return;
    const hasProgress = job.state === 'downloading' && progressValue > 0;
    if (hasProgress && !(progress instanceof HTMLProgressElement)) {
      const determinate = document.createElement('progress');
      determinate.className = 'foxget-download-progress';
      determinate.max = 100;
      determinate.setAttribute('aria-label', 'Progreso de ' + (job.title || 'la descarga'));
      progress.replaceWith(determinate);
      progress = determinate;
    } else if (!hasProgress && progress instanceof HTMLProgressElement) {
      const indeterminate = document.createElement('div');
      indeterminate.className = 'foxget-progress-indeterminate';
      indeterminate.setAttribute('role', 'progressbar');
      indeterminate.setAttribute('aria-label', 'Progreso de ' + (job.title || 'la descarga'));
      progress.replaceWith(indeterminate);
      progress = indeterminate;
    }
    if (hasProgress && progress instanceof HTMLProgressElement) {
      progress.value = progressValue;
      label.textContent = progressValue.toLocaleString('es-ES', { maximumFractionDigits: 1 }) + '%';
      return;
    }
    label.textContent = job.state === 'downloading' ? 'Preparando…' : (stateLabels[job.state] || job.state) + '…';
  }

  function updateCardExpiry(card, job) {
    const expiry = card.querySelector('[data-expires-at]');
    if (!expiry) return;
    expiry.textContent = formatExpiryLabel(job);
    expiry.classList.toggle('foxget-file-expiry-urgent', Number(job.expiresAt) - Date.now() / 1000 <= 60);
  }

  function animateExpiredCard(card) {
    if (card.classList.contains('foxget-expiring')) return;
    card.classList.add('foxget-expiring');
    const delay = reducedMotion.matches ? 0 : 550;
    window.setTimeout(() => {
      card.remove();
      if (!readyList.querySelector('.foxget-job-card')) setEmptyState(readyList, 'No hay archivos disponibles para descargar.');
      const count = readyList.querySelectorAll('.foxget-job-card').length;
      $('foxgetReadyCount').textContent = count + (count === 1 ? ' archivo' : ' archivos');
    }, delay);
  }

  function syncList(container, jobs, compact, emptyMessage) {
    const renderEmptyMessage = container !== jobsList;
    const existing = new Map(
      [...container.querySelectorAll(':scope > .foxget-job-card')].map(card => [card.dataset.jobId, card])
    );
    if (!jobs.length) {
      for (const card of existing.values()) {
        const expiry = Number(card.querySelector('[data-expires-at]')?.dataset.expiresAt);
        if (container === readyList && Number.isFinite(expiry) && expiry <= Date.now() / 1000) animateExpiredCard(card);
        else animateRemoval(card, () => {
          if (!renderEmptyMessage) return;
          if (!container.querySelector(':scope > .foxget-job-card') && !container.querySelector(':scope > .empty-state')) {
            setEmptyState(container, emptyMessage);
          }
        });
      }
      if (renderEmptyMessage && !container.querySelector(':scope > .foxget-job-card') && !container.querySelector(':scope > .empty-state')) {
        setEmptyState(container, emptyMessage);
      }
      return;
    }
    const emptyState = container.querySelector(':scope > .empty-state');
    if (emptyState) animateRemoval(emptyState);

    const desiredIds = [];
    for (const job of jobs) {
      desiredIds.push(job.id);
      let card = existing.get(job.id);
      const signature = JSON.stringify([
        job.state, job.title, job.fileName, job.sourceUrl, job.format,
        job.fileSize, job.error, job.createdAt, job.expiresAt, job.firstDownloadAt
      ]);
      if (!card || card.dataset.renderSignature !== signature) {
        const replacement = renderCard(job, compact);
        replacement.dataset.renderSignature = signature;
        if (card) {
          card.replaceWith(replacement);
          animateEntry(replacement);
        }
        else {
          container.append(replacement);
          animateEntry(replacement);
        }
        card = replacement;
      } else {
        updateCardProgress(card, job);
        updateCardExpiry(card, job);
      }
      existing.delete(job.id);
    }
    for (const card of existing.values()) {
      const expiry = Number(card.querySelector('[data-expires-at]')?.dataset.expiresAt);
      if (container === readyList && Number.isFinite(expiry) && expiry <= Date.now() / 1000) animateExpiredCard(card);
      else animateRemoval(card, () => {
        if (!renderEmptyMessage) return;
        if (!container.querySelector(':scope > .foxget-job-card') && !container.querySelector(':scope > .empty-state')) {
          setEmptyState(container, emptyMessage);
        }
      });
    }
    const currentIds = [...container.querySelectorAll(':scope > .foxget-job-card')].map(card => card.dataset.jobId);
    if (desiredIds.some((id, index) => currentIds[index] !== id)) {
      for (const id of desiredIds) {
        const card = [...container.querySelectorAll(':scope > .foxget-job-card')].find(item => item.dataset.jobId === id);
        if (card) container.append(card);
      }
    }
  }

  function setEmptyState(container, messageText) {
    const existing = container.querySelector(':scope > .empty-state');
    if (existing) {
      if (existing.textContent !== messageText) existing.textContent = messageText;
      return;
    }
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = messageText;
    container.append(empty);
    animateEntry(empty);
  }

  function startAutomaticDownload(jobId) {
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.title = 'Descarga automática de FoxGet';
    frame.setAttribute('aria-hidden', 'true');
    frame.src = '/api/foxget/' + encodeURIComponent(jobId) + '/download';
    document.body.append(frame);
    window.setTimeout(() => frame.remove(), 60000);
  }

  async function refreshJobs() {
    const result = await apiRequest('');
    const jobs = Array.isArray(result.jobs) ? result.jobs : [];
    for (const job of jobs) {
      if (job.state !== 'ready' || !pendingAutoDownloads.has(job.id)) continue;
      pendingAutoDownloads.delete(job.id);
      showMessage('«' + (job.title || job.fileName || 'Tu archivo') + '» está listo. Iniciando la descarga en tu navegador.', 'success');
      startAutomaticDownload(job.id);
      return true;
    }
    for (const job of jobs) {
      if (!pendingAutoDownloads.has(job.id) || activeStates.has(job.state) || job.state === 'ready') continue;
      pendingAutoDownloads.delete(job.id);
      showMessage(job.error || 'La descarga no se pudo completar. Revisa el historial de FoxGet.');
    }
    const active = jobs.filter(job => activeStates.has(job.state));
    syncList(jobsList, active, false, 'No hay descargas activas.');

    const recent = Array.isArray(result.recent) ? result.recent : [];
    syncList(recentList, recent, true, 'Todavía no hay descargas recientes.');
    $('foxgetSummary').textContent = active.length
      ? active.length + (active.length === 1 ? ' descarga activa.' : ' descargas activas.')
      : 'Todavía no hay descargas activas.';
    $('foxgetLimit').textContent = active.length + ' activas';
    $('foxgetRecentCount').textContent = Math.min(recent.length, 5) + ' de 5';

    const available = Array.isArray(result.available) ? result.available : [];
    syncList(readyList, available, false, 'No hay archivos disponibles para descargar.');
    $('foxgetReadyCount').textContent = available.length + (available.length === 1 ? ' archivo' : ' archivos');
    return active.length > 0 || pendingAutoDownloads.size > 0;
  }

  window.setInterval(() => {
    document.querySelectorAll('#foxgetReady [data-expires-at]').forEach(expiry => {
      const job = {
        expiresAt: expiry.dataset.expiresAt,
        firstDownloadAt: expiry.dataset.firstDownloadAt || null
      };
      expiry.textContent = formatExpiryLabel(job);
      const expired = Number(job.expiresAt) <= Date.now() / 1000;
      expiry.classList.toggle('foxget-file-expiry-urgent', !expired && Number(job.expiresAt) - Date.now() / 1000 <= 60);
      if (expired) {
        const card = expiry.closest('.foxget-job-card');
        if (card) animateExpiredCard(card);
      }
    });
  }, 1000);

  async function pollJobs() {
    if (polling || typeof me === 'undefined' || !me || ($('view-foxget').hidden && !pendingAutoDownloads.size)) return;
    polling = true;
    try {
      const active = await refreshJobs();
      if (active) window.setTimeout(pollJobs, 2500);
    } catch (error) {
      showMessage(error.message || 'No se pudieron actualizar las descargas de FoxGet.');
    } finally {
      polling = false;
    }
  }

  function watchJobs() {
    window.setTimeout(pollJobs, 1200);
  }

  async function handleFormAction() {
    if (inspectButton.disabled) return;
    if (inspected) {
      inspected = null;
      hidePreview();
      options.replaceChildren();
      urlInput.disabled = false;
      inspectButton.textContent = 'Analizar enlace';
      showMessage('');
      urlInput.focus();
      return;
    }
    if (!urlInput.reportValidity() || !urlInput.value.trim()) return;
    inspectButton.disabled = true;
    inspectButton.textContent = 'Analizando…';
    hidePreview();
    urlInput.disabled = false;
    options.replaceChildren();
    inspected = null;
    showMessage('Analizando enlace', 'loading');
    try {
      const info = await apiRequest('/inspect', 'POST', { url: urlInput.value.trim() });
      renderPreview(info);
      showMessage('');
    } catch (error) {
      showMessage(error.message || 'No se pudo analizar el enlace.');
    } finally {
      inspectButton.disabled = false;
      if (!inspected) inspectButton.textContent = 'Analizar enlace';
    }
  }

  inspectButton?.addEventListener('click', event => {
    event.preventDefault();
    void handleFormAction();
  });
  form?.addEventListener('submit', event => {
    event.preventDefault();
    void handleFormAction();
  }, true);
  urlInput?.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault();
    void handleFormAction();
  });

  document.querySelectorAll('#view-foxget [data-foxget-section]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const section = link.dataset.foxgetSection === 'archivos' ? 'archivos' : 'descargar';
      setFoxgetSection(section);
      const next = section === 'archivos' ? '/foxget?section=archivos' : '/foxget';
      if (location.pathname + location.search !== next) history.pushState({ foxgetSection: section }, '', next);
      if (section === 'archivos') refreshJobs().catch(error => showMessage(error.message));
    });
  });

  $('foxgetRefresh')?.addEventListener('click', () => {
    refreshJobs().catch(error => showMessage(error.message || 'No se pudieron actualizar tus archivos.'));
  });

  const foxgetView = $('view-foxget');
  if (foxgetView) {
    new MutationObserver(() => {
      if (!foxgetView.hidden) {
        const section = new URLSearchParams(location.search).get('section') === 'archivos' ? 'archivos' : 'descargar';
        setFoxgetSection(section, false);
        pollJobs();
      }
    }).observe(foxgetView, { attributes: true, attributeFilter: ['hidden'] });
  }

  window.addEventListener('popstate', () => {
    if ($('view-foxget').hidden) return;
    const section = new URLSearchParams(location.search).get('section') === 'archivos' ? 'archivos' : 'descargar';
    setFoxgetSection(section);
  });
})();