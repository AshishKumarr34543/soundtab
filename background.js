const DEFAULT_MAP = {
  'news': 'thriller', 'bbc': 'thriller', 'cnn': 'thriller',
  'reuters': 'thriller', 'nytimes': 'thriller', 'theguardian': 'thriller',
  'washingtonpost': 'thriller',
  'wikipedia': 'library', 'wikihow': 'library', 'wiktionary': 'library',
  'reddit': 'arcade', 'twitter': 'arcade', 'x.com': 'arcade',
  'facebook': 'arcade', 'instagram': 'arcade', 'tiktok': 'arcade',
  'youtube': 'arcade', 'twitch': 'arcade', 'discord': 'arcade',
  'pinterest': 'forest', 'tumblr': 'night',
  'github': 'space', 'gitlab': 'space', 'stackoverflow': 'library',
  'medium': 'library', 'dev.to': 'space', 'producthunt': 'retro',
  'airbnb': 'cafe', 'yelp': 'cafe', 'tripadvisor': 'cafe',
  'spotify': 'cafe', 'soundcloud': 'ocean',
  'netflix': 'night', 'hulu': 'night',
  'amazon': 'retro', 'ebay': 'retro', 'etsy': 'forest', 'craigslist': 'cave',
  'npmjs': 'space', 'docs': 'library', 'mdn': 'library', 'quora': 'cafe',
  'news.ycombinator': 'space',
};

const CONTENT_KEYWORDS = {
  thriller: ['breaking', 'urgent', 'war', 'attack', 'crisis', 'disaster', 'shooting', 'murder', 'death', 'explosion', 'hostage', 'terror', 'threat', 'warning', 'danger', 'crash', 'emergency', 'killed', 'violent'],
  library: ['research', 'encyclopedia', 'reference', 'documentation', 'guide', 'tutorial', 'definition', 'academic', 'study', 'learn', 'knowledge', 'wiki', 'manual', 'specification', 'how to', 'what is'],
  arcade: ['game', 'play', 'fun', 'meme', 'viral', 'trending', 'popular', 'like', 'share', 'comment', 'follow', 'subscribe', 'social', 'upvote', 'downvote'],
  forest: ['nature', 'garden', 'plant', 'tree', 'flower', 'wildlife', 'bird', 'hiking', 'camping', 'outdoor', 'organic', 'environment', 'green', 'forest', 'trail'],
  ocean: ['beach', 'travel', 'vacation', 'sea', 'ocean', 'island', 'surf', 'swim', 'dive', 'sail', 'tropical', 'resort', 'cruise'],
  cafe: ['food', 'recipe', 'coffee', 'restaurant', 'cafe', 'cooking', 'baking', 'menu', 'dinner', 'lunch', 'breakfast', 'meal', 'drink', 'wine', 'beer', 'cocktail', 'eat'],
  space: ['tech', 'science', 'code', 'programming', 'software', 'developer', 'api', 'data', 'algorithm', 'server', 'cloud', 'ai', 'machine learning', 'startup', 'innovation', 'computer', 'digital'],
  rain: ['weather', 'rain', 'storm', 'snow', 'cloud', 'forecast', 'climate', 'temperature', 'meteorology', 'precipitation'],
  night: ['movie', 'film', 'cinema', 'tv', 'show', 'series', 'episode', 'entertainment', 'celebrity', 'hollywood', 'music', 'album', 'watch'],
  retro: ['shop', 'store', 'buy', 'sale', 'price', 'deal', 'discount', 'product', 'order', 'cart', 'shopping', 'bargain', 'offer', 'purchase'],
};

let overrides = {};
let disabled = {};
let volumes = {};

chrome.storage.local.get(['overrides', 'disabled', 'volumes'], (r) => {
  overrides = r.overrides || {};
  disabled = r.disabled || {};
  volumes = r.volumes || {};
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.overrides) overrides = changes.overrides.newValue || {};
  if (changes.disabled) disabled = changes.disabled.newValue || {};
  if (changes.volumes) volumes = changes.volumes.newValue || {};
});

function extractDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
}

function domainScore(domain) {
  const lower = domain.toLowerCase();
  for (const [pattern, id] of Object.entries(DEFAULT_MAP)) {
    if (lower.includes(pattern)) return { id, score: 0.9 };
  }
  return null;
}

function contentScore(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [id, keywords] of Object.entries(CONTENT_KEYWORDS)) {
    scores[id] = 0;
    for (const kw of keywords) {
      const re = new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
      const m = lower.match(re);
      if (m) scores[id] += m.length;
    }
  }
  let best = null, bestScore = 0;
  for (const [id, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; best = id; }
  }
  return bestScore > 0 ? { id: best, score: bestScore * 0.1 } : null;
}

function classify(url, text) {
  const domain = extractDomain(url);
  if (overrides[domain]) return overrides[domain];
  const dr = domainScore(domain);
  const cr = contentScore(text);
  if (dr && dr.score >= 0.7) return dr.id;
  if (dr && cr) return dr.score >= cr.score ? dr.id : cr.id;
  return dr ? dr.id : (cr ? cr.id : 'cafe');
}

function getVolume(url) {
  const domain = extractDomain(url);
  return volumes[domain] !== undefined ? volumes[domain] : 0.5;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CLASSIFY') {
    const url = msg.url || (sender.tab && sender.tab.url) || '';
    const text = msg.text || '';
    const domain = extractDomain(url);
    sendResponse({
      soundscape: classify(url, text),
      disabled: disabled[domain] === true,
      domain,
      volume: getVolume(url),
    });
    return true;
  }

  if (msg.type === 'SET_OVERRIDE') {
    overrides[msg.domain] = msg.soundscape;
    chrome.storage.local.set({ overrides: { ...overrides } });
    sendResponse({ ok: true });
  }
  if (msg.type === 'REMOVE_OVERRIDE') {
    delete overrides[msg.domain];
    chrome.storage.local.set({ overrides: { ...overrides } });
    sendResponse({ ok: true });
  }
  if (msg.type === 'SET_DISABLED') {
    disabled[msg.domain] = msg.disabled;
    chrome.storage.local.set({ disabled: { ...disabled } });
    sendResponse({ ok: true });
  }
  if (msg.type === 'GET_STATE') {
    sendResponse({ overrides: { ...overrides }, disabled: { ...disabled } });
  }
  if (msg.type === 'SET_VOLUME') {
    volumes[msg.domain] = msg.volume;
    chrome.storage.local.set({ volumes: { ...volumes } });
    sendResponse({ ok: true });
  }
  if (msg.type === 'GET_VOLUME') {
    sendResponse({ volume: getVolume(msg.url || '') });
    return true;
  }
});
