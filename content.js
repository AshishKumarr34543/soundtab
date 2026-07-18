(function () {
  if (window.__soundtabInjected) return;
  window.__soundtabInjected = true;

  let indicator = null;
  let currentVolume = 0.5;
  let tabId = null;

  function getTabId() {
    if (tabId) return tabId;
    try { tabId = chrome.devtools && chrome.devtools.inspectedWindow && chrome.devtools.inspectedWindow.tabId; } catch (e) {}
    return tabId;
  }

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
    indicator.title = 'SoundTab - Click the extension icon to customize';
    document.body.appendChild(indicator);
    requestAnimationFrame(() => { indicator.style.opacity = '1'; });
  }

  function init() {
    const text = getPageText();
    chrome.runtime.sendMessage(
      { type: 'CLASSIFY', url: window.location.href, text },
      (response) => {
        if (!response) return;
        const { soundscape, disabled, volume } = response;
        currentVolume = volume;

        if (disabled) {
          createIndicator('Muted', '🔇');
          return;
        }

        SoundtabAudio.play(soundscape);
        SoundtabAudio.setVolume(currentVolume);

        const sc = SoundtabAudio.getSoundscapes().find(s => s.id === soundscape);
        createIndicator(sc ? sc.name : soundscape, sc ? sc.icon : '🎵');
      }
    );

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'UPDATE_SOUNDSCAPE') {
        SoundtabAudio.play(msg.soundscape);
        SoundtabAudio.setVolume(msg.volume !== undefined ? msg.volume : currentVolume);
        if (msg.volume !== undefined) currentVolume = msg.volume;
        const sc = SoundtabAudio.getSoundscapes().find(s => s.id === msg.soundscape);
        createIndicator(sc ? sc.name : msg.soundscape, sc ? sc.icon : '🎵');
      }
      if (msg.type === 'UPDATE_DISABLED') {
        if (msg.disabled) {
          SoundtabAudio.stop();
          createIndicator('Muted', '🔇');
        } else {
          chrome.runtime.sendMessage(
            { type: 'CLASSIFY', url: window.location.href, text: getPageText() },
            (response) => {
              if (!response) return;
              SoundtabAudio.play(response.soundscape);
              SoundtabAudio.setVolume(response.volume);
              currentVolume = response.volume;
              const sc = SoundtabAudio.getSoundscapes().find(s => s.id === response.soundscape);
              createIndicator(sc ? sc.name : response.soundscape, sc ? sc.icon : '🎵');
            }
          );
        }
      }
      if (msg.type === 'SET_VOLUME') {
        currentVolume = msg.volume;
        SoundtabAudio.setVolume(msg.volume);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
