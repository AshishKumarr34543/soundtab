<<<<<<< HEAD

=======
const DEFAULT_MAP = {
  'news': 'thriller', 'bbc': 'thriller', 'cnn': 'thriller',
  'reuters': 'thriller', 'nytimes': 'thriller', 'theguardian': 'thriller',
  'washingtonpost': 'thriller', 'foxnews': 'thriller', 'apnews': 'thriller',
  'bloomberg': 'thriller', 'aljazeera': 'thriller', 'skynews': 'thriller',
  'abcnews': 'thriller', 'nbcnews': 'thriller', 'cbsnews': 'thriller',
  'marketwatch': 'thriller', 'investing': 'thriller', 'finance': 'thriller',
  'theverge': 'space', 'techcrunch': 'space', 'wired': 'space',
  'arstechnica': 'space', 'engadget': 'space', 'gizmodo': 'space',
  'wikipedia': 'library', 'wikihow': 'library', 'wiktionary': 'library',
  'wikidata': 'library', 'britannica': 'library',
  'stackoverflow': 'library', 'stackexchange': 'library',
  'geeksforgeeks': 'library', 'w3schools': 'library', 'khanacademy': 'library',
  'coursera': 'library', 'udemy': 'library', 'edx': 'library',
  'webmd': 'library', 'healthline': 'library', 'mayoclinic': 'library',
  'brilliant': 'library', 'notion': 'library', 'archive': 'library',
  'docs': 'library', 'mdn': 'library', 'developer': 'library',
  'learn': 'library', 'readthedocs': 'library',
  'reddit': 'arcade', 'twitter': 'arcade', 'x.com': 'arcade',
  'facebook': 'arcade', 'instagram': 'arcade', 'tiktok': 'arcade',
  'youtube': 'arcade', 'twitch': 'arcade', 'discord': 'arcade',
  'snapchat': 'arcade', 'whatsapp': 'arcade', 'telegram': 'arcade',
  'weibo': 'arcade', 'bluesky': 'arcade', 'threads': 'arcade',
  'messenger': 'arcade', 'duolingo': 'arcade',
  'espn': 'arcade', 'nba': 'arcade', 'nfl': 'arcade', 'fifa': 'arcade',
  'mlb': 'arcade', 'nhl': 'arcade', 'uefa': 'arcade', 'premierleague': 'arcade',
  'steam': 'arcade', 'steampowered': 'arcade', 'epicgames': 'arcade', 'roblox': 'arcade',
  'itch': 'arcade', 'playstation': 'arcade', 'xbox': 'arcade',
  'nintendo': 'arcade', 'kongregate': 'arcade', 'gog': 'arcade',
  'github': 'space', 'gitlab': 'space', 'bitbucket': 'space',
  'npmjs': 'space', 'dev.to': 'space', 'news.ycombinator': 'space',
  'hackernews': 'space', 'hashnode': 'space', 'dockerhub': 'space',
  'replit': 'space', 'codepen': 'space', 'codesandbox': 'space',
  'leetcode': 'space', 'google': 'space', 'drive.google': 'space',
  'slack': 'space', 'zoom': 'space', 'teams': 'space',
  'coinbase': 'space', 'binance': 'space', 'coindesk': 'space',
  'medium': 'library', 'quora': 'cafe', 'producthunt': 'retro',
  'pinterest': 'forest', 'etsy': 'forest', 'nationalgeographic': 'forest',
  'alltrails': 'forest', 'nasa': 'space', 'noaa': 'rain',
  'airbnb': 'cafe', 'yelp': 'cafe', 'tripadvisor': 'cafe',
  'booking': 'ocean', 'expedia': 'ocean', 'agoda': 'ocean',
  'opentable': 'cafe', 'zomato': 'cafe', 'allrecipes': 'cafe',
  'foodnetwork': 'cafe',
  'spotify': 'cafe', 'soundcloud': 'ocean', 'bandcamp': 'cafe',
  'netflix': 'night', 'hulu': 'night', 'disneyplus': 'night',
  'primevideo': 'night', 'max.com': 'night', 'peacocktv': 'night',
  'imdb': 'night', 'rottentomatoes': 'night', 'tumblr': 'night',
  'wattpad': 'night',
  'amazon': 'retro', 'ebay': 'retro', 'walmart': 'retro',
  'target': 'retro', 'bestbuy': 'retro', 'alibaba': 'retro',
  'aliexpress': 'retro', 'shopify': 'retro', 'ikea': 'retro',
  'homedepot': 'retro', 'lowes': 'retro', 'gumroad': 'retro',
  'newegg': 'space',
  'craigslist': 'cave',
  'weather': 'rain', 'accuweather': 'rain', 'wunderground': 'rain',
  'headspace': 'zen', 'calm': 'zen', 'meditation': 'zen'
};

