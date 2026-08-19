# SoundTab

A Chrome extension that plays ambient background music on websites based on what they're about.

News sites get tense thriller music. Wikipedia gets library ambiance. Social media gets arcade sounds. You get the idea.

## How it works

SoundTab looks at both the domain you're visiting and the actual content on the page to figure out what kind of vibe fits best. So it's not just hardcoded to specific sites - it actually reads the page.

## Tracks

13 soundscapes built with the Web Audio API (no audio files needed):

- Thriller - tense newsroom drones
- Library - quiet ambient with page turns
- Arcade - retro game bleeps
- Forest - wind and bird chirps
- Ocean - waves and seagulls
- Cafe - coffee shop murmur
- Space - ambient sci-fi drones
- Rain - rain with thunder rumbles
- Night - crickets and soft hum
- Retro - synthwave basslines
- Zen - meditation bowls
- Cave - dripping water echoes
- Underwater - deep bubble sounds

## Customize

Click the extension icon to:
- Pick a different soundscape for any domain
- Adjust volume per site
- Turn off audio completely for specific sites
- Mute audio on every site at once

Your settings are saved per domain, and the global mute applies everywhere.

Note: audio only starts after your first click on the page. That's a browser autoplay rule, not a bug.

## Install

1. Clone this repo
2. Go to `chrome://extensions`
3. Enable Developer Mode
4. Click "Load unpacked" and select this folder

## Tech

- Chrome Extension Manifest V3
- Web Audio API for procedural sound generation
- No external dependencies, no audio files to download
