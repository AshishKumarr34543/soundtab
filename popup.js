const SOUNDSCAPES = [
  { id: 'thriller', name: 'Thriller', icon: '📰' },
  { id: 'library', name: 'Library', icon: '📚' },
  { id: 'arcade', name: 'Arcade', icon: '🎮' },
  { id: 'forest', name: 'Forest', icon: '🌲' },
  { id: 'ocean', name: 'Ocean', icon: '🌊' },
  { id: 'cafe', name: 'Cafe', icon: '☕' },
  { id: 'space', name: 'Space', icon: '🚀' },
  { id: 'rain', name: 'Rain', icon: '🌧️' },
  { id: 'night', name: 'Night', icon: '🌙' },
  { id: 'retro', name: 'Retro', icon: '🌅' },
  { id: 'zen', name: 'Zen', icon: '🧘' },
  { id: 'cave', name: 'Cave', icon: '🕳️' },
  { id: 'underwater', name: 'Underwater', icon: '🫧' }
];

let currentDomain = '';
let currentSoundscape = 'cafe';
let hasOverride = false;
let isDisabled = false;
let globallyMuted = false;
let activeTabId = null;

function getTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      void chrome.runtime.lastError;
      resolve(tabs[0] || null);
    });
  });
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch (e) {
    return '';
  }
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

function sendToTab(msg) {
  if (!activeTabId) return;
  try {
    chrome.tabs.sendMessage(activeTabId, msg, () => {
      void chrome.runtime.lastError;
    });
  } catch (e) {}
}

function queryContent(msg, cb) {
  if (!activeTabId) {
    cb(null);
    return;
  }
  try {
    chrome.tabs.sendMessage(activeTabId, msg, (resp) => {
      if (chrome.runtime.lastError || !resp) {
        void chrome.runtime.lastError;
        cb(null);
        return;
      }
      cb(resp);
    });
  } catch (e) {
    cb(null);
  }
}

function renderAfterClassify() {
  renderSoundscapes();
  updateUI();
}

function getCurrentSoundscape(cb) {
  queryContent({ type: 'GET_STATUS' }, (resp) => {
    if (resp && resp.soundscape) {
      currentSoundscape = resp.soundscape;
      cb(currentSoundscape);
      return;
    }
    sendToBackground(
      { type: 'CLASSIFY', url: 'https://' + currentDomain + '/', text: '' },
      (response) => {
        if (response && response.soundscape) currentSoundscape = response.soundscape;
        cb(currentSoundscape);
      }
    );
  });
}

function setOverrideChip() {
  const chip = document.getElementById('override-chip');
  chip.textContent = hasOverride ? 'pinned' : 'auto';
}

function setResetState() {
  document.getElementById('reset-btn').disabled = !hasOverride;
}

async function init() {
  const tab = await getTab();
  if (!tab) return;
  activeTabId = tab.id;
  currentDomain = extractDomain(tab.url || '');
  document.getElementById('domain-display').textContent = currentDomain || 'unknown';

  sendToBackground({ type: 'GET_STATE' }, (state) => {
    if (!state) return;
    globallyMuted = state.globallyMuted === true;
    document.getElementById('global-mute-toggle').checked = globallyMuted;

    isDisabled = state.disabled[currentDomain] === true;
    document.getElementById('enable-toggle').checked = !isDisabled;

    if (state.overrides[currentDomain]) {
      currentSoundscape = state.overrides[currentDomain];
      hasOverride = true;
      renderAfterClassify();
    } else {
      hasOverride = false;
      getCurrentSoundscape(renderAfterClassify);
    }
    setOverrideChip();
    setResetState();
  });

  sendToBackground(
    { type: 'GET_VOLUME', url: 'https://' + currentDomain + '/' },
    (resp) => {
      if (resp && resp.volume !== undefined) {
        const vol = Math.round(resp.volume * 100);
        document.getElementById('volume-slider').value = vol;
        document.getElementById('volume-value').textContent = vol + '%';
      }
    }
  );

  document.getElementById('global-mute-toggle').addEventListener('change', (e) => {
    globallyMuted = e.target.checked;
    sendToBackground({ type: 'SET_GLOBAL_MUTE', muted: globallyMuted });
  });

  document.getElementById('enable-toggle').addEventListener('change', (e) => {
    isDisabled = !e.target.checked;
    sendToBackground({ type: 'SET_DISABLED', domain: currentDomain, disabled: isDisabled });
    sendToTab({ type: 'UPDATE_DISABLED', disabled: isDisabled });
  });

  document.getElementById('volume-slider').addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    document.getElementById('volume-value').textContent = val + '%';
    const vol = val / 100;
    sendToBackground({ type: 'SET_VOLUME', domain: currentDomain, volume: vol });
    sendToTab({ type: 'SET_VOLUME', volume: vol });
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    sendToBackground({ type: 'REMOVE_OVERRIDE', domain: currentDomain }, () => {
      hasOverride = false;
      setOverrideChip();
      setResetState();
      queryContent({ type: 'RECLASSIFY' }, (resp) => {
        if (resp && resp.soundscape) {
          currentSoundscape = resp.soundscape;
          renderAfterClassify();
          return;
        }
        sendToBackground(
          { type: 'CLASSIFY', url: 'https://' + currentDomain + '/', text: '' },
          (response) => {
            if (response && response.soundscape) currentSoundscape = response.soundscape;
            renderAfterClassify();
          }
        );
      });
    });
  });
}

function renderSoundscapes() {
  const grid = document.getElementById('soundscape-grid');
  grid.innerHTML = '';
  for (const sc of SOUNDSCAPES) {
    const card = document.createElement('div');
    card.className = 'soundscape-card' + (sc.id === currentSoundscape ? ' active' : '');
    card.innerHTML = `<span class="icon">${sc.icon}</span><span class="name">${sc.name}</span>`;
    card.addEventListener('click', () => selectSoundscape(sc.id));
    grid.appendChild(card);
  }
}

function selectSoundscape(id) {
  currentSoundscape = id;
  hasOverride = true;
  sendToBackground({ type: 'SET_OVERRIDE', domain: currentDomain, soundscape: id }, () => {
    setOverrideChip();
    setResetState();
  });

  const vol = parseInt(document.getElementById('volume-slider').value, 10) / 100;
  sendToTab({ type: 'UPDATE_SOUNDSCAPE', soundscape: id, volume: vol });
  renderSoundscapes();
  updateUI();
}

function updateUI() {
  const sc = SOUNDSCAPES.find(s => s.id === currentSoundscape);
  if (!sc) return;
  document.getElementById('current-icon').textContent = sc.icon;
  document.getElementById('current-name').textContent = sc.name;
}

document.addEventListener('DOMContentLoaded', init);

