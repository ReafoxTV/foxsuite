(() => {
  const fileInput = document.getElementById('file');
  const resumeFilePicker = document.getElementById('resumeFilePicker');
  const dropZone = document.getElementById('dropZone');
  const selectedFiles = document.getElementById('selectedFiles');
  const selectedFileList = document.getElementById('selectedFileList');
  const selectedFilesCount = document.getElementById('selectedFilesCount');
  const addToQueue = document.getElementById('addToQueue');
  const notice = document.getElementById('notice');
  const selectionNotice = document.getElementById('selectionNotice');
  const queueList = document.getElementById('queueList');
  const pendingUploadNotice = document.getElementById('pendingUploadNotice');
  const filesView = document.getElementById('view-files');
  const fileList = document.getElementById('files');
  const panel = document.getElementById('panel');
  const visibilityRuns = new WeakMap();
  const visibilityTargets = new WeakMap();
  let pendingResumeId = null;

  function showNotice(text) {
    if (typeof message === 'function') {
      message(text);
      return;
    }
    if (!notice) return;
    let content = notice.querySelector('#noticeText');
    if (!content) {
      content = document.createElement('span');
      content.id = 'noticeText';
      notice.replaceChildren(content);
    }
    content.textContent = text;
    notice.hidden = false;
  }

  function setVisible(element, visible, duration = 220) {
    if (!element) return;
    if (element.hidden === !visible || visibilityTargets.get(element) === visible) return;
    const run = (visibilityRuns.get(element) || 0) + 1;
    visibilityRuns.set(element, run);
    visibilityTargets.set(element, visible);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.hidden = !visible;
      return;
    }
    if (visible) {
      element.hidden = false;
      element.animate(
        [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration, easing: 'cubic-bezier(.22,.7,.25,1)' }
      );
      return;
    }
    if (element.hidden) return;
    element.animate(
      [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-5px)' }],
      { duration, easing: 'cubic-bezier(.22,.7,.25,1)' }
    ).finished.then(() => {
      if (visibilityRuns.get(element) === run) element.hidden = true;
    }).catch(() => {});
  }
  window.foxSetVisible = setVisible;

  window.foxCloseDialog = dialog => new Promise(resolve => {
    let closed = false;
    const finish = () => {
      if (closed) return;
      closed = true;
      if (dialog.open) dialog.close();
      dialog.remove();
      resolve();
    };
    dialog.classList.add('is-closing');
    dialog.addEventListener('animationend', event => {
      if (event.target === dialog && event.animationName === 'foxDialogExit') finish();
    });
    window.setTimeout(finish, 280);
  });

  if (fileInput && dropZone && selectedFiles && selectedFileList && selectedFilesCount && addToQueue) {
    const enqueueSelection = fileInput.onchange;
    const maxFileSize = 10_000_000_000;
    const staged = [];
    const stagedCards = new Map();
    const size = value => {
      let n = Number(value);
      for (const unit of ['B', 'KB', 'MB', 'GB', 'TB']) {
        if (n < 1000 || unit === 'TB') {
          return (unit === 'B' ? String(n) : n.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')) + ' ' + unit;
        }
        n /= 1000;
      }
    };

    function askToResume(file, remote) {
      const previous = document.activeElement;
      const dialog = document.createElement('dialog');
      dialog.className = 'fox-resume-modal';
      dialog.setAttribute('aria-labelledby', 'fr-title');
      dialog.setAttribute('aria-describedby', 'fr-description');
      dialog.innerHTML = '<button type="button" class="fr-close" aria-label="Cerrar">×</button><div class="fr-icon" aria-hidden="true"></div><span class="fr-eyebrow">SUBIDA INTERRUMPIDA</span><h2 id="fr-title">¿Reanudar archivo?</h2><p class="fr-description" id="fr-description">Puedes seguir desde donde quedó.</p><div class="fr-file"><span class="fr-file-icon"></span><span class="fr-file-name"></span></div><p class="fr-progress"></p><div class="fr-actions"><button type="button" class="fr-cancel secondary">Ahora no</button><button type="button" class="fr-resume">Reanudar</button></div>';
      const icon = typeof formatIcon === 'function' ? formatIcon(file.name) : null;
      if (icon) dialog.querySelector('.fr-file-icon').append(icon);
      dialog.querySelector('.fr-file-name').textContent = file.name;
      dialog.querySelector('.fr-progress').textContent = size(remote.offset || 0) + ' de ' + size(remote.size) + ' subidos.';
      document.body.append(dialog);

      return new Promise(resolve => {
        let finished = false;
        const finish = answer => {
          if (finished) return;
          finished = true;
          window.foxCloseDialog(dialog).then(() => {
            if (previous?.isConnected) previous.focus();
            resolve(answer);
          });
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
        dialog.querySelector('.fr-resume').focus();
      });
    }

    function showResumeWarning(file, description) {
      const dialog = document.createElement('dialog');
      dialog.className = 'fox-resume-modal fox-upload-mismatch-modal';
      dialog.setAttribute('aria-labelledby', 'fm-title');
      dialog.setAttribute('aria-describedby', 'fm-description');
      dialog.innerHTML = '<button type="button" class="fr-close" aria-label="Cerrar">×</button><div class="fr-icon" aria-hidden="true"></div><span class="fr-eyebrow">SUBIDA INTERRUMPIDA</span><h2 id="fm-title">Ese no es el archivo</h2><p class="fr-description" id="fm-description"></p><div class="fr-file"><span class="fr-file-icon"></span><span class="fr-file-name"></span></div><div class="fr-actions"><button type="button" class="fr-cancel secondary">Cancelar</button><button type="button" class="fr-resume">Intentar nuevamente</button></div>';
      dialog.querySelector('.fr-description').textContent = description;
      dialog.querySelector('.fr-file-name').textContent = file?.name || 'Archivo no seleccionado';
      const icon = file && typeof formatIcon === 'function' ? formatIcon(file.name) : null;
      if (icon) dialog.querySelector('.fr-file-icon').append(icon);
      document.body.append(dialog);
      let finished = false;
      const finish = retry => {
        if (finished) return;
        finished = true;
        if (retry) {
          dialog.close();
          dialog.remove();
          resumeFilePicker.value = '';
          resumeFilePicker.click();
        } else {
          pendingResumeId = null;
          window.foxCloseDialog(dialog);
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
      dialog.querySelector('.fr-resume').focus();
    }

    function askToCancelUpload(name) {
      const previous = document.activeElement;
      const dialog = document.createElement('dialog');
      dialog.className = 'fox-resume-modal fox-upload-cancel-modal';
      dialog.setAttribute('aria-labelledby', 'fc-title');
      dialog.setAttribute('aria-describedby', 'fc-description');
      dialog.innerHTML = '<button type="button" class="fr-close" aria-label="Cerrar">×</button><div class="fr-icon" aria-hidden="true"></div><span class="fr-eyebrow">CANCELAR SUBIDA</span><h2 id="fc-title">¿Eliminar esta subida?</h2><p class="fr-description" id="fc-description">Se borrarán los datos recibidos hasta ahora y ya no podrás reanudarla.</p><div class="fr-file"><span class="fr-file-icon"></span><span class="fr-file-name"></span></div><p class="fr-progress"></p><div class="fr-actions"><button type="button" class="fr-cancel secondary">Conservar subida</button><button type="button" class="fr-resume">Cancelar y eliminar</button></div>';
      dialog.querySelector('.fr-file-name').textContent = name;
      document.body.append(dialog);

      return new Promise(resolve => {
        let finished = false;
        const finish = answer => {
          if (finished) return;
          finished = true;
          window.foxCloseDialog(dialog).then(() => {
            if (previous?.isConnected) previous.focus();
            resolve(answer);
          });
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
    }

    window.foxConfirmUploadCancel = askToCancelUpload;

    function renderStaged() {
      const current = new Set(staged);
      for (const [file, card] of stagedCards) {
        if (current.has(file) || card.classList.contains('selected-file-leave')) continue;
        card.classList.add('selected-file-leave');
        stagedCards.delete(file);
        window.setTimeout(() => card.remove(), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180);
      }
      staged.forEach(file => {
        let card = stagedCards.get(file);
        if (!card) {
          card = document.createElement('div');
          card.className = 'selected-file-card';
          const icon = typeof formatIcon === 'function' ? formatIcon(file.name) : null;
          if (icon) card.append(icon);
          const name = document.createElement('span');
          name.className = 'selected-file-name';
          name.textContent = file.name + ' · ' + size(file.size);
          card.append(name);
          const remove = document.createElement('button');
          remove.type = 'button';
          remove.className = 'selected-file-remove secondary';
          remove.textContent = '×';
          remove.setAttribute('aria-label', 'Quitar ' + file.name + ' de la selección');
          remove.addEventListener('click', () => {
            const index = staged.indexOf(file);
            if (index >= 0) {
              staged.splice(index, 1);
              renderStaged();
            }
          });
          card.append(remove);
          stagedCards.set(file, card);
        }
        if (card.parentElement !== selectedFileList) selectedFileList.append(card);
      });
      setVisible(selectedFiles, staged.length > 0);
      selectedFilesCount.textContent = staged.length + (staged.length === 1 ? ' archivo' : ' archivos');
      addToQueue.disabled = staged.length === 0;
    }

    async function stage(files) {
      if (files.length > 5) {
        const text = 'Son demasiados archivos. Solo se permiten 5 por selección.';
        if (selectionNotice) {
          selectionNotice.textContent = text;
          setVisible(selectionNotice, true);
        }
        return;
      }

      const invalidFiles = files.filter(file => file.size < 1 || file.size > maxFileSize);
      const validFiles = files.filter(file => file.size >= 1 && file.size <= maxFileSize);
      if (selectionNotice) {
        selectionNotice.textContent = invalidFiles.map(file =>
          file.size > maxFileSize
            ? file.name + ': solo se permiten archivos de hasta 10 GB por archivo; no se añadió.'
            : file.name + ': el archivo está vacío y no se añadió.'
        ).join(' ');
        setVisible(selectionNotice, invalidFiles.length > 0);
      }
      if (!validFiles.length) {
        renderStaged();
        return;
      }

      let added = 0;
      const queueCount = Number.parseInt(document.getElementById('queueLimit').textContent, 10) || 0;
      const availableSlots = Math.max(0, 5 - queueCount - staged.length);
      for (const file of validFiles) {
        const duplicate = staged.some(item =>
          item.name === file.name && item.size === file.size && item.lastModified === file.lastModified
        );
        if (duplicate) continue;

        const key = typeof keyFor === 'function' ? keyFor(file) : null;
        if (!key || typeof api !== 'function' || typeof enqueue !== 'function' || typeof runQueue !== 'function') {
          showNotice('No se pudo comprobar si el archivo tiene una subida anterior. Recarga la página e inténtalo de nuevo.');
          continue;
        }

        let remote = null;
        const uploadId = localStorage.getItem(key);
        try {
          if (uploadId) {
            remote = await api('/files/' + encodeURIComponent(uploadId));
          } else {
            const data = await api('/files');
            const matches = data.files.filter(item =>
              item.state === 'uploading' &&
              item.name === file.name &&
              item.size === file.size &&
              (!item.owner || item.owner.name === me.name)
            );
            if (matches.length > 1) {
              showNotice('Hay varias subidas incompletas con ese nombre y tamaño. Revisa «Mis archivos» y elimina la que no quieras reanudar.');
              continue;
            }
            remote = matches[0] || null;
          }
        } catch (error) {
          if (error.status === 404 && uploadId) {
            localStorage.removeItem(key);
          } else {
            showNotice('No se pudo comprobar la subida anterior de ' + file.name + '. Vuelve a seleccionarlo en unos instantes.');
            continue;
          }
        }

        const ownedByCurrentUser = !remote?.owner || remote.owner.name === me.name;
        if (remote?.state === 'uploading' && remote.name === file.name && remote.size === file.size && ownedByCurrentUser) {
          localStorage.setItem(key, remote.id);
          if (await askToResume(file, remote)) {
            enqueue([file]);
            await runQueue();
          }
          continue;
        }
        if (remote) localStorage.removeItem(key);

        if (added >= availableSlots) {
          showNotice('La cola admite un máximo de 5 archivos pendientes. Sube o quita archivos antes de añadir más.');
          break;
        }
        staged.push(file);
        added += 1;
      }
      renderStaged();
    }

    async function resumePending(file, uploadId) {
      let remote;
      try {
        remote = await api('/files/' + encodeURIComponent(uploadId));
      } catch (error) {
        showResumeWarning(file, 'No se pudo comprobar la subida. Inténtalo nuevamente.');
        return;
      }
      const ownedByCurrentUser = !remote.owner || remote.owner.name === me.name;
      if (remote.state !== 'uploading' || remote.name !== file.name || remote.size !== file.size || !ownedByCurrentUser) {
        showResumeWarning(file, 'Selecciona el archivo original de esta subida e inténtalo nuevamente.');
        return;
      }

      const verifyChunkSize = 8 * 1024 * 1024;
      for (let offset = 0; offset < remote.offset; offset += verifyChunkSize) {
        const chunk = file.slice(offset, Math.min(offset + verifyChunkSize, remote.offset));
        let response;
        let result;
        try {
          response = await fetch('/api/files/' + encodeURIComponent(uploadId) + '/verify', {
            method: 'POST',
            headers: { 'X-CSRF-Token': me.csrf, 'X-WTF-CSRF-Token': me.csrf_token, 'Upload-Offset': String(offset), 'Content-Type': 'application/octet-stream' },
            body: chunk
          });
          result = await response.json();
        } catch (error) {
          showResumeWarning(file, 'No se pudo verificar el archivo. Inténtalo nuevamente.');
          return;
        }
        if (!response.ok) {
          showResumeWarning(file, result.error || 'No se pudo verificar el archivo. Inténtalo nuevamente.');
          return;
        }
        if (!result.matches) {
          showResumeWarning(file, 'Selecciona el archivo original de esta subida e inténtalo nuevamente.');
          return;
        }
      }

      const key = typeof keyFor === 'function' ? keyFor(file) : null;
      if (!key || typeof enqueue !== 'function' || typeof runQueue !== 'function') {
        showResumeWarning(file, 'No se pudo preparar la subida. Inténtalo nuevamente.');
        return;
      }
      await showView('upload', true);
      const existing = queue.find(item => item.remote === uploadId || localStorage.getItem(item.key) === uploadId);
      if (existing) {
        if (existing.state === 'uploading') {
          showNotice('Este archivo ya se está subiendo.');
          pendingResumeId = null;
          return;
        }
        existing.file = file;
        existing.key = key;
        existing.remote = uploadId;
        existing.offset = remote.offset;
        existing.state = 'waiting';
        existing.error = '';
        localStorage.setItem(key, uploadId);
        updateCard(existing);
      } else {
        if (Number.parseInt(document.getElementById('queueLimit').textContent, 10) >= 5) {
          showNotice('La cola admite un máximo de 5 archivos pendientes. Termina o quita uno antes de reanudar.');
          pendingResumeId = null;
          return;
        }
        localStorage.setItem(key, uploadId);
        enqueue([file]);
        const item = queue.find(entry => entry.key === key && entry.state !== 'done');
        if (!item) {
          pendingResumeId = null;
          return;
        }
        item.remote = uploadId;
        item.offset = remote.offset;
        updateCard(item);
      }
      pendingResumeId = null;
      await runQueue();
    }

    window.foxResumePendingUpload = uploadId => {
      pendingResumeId = String(uploadId);
      resumeFilePicker.value = '';
      resumeFilePicker.click();
    };
    resumeFilePicker?.addEventListener('change', () => {
      const uploadId = pendingResumeId;
      const files = Array.from(resumeFilePicker.files || []);
      const file = files[0];
      resumeFilePicker.value = '';
      if (!uploadId) return;
      if (!file) {
        pendingResumeId = null;
        return;
      }
      if (files.length > 1) {
        showResumeWarning(file, 'Selecciona únicamente el archivo original de esta subida.');
        return;
      }
      resumePending(file, uploadId).catch(error => {
        showResumeWarning(file, error.message || 'No se pudo reanudar la subida. Inténtalo nuevamente.');
      });
    });
    resumeFilePicker?.addEventListener('cancel', () => { pendingResumeId = null; });

    fileInput.onchange = () => {
      stage(Array.from(fileInput.files)).catch(error => {
        showNotice(error.message || 'No se pudo procesar el archivo seleccionado.');
      });
      fileInput.value = '';
    };

    dropZone.addEventListener('drop', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      dropZone.classList.remove('over');
      stage(Array.from(event.dataTransfer.files)).catch(error => {
        showNotice(error.message || 'No se pudo procesar el archivo seleccionado.');
      });
    }, true);

    addToQueue.addEventListener('click', () => {
      if (!staged.length) return;
      if (typeof enqueueSelection !== 'function') {
        showNotice('No se pudo inicializar la cola de subidas. Recarga la página e inténtalo de nuevo.');
        return;
      }
      try {
        const transfer = new DataTransfer();
        staged.forEach(file => transfer.items.add(file));
        fileInput.files = transfer.files;
        enqueueSelection.call(fileInput);
        staged.splice(0, staged.length);
        renderStaged();
      } catch (error) {
        showNotice('No se pudieron añadir los archivos a la cola. Vuelve a seleccionarlos e inténtalo de nuevo.');
      }
    });
  }

  if (!filesView || !fileList || !panel) return;

  if (queueList && notice) {
    const quotaObserver = new MutationObserver(() => {
      for (const card of queueList.querySelectorAll('.queue-card[data-state="error"]')) {
        const error = card.querySelector('.queue-state')?.textContent || '';
        if (/cuota|espacio|almacenamiento/i.test(error)) {
          showNotice(error);
          break;
        }
      }
    });
    quotaObserver.observe(queueList, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-state'] });
  }

  const pendingUploadText = pendingUploadNotice?.querySelector('span');
  const pendingUploadDismiss = pendingUploadNotice?.querySelector('.pending-upload-dismiss');
  let pendingUploadCheck = false;
  let pendingUploadDismissed = false;

  pendingUploadDismiss?.addEventListener('click', () => {
    pendingUploadDismissed = true;
    setVisible(pendingUploadNotice, false);
  });

  async function checkPendingUploads() {
    if (!pendingUploadNotice || !pendingUploadText || panel.hidden || pendingUploadCheck) return;
    if (!me?.admin && !me?.foxdrop) {
      setVisible(pendingUploadNotice, false);
      return;
    }
    pendingUploadCheck = true;
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      if (response.status === 401) {
        setVisible(pendingUploadNotice, false);
        return;
      }
      if (!response.ok) throw new Error(data.error || 'No se pudo revisar el estado de las subidas.');
      const count = data.files.filter(file => file.state === 'uploading').length;
      if (!count) pendingUploadDismissed = false;
      pendingUploadText.textContent = count
        ? 'Tienes ' + count + (count === 1 ? ' subida pendiente. ' : ' subidas pendientes. ') +
          'En «Mis archivos» puedes ver su estado; para reanudarla, vuelve a «Subir» y selecciona el mismo archivo.'
        : '';
      if (!filesView.hidden) pendingUploadDismissed = true;
      setVisible(pendingUploadNotice, count > 0 && !pendingUploadDismissed && filesView.hidden);
    } catch (error) {
      showNotice(error.message);
    } finally {
      pendingUploadCheck = false;
    }
  }

  const panelObserver = new MutationObserver(checkPendingUploads);
  panelObserver.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  const filesViewObserver = new MutationObserver(() => {
    if (!filesView.hidden) {
      pendingUploadDismissed = true;
      setVisible(pendingUploadNotice, false);
    } else {
      checkPendingUploads();
    }
  });
  filesViewObserver.observe(filesView, { attributes: true, attributeFilter: ['hidden'] });
  const queueSummary = document.getElementById('queueSummary');
  if (queueSummary) {
    const queueSummaryObserver = new MutationObserver(() => {
      const state = queueSummary.textContent;
      if (!state.startsWith('Subiendo:') && !state.includes('pendiente') && !state.includes('pausada')) {
        checkPendingUploads();
      }
    });
    queueSummaryObserver.observe(queueSummary, { childList: true, characterData: true, subtree: true });
  }
  if (!panel.hidden) checkPendingUploads();

  const seenFiles = new Map();
  const expiryTimers = new Map();
  let polling = false;
  const nearExpirySeconds = 60 * 60;

  const queueButton = document.getElementById('startQueue');
  if (queueButton) {
    const normalizeQueueButton = () => {
      const label = queueButton.innerHTML
        .replace('Subir cola', 'Subir')
        .replace('Continuar cola', 'Reanudar subida');
      if (label !== queueButton.innerHTML) queueButton.innerHTML = label;
    };
    normalizeQueueButton();
    const queueButtonObserver = new MutationObserver(normalizeQueueButton);
    queueButtonObserver.observe(queueButton, { childList: true, subtree: true });
  }

  function isFilesPageVisible() {
    return !panel.hidden && !filesView.hidden && document.visibilityState === 'visible';
  }

  function fileCard(url) {
    return Array.from(fileList.querySelectorAll('article.file-item')).find(card =>
      Array.from(card.querySelectorAll('.link-card code')).some(code => code.textContent === url)
    );
  }

  function remainingText(seconds) {
    if (seconds <= 0) return 'Vence ahora';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days) return 'Quedan ' + days + (days === 1 ? ' día' : ' días') + (hours ? ' y ' + hours + ' h' : '');
    if (hours) return 'Quedan ' + hours + (hours === 1 ? ' hora' : ' horas') + (minutes ? ' y ' + minutes + ' min' : '');
    if (minutes) return 'Quedan ' + minutes + (minutes === 1 ? ' minuto' : ' minutos');
    return 'Queda menos de un minuto';
  }

  function animateExpiry(file) {
    const card = fileCard(file.url);
    if (!card || card.dataset.expiryAnimation === 'played') return;
    card.dataset.expiryAnimation = 'played';
    card.classList.add('file-expiring');
    window.setTimeout(() => {
      card.remove();
      if (typeof refreshFiles === 'function' && isFilesPageVisible()) {
        refreshFiles().catch(error => {
          showNotice(error.message);
        });
      }
    }, 700);
  }

  function updateExpiry(file) {
    const card = fileCard(file.url);
    if (!card) return;
    const label = Array.from(card.querySelectorAll('.file-meta')).find(element =>
      element.textContent.startsWith('Expira:')
    );
    if (!label) return;
    const expiresAt = Date.parse(file.expires);
    const seconds = Math.ceil((expiresAt - Date.now()) / 1000);
    label.classList.add('file-expiration');
    label.classList.toggle('file-expiration-soon', seconds <= nearExpirySeconds);
    const text = 'Expira: ' + new Date(expiresAt).toLocaleString("es-ES") + ' · ' + remainingText(seconds);
    if (label.textContent !== text) label.textContent = text;
    if (seconds <= 0) animateExpiry(file);
  }

  function scheduleExpiry(file) {
    const existing = expiryTimers.get(file.id);
    if (existing) window.clearTimeout(existing);
    const delay = Math.max(0, Date.parse(file.expires) - Date.now());
    expiryTimers.set(file.id, window.setTimeout(() => {
      expiryTimers.delete(file.id);
      if (isFilesPageVisible()) animateExpiry(file);
    }, delay));
  }

  async function pollExpiry() {
    if (polling || !isFilesPageVisible()) return;
    polling = true;
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudieron actualizar las expiraciones.');
      const now = Date.now();
      const current = new Map(data.files.filter(file => file.state === 'ready' && file.expires).map(file => [file.id, file]));

      for (const [id, file] of seenFiles) {
        if (!current.has(id) && Date.parse(file.expires) <= now) animateExpiry(file);
      }
      for (const [id, file] of current) {
        seenFiles.set(id, file);
        updateExpiry(file);
        if (!expiryTimers.has(id)) scheduleExpiry(file);
      }
      for (const [id, timer] of expiryTimers) {
        if (!current.has(id)) {
          window.clearTimeout(timer);
          expiryTimers.delete(id);
          seenFiles.delete(id);
        }
      }
    } catch (error) {
      showNotice(error.message);
    } finally {
      polling = false;
    }
  }

  window.setInterval(() => {
    if (!isFilesPageVisible()) return;
    for (const file of seenFiles.values()) updateExpiry(file);
  }, 30000);
  document.addEventListener('visibilitychange', pollExpiry);

  const observer = new MutationObserver(() => {
    if (isFilesPageVisible()) pollExpiry();
  });
  observer.observe(fileList, { childList: true });

  const filesObserver = new MutationObserver(() => {
    for (const link of fileList.querySelectorAll('a[href^="/api/admin/files/"]')) {
      if (!link.textContent.includes('Descarga admin')) continue;
      link.innerHTML = link.innerHTML.replace('Descarga admin', 'Descargar');
    }
  });
  filesObserver.observe(fileList, { childList: true, subtree: true });
})();
