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
];

let currentDomain = '';
let currentSoundscape = 'cafe';
let hasOverride = false;
let isDisabled = false;

function getTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0] || null);
    });
  });
}

function extractDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
}

async function init() {
  const tab = await getTab();
  if (!tab) return;
  const url = tab.url || '';
  currentDomain = extractDomain(url);
  document.getElementById('domain-display').textContent = currentDomain || 'unknown';

  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state) => {
    if (!state) return;
    isDisabled = state.disabled[currentDomain] === true;

    if (state.overrides[currentDomain]) {
      currentSoundscape = state.overrides[currentDomain];
      hasOverride = true;
      renderSoundscapes();
      updateUI();
    } else {
      hasOverride = false;
      chrome.runtime.sendMessage(
        { type: 'CLASSIFY', url: 'https://' + currentDomain + '/', text: '' },
        (resp) => {
          if (resp) {
            currentSoundscape = resp.soundscape;
            renderSoundscapes();
            updateUI();
          }
        }
      );
    }

    document.getElementById('enable-toggle').checked = !isDisabled;
  });

  chrome.runtime.sendMessage(
    { type: 'GET_VOLUME', url: 'https://' + currentDomain + '/' },
    (resp) => {
      if (resp) {
        const vol = Math.round(resp.volume * 100);
        document.getElementById('volume-slider').value = vol;
        document.getElementById('volume-value').textContent = vol + '%';
      }
    }
  );

  document.getElementById('enable-toggle').addEventListener('change', async (e) => {
    isDisabled = !e.target.checked;
    chrome.runtime.sendMessage({ type: 'SET_DISABLED', domain: currentDomain, disabled: isDisabled });
    const tab = await getTab();
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_DISABLED', disabled: isDisabled });
    }
  });

  document.getElementById('volume-slider').addEventListener('input', async (e) => {
    const val = parseInt(e.target.value);
    document.getElementById('volume-value').textContent = val + '%';
    const vol = val / 100;
    chrome.runtime.sendMessage({ type: 'SET_VOLUME', domain: currentDomain, volume: vol });
    const tab = await getTab();
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'SET_VOLUME', volume: vol });
    }
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'REMOVE_OVERRIDE', domain: currentDomain });
    hasOverride = false;
    classifyCurrent();
  });
}

function classifyCurrent() {
  chrome.runtime.sendMessage(
    { type: 'CLASSIFY', url: 'https://' + currentDomain + '/', text: '' },
    (response) => {
      if (response) {
        currentSoundscape = response.soundscape;
        updateUI();
        renderSoundscapes();
        const tab = getTab().then(tab => {
          if (tab && tab.id) {
            const vol = parseInt(document.getElementById('volume-slider').value) / 100;
            chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_SOUNDSCAPE', soundscape: currentSoundscape, volume: vol });
          }
        });
      }
    }
  );
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

async function selectSoundscape(id) {
  currentSoundscape = id;
  hasOverride = true;
  chrome.runtime.sendMessage({ type: 'SET_OVERRIDE', domain: currentDomain, soundscape: id });

  const tab = await getTab();
  if (tab && tab.id) {
    const vol = parseInt(document.getElementById('volume-slider').value) / 100;
    chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_SOUNDSCAPE', soundscape: id, volume: vol });
  }
  renderSoundscapes();
  updateUI();
}

function updateUI() {
  const sc = SOUNDSCAPES.find(s => s.id === currentSoundscape);
  if (sc) {
    document.getElementById('current-icon').textContent = sc.icon;
    document.getElementById('current-name').textContent = sc.name;
  }
}

document.addEventListener('DOMContentLoaded', init);