const CONTENT_KEYWORDS = {
  thriller: ['breaking', 'urgent', 'war', 'attack', 'crisis', 'disaster', 'shooting', 'murder', 'death', 'explosion', 'hostage', 'terror', 'threat', 'warning', 'danger', 'crash', 'emergency', 'killed', 'violent', 'bomb', 'fire', 'earthquake', 'flood', 'pandemic', 'lawsuit', 'trial', 'prison', 'crime', 'killer', 'victim', 'injured', 'fatal', 'deadly', 'collapse', 'hack', 'breach', 'cyberattack', 'recession', 'protest', 'riot', 'conflict', 'invasion', 'missile', 'airstrike', 'casualty', 'evacuate', 'tsunami', 'hurricane', 'wildfire', 'shootout', 'covid', 'epidemic'],
  library: ['research', 'encyclopedia', 'reference', 'documentation', 'guide', 'tutorial', 'definition', 'academic', 'study', 'learn', 'knowledge', 'wiki', 'manual', 'specification', 'how to', 'what is', 'history', 'science', 'philosophy', 'textbook', 'journal', 'paper', 'thesis', 'dictionary', 'glossary', 'citation', 'course', 'lecture', 'curriculum', 'education', 'scholar', 'teacher', 'student', 'homework', 'exam', 'bibliography'],
  arcade: ['game', 'play', 'fun', 'meme', 'viral', 'trending', 'popular', 'like', 'share', 'comment', 'follow', 'subscribe', 'social', 'upvote', 'downvote', 'stream', 'gamer', 'gaming', 'level', 'score', 'quest', 'achievement', 'tournament', 'esports', 'player', 'minecraft', 'fortnite', 'funny', 'lol', 'reel', 'creator', 'influencer', 'hashtag', 'memes', 'challenge', 'prank', 'viral video'],
  forest: ['nature', 'garden', 'plant', 'tree', 'flower', 'wildlife', 'bird', 'hiking', 'camping', 'outdoor', 'organic', 'environment', 'green', 'forest', 'trail', 'mountain', 'wilderness', 'national park', 'wildflower', 'butterfly', 'biodiversity', 'conservation', 'eco', 'sustainability', 'renewable', 'hunting', 'fishing', 'river', 'lake', 'meadow', 'orchid', 'botanical'],
  ocean: ['beach', 'travel', 'vacation', 'sea', 'ocean', 'island', 'surf', 'swim', 'dive', 'sail', 'tropical', 'resort', 'cruise', 'hotel', 'flight', 'destination', 'itinerary', 'paradise', 'coast', 'shore', 'wave', 'sand', 'coral', 'reef', 'snorkel', 'yacht', 'port', 'harbor', 'tourism', 'tourist'],
  cafe: ['food', 'recipe', 'coffee', 'restaurant', 'cafe', 'cooking', 'baking', 'menu', 'dinner', 'lunch', 'breakfast', 'meal', 'drink', 'wine', 'beer', 'cocktail', 'eat', 'kitchen', 'chef', 'pastry', 'dessert', 'espresso', 'latte', 'barista', 'brunch', 'snack', 'grocery', 'market', 'ingredient', 'cuisine', 'dish', 'taste', 'flavor', 'bakery'],
  space: ['tech', 'science', 'code', 'programming', 'software', 'developer', 'api', 'data', 'algorithm', 'server', 'cloud', 'ai', 'machine learning', 'startup', 'innovation', 'computer', 'digital', 'app', 'website', 'internet', 'online', 'artificial intelligence', 'neural network', 'cybersecurity', 'blockchain', 'crypto', 'bitcoin', 'database', 'frontend', 'backend', 'javascript', 'python', 'react', 'opensource', 'hacker', 'hackathon', 'engineering', 'hardware', 'gadget', 'device', 'robot', 'automation', 'sdk', 'deployment', 'production', 'pipeline'],
  rain: ['weather', 'rain', 'storm', 'snow', 'cloud', 'forecast', 'climate', 'temperature', 'meteorology', 'precipitation', 'thunder', 'lightning', 'typhoon', 'monsoon', 'drought', 'heatwave', 'sleet', 'hail', 'humidity', 'atmosphere', 'sunrise', 'sunset'],
  night: ['movie', 'film', 'cinema', 'tv', 'show', 'series', 'episode', 'entertainment', 'celebrity', 'hollywood', 'music', 'album', 'watch', 'trailer', 'review', 'actor', 'actress', 'director', 'soundtrack', 'pop culture', 'streaming', 'award', 'oscar', 'grammy', 'concert', 'tour', 'band', 'song', 'lyrics', 'artist', 'binge'],
  retro: ['shop', 'store', 'buy', 'sale', 'price', 'deal', 'discount', 'product', 'order', 'cart', 'shopping', 'bargain', 'offer', 'purchase', 'checkout', 'delivery', 'coupon', 'clearance', 'inventory', 'wholesale', 'retail', 'wishlist', 'black friday', 'auction', 'secondhand', 'vintage', 'furniture', 'apparel'],
  zen: ['meditation', 'mindfulness', 'yoga', 'breathing', 'calm', 'relax', 'peace', 'spiritual', 'buddhist', 'zen', 'breath', 'stillness', 'gratitude', 'wellness', 'mental health', 'therapy', 'anxiety', 'stress', 'sleep', 'insomnia', 'focus', 'balance', 'harmony', 'self care', 'journaling', 'affirmation', 'consciousness', 'awakening', 'serenity'],
  cave: ['archaeology', 'ancient', 'ruins', 'fossil', 'dinosaur', 'museum', 'artifact', 'excavation', 'expedition', 'exploration', 'underground', 'cave', 'mine', 'tunnel', 'subterranean', 'crystal', 'gem', 'gold', 'treasure', 'dig', 'bedrock', 'quarry', 'prehistoric'],
  underwater: ['fish', 'aquarium', 'shark', 'whale', 'dolphin', 'octopus', 'jellyfish', 'marine', 'underwater', 'scuba', 'sealife', 'coral reef', 'aquatic', 'shell', 'starfish', 'turtle', 'plankton', 'kelp', 'submarine', 'depth', 'wreck', 'tide', 'squid', 'crab']
};

