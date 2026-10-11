(function () {
  if (window.__soundtabInjected) return;
  window.__soundtabInjected = true;

  let indicator = null;
  let pendingSoundscape = null;
  let pendingVolume = 0.5;
  let playing = false;
  let gestureSeen = false;
  let isDisabled = false;
  let globallyMuted = false;
  let pausedByUser = false;
  let classifyTimer = null;
  let lastUrl = window.location.href;

  function getPageText() {
    const meta = document.querySelector('meta[name="description"]');
    const title = document.title || '';
    const h1 = Array.from(document.querySelectorAll('h1')).map(h => h.textContent).join(' ');
    const h2 = Array.from(document.querySelectorAll('h2')).map(h => h.textContent).join(' ');
    const body = document.body ? document.body.innerText.substring(0, 5000) : '';
    const headings = [title, title, h1, h1, h2, h2, meta ? meta.content : ''].join(' ');
    return [headings, headings, body].join(' ').substring(0, 8000);
  }

  function sendToBackground(msg, cb) {
    try {
      chrome.runtime.sendMessage(msg, (resp) => {
        void chrome.runtime.lastError;
        if (cb) cb(resp);
      });
    } catch (e) {
      if (cb) cb(null);
    }
  }

  function settingsAllowAudio() {
    return !isDisabled && !globallyMuted;
  }

  function togglePause() {
    if (!settingsAllowAudio() || !pendingSoundscape) return;
    if (playing) {
      pausedByUser = true;
      stopAudio();
    } else {
      pausedByUser = false;
      SoundtabAudio.unlock();
      startAudio();
    }
    updateIndicator();
  }

  function createIndicator(name, icon) {
    if (indicator) indicator.remove();
    indicator = document.createElement('div');
    indicator.id = '__soundtab_indicator';
    Object.assign(indicator.style, {
      position: 'fixed', bottom: '12px', right: '12px', zIndex: '2147483647',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      color: '#fff', padding: '6px 14px', borderRadius: '20px',
      fontSize: '13px', fontFamily: 'system-ui, sans-serif',
      display: 'flex', alignItems: 'center', gap: '6px',
      cursor: 'pointer', userSelect: 'none', opacity: '0',
      transition: 'opacity 0.3s ease',
    });
    indicator.textContent = `${icon} ${name}`;
    indicator.title = 'SoundTab - click to pause/resume';
    indicator.addEventListener('click', togglePause);
    document.body.appendChild(indicator);
    requestAnimationFrame(() => { if (indicator) indicator.style.opacity = '1'; });
  }

  function currentLabel() {
    const sc = SoundtabAudio.getSoundscapes().find(s => s.id === pendingSoundscape);
    return sc ? { name: sc.name, icon: sc.icon } : { name: pendingSoundscape || '', icon: '🎵' };
  }

  function updateIndicator() {
    if (!settingsAllowAudio()) {
      createIndicator('Muted', '🔇');
      return;
    }
    const label = currentLabel();
    if (pausedByUser) {
      createIndicator(label.name, '⏸');
    } else {
      createIndicator(label.name, label.icon);
    }
  }

  function startAudio() {
    if (!pendingSoundscape || !settingsAllowAudio() || pausedByUser || playing) return;
    SoundtabAudio.unlock();
    if (!SoundtabAudio.play(pendingSoundscape)) return;
    SoundtabAudio.setVolume(pendingVolume);
    playing = true;
    updateIndicator();
  }

  function stopAudio() {
    if (playing) SoundtabAudio.stop();
    playing = false;
  }

  function restartIfPossible() {
    stopAudio();
    startAudio();
  }

  function applyClassification(response) {
    if (!response) return;
    pendingSoundscape = response.soundscape;
    pendingVolume = response.volume !== undefined ? response.volume : pendingVolume;
    isDisabled = response.disabled === true;
    globallyMuted = response.globallyMuted === true;

    if (gestureSeen && settingsAllowAudio() && !pausedByUser) {
      restartIfPossible();
    } else {
      updateIndicator();
    }
  }

  function classify() {
    sendToBackground(
      { type: 'CLASSIFY', url: window.location.href, text: getPageText() },
      applyClassification
    );
  }

  function scheduleClassify(delay) {
    if (classifyTimer) clearTimeout(classifyTimer);
    classifyTimer = setTimeout(() => {
      classifyTimer = null;
      classify();
    }, delay || 600);
  }

  function watchUrlChanges() {
    setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        scheduleClassify(800);
      }
    }, 1200);
    window.addEventListener('popstate', () => scheduleClassify(400));
    window.addEventListener('hashchange', () => scheduleClassify(400));
  }

  function init() {
    classify();
    watchUrlChanges();

    const gestureTypes = ['click', 'mousedown', 'pointerdown', 'keydown', 'touchstart'];
    function onGesture() {
      gestureSeen = true;
      SoundtabAudio.unlock();
      startAudio();
      if (playing) {
        gestureTypes.forEach(t => document.removeEventListener(t, onGesture, true));
      }
    }
    gestureTypes.forEach(t => document.addEventListener(t, onGesture, true));

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAudio();
      } else if (gestureSeen && settingsAllowAudio() && !pausedByUser) {
        SoundtabAudio.unlock();
        startAudio();
      }
    });

    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.type === 'UPDATE_SOUNDSCAPE') {
        pendingSoundscape = msg.soundscape;
        pendingVolume = msg.volume !== undefined ? msg.volume : pendingVolume;
        if (gestureSeen && settingsAllowAudio() && !pausedByUser) {
          restartIfPossible();
        } else {
          updateIndicator();
        }
      }

      if (msg.type === 'UPDATE_DISABLED') {
        isDisabled = msg.disabled === true;
        if (!settingsAllowAudio()) {
          stopAudio();
        }
        if (gestureSeen && settingsAllowAudio() && !pausedByUser) {
          startAudio();
        }
        updateIndicator();
      }

      if (msg.type === 'SET_VOLUME') {
        pendingVolume = msg.volume;
        if (playing) SoundtabAudio.setVolume(msg.volume);
      }

      if (msg.type === 'GLOBAL_MUTE') {
        globallyMuted = msg.muted === true;
        if (!settingsAllowAudio()) {
          stopAudio();
        }
        if (gestureSeen && settingsAllowAudio() && !pausedByUser) {
          startAudio();
        }
        updateIndicator();
      }

      if (msg.type === 'GET_STATUS') {
        sendResponse({
          soundscape: pendingSoundscape,
          volume: pendingVolume,
          disabled: isDisabled,
          globallyMuted,
          playing,
        });
        return true;
      }

      if (msg.type === 'RECLASSIFY') {
        sendToBackground(
          { type: 'CLASSIFY', url: window.location.href, text: getPageText() },
          (response) => {
            applyClassification(response);
            sendResponse({
              soundscape: pendingSoundscape,
              disabled: isDisabled,
              globallyMuted,
              playing,
            });
          }
        );
        return true;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
