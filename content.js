(function () {
  if (window.__soundtabInjected) return;
  window.__soundtabInjected = true;

  let indicator = null;
  let pendingSoundscape = null;
  let pendingVolume = 0.5;
  let audioStarted = false;
  let isDisabled = false;
  let mutedIndicator = false;

  function getPageText() {
    const meta = document.querySelector('meta[name="description"]');
    const title = document.title || '';
    const h1 = Array.from(document.querySelectorAll('h1')).map(h => h.textContent).join(' ');
    const h2 = Array.from(document.querySelectorAll('h2')).map(h => h.textContent).join(' ');
    const body = document.body ? document.body.innerText.substring(0, 5000) : '';
    return [title, meta ? meta.content : '', h1, h2, body].join(' ').substring(0, 8000);
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
    indicator.title = 'SoundTab - Click any page element to start audio, then use the extension icon to customize';
    document.body.appendChild(indicator);
    requestAnimationFrame(() => { indicator.style.opacity = '1'; });
  }

  function startAudio() {
    if (!pendingSoundscape || audioStarted) return;
    audioStarted = true;
    SoundtabAudio.play(pendingSoundscape);
    SoundtabAudio.setVolume(pendingVolume);
  }

  function init() {
    const text = getPageText();
    chrome.runtime.sendMessage(
      { type: 'CLASSIFY', url: window.location.href, text },
      (response) => {
        if (!response) return;
        pendingSoundscape = response.soundscape;
        pendingVolume = response.volume;
        isDisabled = response.disabled;

        if (isDisabled) {
          mutedIndicator = true;
          createIndicator('Muted', '🔇');
          return;
        }

        const sc = SoundtabAudio.getSoundscapes().find(s => s.id === pendingSoundscape);
        createIndicator(
          sc ? sc.name + ' (click to play)' : pendingSoundscape + ' (click to play)',
          sc ? sc.icon : '🎵'
        );
      }
    );

    const gestureTypes = ['click', 'keydown', 'touchstart'];
    function onGesture() {
      gestureTypes.forEach(t => document.removeEventListener(t, onGesture, true));
      startAudio();
    }
    gestureTypes.forEach(t => document.addEventListener(t, onGesture, true));

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (audioStarted) SoundtabAudio.stop();
      } else {
        if (audioStarted) startAudio();
      }
    });

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'UPDATE_SOUNDSCAPE') {
        pendingSoundscape = msg.soundscape;
        pendingVolume = msg.volume !== undefined ? msg.volume : pendingVolume;
        if (audioStarted) {
          SoundtabAudio.play(pendingSoundscape);
          SoundtabAudio.setVolume(pendingVolume);
        }
        const sc = SoundtabAudio.getSoundscapes().find(s => s.id === msg.soundscape);
        createIndicator(
          sc ? sc.name + (audioStarted ? '' : ' (click to play)') : msg.soundscape,
          sc ? sc.icon : '🎵'
        );
      }
      if (msg.type === 'UPDATE_DISABLED') {
        isDisabled = msg.disabled;
        if (msg.disabled) {
          audioStarted = false;
          pendingSoundscape = null;
          SoundtabAudio.stop();
          createIndicator('Muted', '🔇');
        } else {
          chrome.runtime.sendMessage(
            { type: 'CLASSIFY', url: window.location.href, text: getPageText() },
            (response) => {
              if (!response) return;
              pendingSoundscape = response.soundscape;
              pendingVolume = response.volume;
              const sc = SoundtabAudio.getSoundscapes().find(s => s.id === pendingSoundscape);
              createIndicator(
                sc ? sc.name + ' (click to play)' : pendingSoundscape + ' (click to play)',
                sc ? sc.icon : '🎵'
              );
            }
          );
        }
      }
      if (msg.type === 'SET_VOLUME') {
        pendingVolume = msg.volume;
        if (audioStarted) SoundtabAudio.setVolume(msg.volume);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