let overrides = {};
let disabled = {};
let volumes = {};
let globallyMuted = false;

const stateReady = new Promise((resolve) => {
  chrome.storage.local.get(['overrides', 'disabled', 'volumes', 'globallyMuted'], (r) => {
    overrides = (r && r.overrides) || {};
    disabled = (r && r.disabled) || {};
    volumes = (r && r.volumes) || {};
    globallyMuted = !!(r && r.globallyMuted);
    resolve();
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.overrides) overrides = changes.overrides.newValue || {};
  if (changes.disabled) disabled = changes.disabled.newValue || {};
  if (changes.volumes) volumes = changes.volumes.newValue || {};
  if (changes.globallyMuted) globallyMuted = changes.globallyMuted.newValue === true;
});

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch (e) {
    return '';
  }
}

function patternMatches(lower, pattern) {
  if (lower === pattern) return true;
  return lower.startsWith(pattern + '.') ||
         lower.endsWith('.' + pattern) ||
         lower.includes('.' + pattern + '.');
}

function domainScore(domain) {
  const lower = domain.toLowerCase();
  if (!lower) return null;
  const segments = lower.split('.');
  for (const [pattern, id] of Object.entries(DEFAULT_MAP)) {
    if (pattern.includes('.') && patternMatches(lower, pattern)) {
      return { id, score: 0.95 };
    }
  }
  for (const [pattern, id] of Object.entries(DEFAULT_MAP)) {
    if (!pattern.includes('.') && segments.includes(pattern)) {
      return { id, score: 0.95 };
    }
  }
  return null;
}

function contentScore(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const scores = {};
  for (const [id, keywords] of Object.entries(CONTENT_KEYWORDS)) {
    scores[id] = 0;
    for (const kw of keywords) {
      const re = new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
      const m = lower.match(re);
      if (m) scores[id] += m.length;
    }
  }
  let best = null;
  let bestScore = 0;
  for (const [id, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }
  if (bestScore === 0) return null;
  return { id: best, count: bestScore, score: Math.min(0.99, bestScore * 0.2) };
}

function classify(url, text) {
  const domain = extractDomain(url);
  if (overrides[domain]) return overrides[domain];
  const dr = domainScore(domain);
  const cr = contentScore(text);
  if (dr && cr) return dr.score >= cr.score ? dr.id : cr.id;
  if (dr) return dr.id;
  if (cr) return cr.id;
  return 'cafe';
}

function getVolume(url) {
  const domain = extractDomain(url);
  return volumes[domain] !== undefined ? volumes[domain] : 0.5;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  stateReady.then(() => {
    try {
      if (msg.type === 'CLASSIFY') {
        const url = msg.url || (sender.tab && sender.tab.url) || '';
        const text = msg.text || '';
        const domain = extractDomain(url);
        sendResponse({
          soundscape: classify(url, text),
          disabled: disabled[domain] === true,
          domain,
          volume: getVolume(url),
          globallyMuted
        });
        return;
      }

      if (msg.type === 'SET_OVERRIDE') {
        overrides[msg.domain] = msg.soundscape;
        chrome.storage.local.set({ overrides: { ...overrides } });
        sendResponse({ ok: true });
        return;
      }

      if (msg.type === 'REMOVE_OVERRIDE') {
        delete overrides[msg.domain];
        chrome.storage.local.set({ overrides: { ...overrides } });
        sendResponse({ ok: true });
        return;
      }

      if (msg.type === 'SET_DISABLED') {
        if (msg.disabled) {
          disabled[msg.domain] = true;
        } else {
          delete disabled[msg.domain];
        }
        chrome.storage.local.set({ disabled: { ...disabled } });
        sendResponse({ ok: true });
        return;
      }

      if (msg.type === 'SET_VOLUME') {
        volumes[msg.domain] = msg.volume;
        chrome.storage.local.set({ volumes: { ...volumes } });
        sendResponse({ ok: true });
        return;
      }

      if (msg.type === 'GET_VOLUME') {
        sendResponse({ volume: getVolume(msg.url || '') });
        return;
      }

      if (msg.type === 'GET_STATE') {
        sendResponse({
          overrides: { ...overrides },
          disabled: { ...disabled },
          volumes: { ...volumes },
          globallyMuted
        });
        return;
      }

      if (msg.type === 'SET_GLOBAL_MUTE') {
        globallyMuted = msg.muted === true;
        chrome.storage.local.set({ globallyMuted });
        chrome.tabs.query({}, (tabs) => {
          for (const tab of tabs) {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: 'GLOBAL_MUTE', muted: globallyMuted }).catch(() => {});
            }
          }
        });
        sendResponse({ ok: true });
        return;
      }

      sendResponse({ error: 'unknown message type' });
    } catch (e) {
      try { sendResponse({ error: String(e) }); } catch (e2) {}
    }
  });
  return true;
});
>>>>>>> 2ef60ee (background classifier for domains and page text)
