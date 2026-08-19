const SoundtabAudio = (() => {
  let ctx = null;
  let cleanupFns = [];
  let masterGain = null;
  let baseGain = 0.25;
  let userVolume = 0.5;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noiseBuffer(length = 2) {
    const sr = getCtx().sampleRate;
    const len = sr * length;
    const buf = getCtx().createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function createNoiseSource(buf) {
    const src = getCtx().createBufferSource();
    src.buffer = buf || noiseBuffer();
    src.loop = true;
    return src;
  }

  function createOsc(type, freq) {
    const osc = getCtx().createOscillator();
    osc.type = type || 'sine';
    osc.frequency.value = freq || 220;
    return osc;
  }

  function createGain(val) {
    const g = getCtx().createGain();
    g.gain.value = val === undefined ? 0.5 : val;
    return g;
  }

  function createFilter(type, freq, q) {
    const f = getCtx().createBiquadFilter();
    f.type = type || 'lowpass';
    f.frequency.value = freq || 1000;
    f.Q.value = q || 1;
    return f;
  }

  function rng(min, max) { return Math.random() * (max - min) + min; }

  function loop(fn, ms) {
    const id = setInterval(fn, ms);
    const c = () => clearInterval(id);
    cleanupFns.push(c);
    return c;
  }

  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    const c = () => clearTimeout(id);
    cleanupFns.push(c);
    return c;
  }

  function addCleanup(fn) { cleanupFns.push(fn); }

  function runCleanup() {
    const fns = cleanupFns;
    cleanupFns = [];
    fns.forEach(f => { try { f(); } catch (e) {} });
  }

  function applyVolume() {
    if (!masterGain) return;
    const scaled = baseGain * (0.25 + userVolume * 5.75);
    masterGain.gain.value = Math.max(0.0001, Math.min(1, scaled));
  }

  function newMaster(base) {
    baseGain = base;
    masterGain = createGain(base);
    applyVolume();
    addCleanup(() => { try { if (masterGain) masterGain.disconnect(); } catch (e) {} });
    masterGain.connect(getCtx().destination);
    return masterGain;
  }

  const soundscapes = {};

  soundscapes.thriller = {
    name: 'Thriller', icon: '📰',
    start() {
      const c = getCtx();
      const g = newMaster(0.3);

      const noise = createNoiseSource();
      addCleanup(() => { try { noise.stop(); } catch (e) {} });
      noise.connect(createFilter('lowpass', 120, 5)).connect(createFilter('highpass', 40)).connect(g);
      noise.start();

      const drone = createOsc('sawtooth', 55);
      addCleanup(() => { try { drone.stop(); } catch (e) {} });
      drone.connect(createFilter('lowpass', 200)).connect(createGain(0.2)).connect(g);
      drone.start();

      const pulse = createOsc('square', 80);
      addCleanup(() => { try { pulse.stop(); } catch (e) {} });
      const gPulse = createGain(0);
      pulse.connect(createFilter('lowpass', 500)).connect(gPulse).connect(g);
      pulse.start();

      const sub = createOsc('sine', 30);
      addCleanup(() => { try { sub.stop(); } catch (e) {} });
      sub.connect(createGain(0.22)).connect(g);
      sub.start();

      loop(() => {
        if (Math.random() > 0.7) {
          gPulse.gain.setValueAtTime(0.16, c.currentTime);
          gPulse.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
        }
      }, 800);
    }
  };

  soundscapes.library = {
    name: 'Library', icon: '📚',
    start() {
      const c = getCtx();
      const g = newMaster(0.2);

      const noise = createNoiseSource();
      addCleanup(() => { try { noise.stop(); } catch (e) {} });
      noise.connect(createFilter('lowpass', 400, 2)).connect(createGain(0.55)).connect(g);
      noise.start();

      const hum = createOsc('sine', 120);
      addCleanup(() => { try { hum.stop(); } catch (e) {} });
      hum.connect(createGain(0.12)).connect(g);
      hum.start();

      const pageTurn = createOsc('triangle', 2000);
      addCleanup(() => { try { pageTurn.stop(); } catch (e) {} });
      const gPage = createGain(0);
      pageTurn.connect(gPage).connect(g);
      pageTurn.start();

      loop(() => {
        if (Math.random() > 0.92) {
          gPage.gain.setValueAtTime(0.05, c.currentTime);
          gPage.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
        }
      }, 2000);
    }
  };

  soundscapes.arcade = {
    name: 'Arcade', icon: '🎮',
    start() {
      const c = getCtx();
      const g = newMaster(0.25);

      let note = 0;
      const notes = [523, 659, 784, 1047, 784, 659];
      loop(() => {
        const osc = createOsc('square', notes[note % notes.length]);
        const gNote = createGain(0.11);
        osc.connect(gNote).connect(g);
        osc.start();
        gNote.gain.setValueAtTime(0.11, c.currentTime);
        gNote.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
        osc.stop(c.currentTime + 0.12);
        note++;
      }, 300);

      const pad = createOsc('triangle', 262);
      addCleanup(() => { try { pad.stop(); } catch (e) {} });
      pad.connect(createGain(0.07)).connect(g);
      pad.start();
    }
  };

  soundscapes.forest = {
    name: 'Forest', icon: '🌲',
    start() {
      const c = getCtx();
      const g = newMaster(0.25);

      const wind = createNoiseSource();
      addCleanup(() => { try { wind.stop(); } catch (e) {} });
      const fWind = createFilter('bandpass', 800, 0.5);
      wind.connect(fWind).connect(createGain(0.22)).connect(g);
      wind.start();

      loop(() => { fWind.frequency.value = rng(400, 2000); }, 3000);

      loop(() => {
        if (Math.random() > 0.7) {
          const bird = createOsc('sine', rng(1500, 3500));
          const gBird = createGain(0);
          bird.connect(createFilter('lowpass', 4000)).connect(gBird).connect(g);
          bird.start();
          const t = c.currentTime;
          gBird.gain.setValueAtTime(0, t);
          gBird.gain.linearRampToValueAtTime(0.09, t + 0.05);
          gBird.gain.linearRampToValueAtTime(0.045, t + 0.15);
          gBird.gain.linearRampToValueAtTime(0, t + 0.3);
          bird.stop(t + 0.3);
        }
      }, 1500);
    }
  };

  soundscapes.ocean = {
    name: 'Ocean', icon: '🌊',
    start() {
      const c = getCtx();
      const g = newMaster(0.25);

      const waveNoise = createNoiseSource();
      addCleanup(() => { try { waveNoise.stop(); } catch (e) {} });
      const fWave = createFilter('lowpass', 400, 1);
      const gWave = createGain(0.3);
      waveNoise.connect(fWave).connect(gWave).connect(g);
      waveNoise.start();

      let phase = 0;
      loop(() => {
        phase += 0.05;
        gWave.gain.value = Math.sin(phase) * 0.2 + 0.22;
        fWave.frequency.value = Math.sin(phase * 0.7) * 150 + 300;
      }, 100);

      const seagull = createOsc('sine', 800);
      addCleanup(() => { try { seagull.stop(); } catch (e) {} });
      const gGull = createGain(0);
      seagull.connect(gGull).connect(g);
      seagull.start();

      let gullPhase = 0;
      loop(() => {
        gullPhase += 0.3;
        if (Math.sin(gullPhase) > 0.8) {
          gGull.gain.setValueAtTime(0.07, c.currentTime);
          gGull.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
        }
      }, 200);
    }
  };

  soundscapes.cafe = {
    name: 'Cafe', icon: '☕',
    start() {
      const c = getCtx();
      const g = newMaster(0.2);

      const murmur = createNoiseSource();
      addCleanup(() => { try { murmur.stop(); } catch (e) {} });
      murmur.connect(createFilter('bandpass', 600, 1.5)).connect(createGain(0.28)).connect(g);
      murmur.start();

      const hum = createOsc('sine', 180);
      addCleanup(() => { try { hum.stop(); } catch (e) {} });
      hum.connect(createGain(0.08)).connect(g);
      hum.start();

      loop(() => {
        if (Math.random() > 0.85) {
          const clink = createOsc('sine', rng(2000, 4000));
          const gClink = createGain(0);
          clink.connect(gClink).connect(g);
          clink.start();
          const t = c.currentTime;
          gClink.gain.setValueAtTime(0.06, t);
          gClink.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          clink.stop(t + 0.08);
        }
      }, 1000);
    }
  };

  soundscapes.space = {
    name: 'Space', icon: '🚀',
    start() {
      const c = getCtx();
      const g = newMaster(0.25);

      [65, 98, 131].forEach((freq, i) => {
        const d = createOsc(i === 1 ? 'triangle' : 'sine', freq);
        addCleanup(() => { try { d.stop(); } catch (e) {} });
        d.connect(createGain([0.14, 0.1, 0.07][i])).connect(g);
        d.start();
      });

      const noise = createNoiseSource();
      addCleanup(() => { try { noise.stop(); } catch (e) {} });
      noise.connect(createFilter('bandpass', 3000, 5)).connect(createGain(0.06)).connect(g);
      noise.start();

      loop(() => {
        if (Math.random() > 0.6) {
          const chime = createOsc('sine', rng(800, 2400));
          const gChime = createGain(0);
          chime.connect(gChime).connect(g);
          chime.start();
          const t = c.currentTime;
          gChime.gain.setValueAtTime(0, t);
          gChime.gain.linearRampToValueAtTime(0.09, t + 0.3);
          gChime.gain.exponentialRampToValueAtTime(0.001, t + 2);
          chime.stop(t + 2);
        }
      }, 2000);
    }
  };

  soundscapes.rain = {
    name: 'Rain', icon: '🌧️',
    start() {
      const c = getCtx();
      const g = newMaster(0.3);

      const rain = createNoiseSource();
      addCleanup(() => { try { rain.stop(); } catch (e) {} });
      const fRain = createFilter('highpass', 200, 1);
      const gRain = createGain(0.42);
      rain.connect(fRain).connect(gRain).connect(g);
      rain.start();

      loop(() => {
        fRain.frequency.value = rng(100, 800);
        gRain.gain.value = rng(0.3, 0.5);
      }, 300);

      loop(() => {
        if (Math.random() > 0.92) {
          const rumble = createNoiseSource(noiseBuffer(3));
          const gR = createGain(0);
          rumble.connect(gR).connect(g);
          rumble.start();
          const t = c.currentTime;
          gR.gain.setValueAtTime(0, t);
          gR.gain.linearRampToValueAtTime(0.3, t + 0.1);
          gR.gain.exponentialRampToValueAtTime(0.001, t + 2);
          rumble.stop(t + 2.1);
        }
      }, 5000);
    }
  };

  soundscapes.night = {
    name: 'Night', icon: '🌙',
    start() {
      const c = getCtx();
      const g = newMaster(0.2);

      const drone = createOsc('sine', 55);
      addCleanup(() => { try { drone.stop(); } catch (e) {} });
      drone.connect(createGain(0.14)).connect(g);
      drone.start();

      const hum = createOsc('triangle', 80);
      addCleanup(() => { try { hum.stop(); } catch (e) {} });
      hum.connect(createGain(0.09)).connect(g);
      hum.start();

      loop(() => {
        if (Math.random() > 0.5) {
          const cricket = createOsc('sine', rng(3000, 5000));
          const gCr = createGain(0);
          cricket.connect(gCr).connect(g);
          cricket.start();
          const t = c.currentTime;
          for (let i = 0; i < 5; i++) {
            const tOff = i * 0.04;
            gCr.gain.setValueAtTime(0.05, t + tOff);
            gCr.gain.setValueAtTime(0, t + tOff + 0.02);
          }
          cricket.stop(t + 0.3);
        }
      }, 1200);
    }
  };

  soundscapes.retro = {
    name: 'Retro', icon: '🌅',
    start() {
      const c = getCtx();
      const g = newMaster(0.2);

      const bassNotes = [65, 65, 77, 77, 87, 87, 65, 65];
      let step = 0;
      loop(() => {
        const bass = createOsc('sawtooth', bassNotes[step % bassNotes.length]);
        bass.connect(createFilter('lowpass', 300)).connect(createGain(0.12)).connect(g);
        bass.start();
        bass.stop(c.currentTime + 0.4);
        step++;
      }, 500);

      const pad = createOsc('triangle', 130);
      addCleanup(() => { try { pad.stop(); } catch (e) {} });
      pad.connect(createFilter('lowpass', 600)).connect(createGain(0.08)).connect(g);
      pad.start();
    }
  };

  soundscapes.zen = {
    name: 'Zen', icon: '🧘',
    start() {
      const c = getCtx();
      const g = newMaster(0.15);

      const drone = createOsc('sine', 60);
      addCleanup(() => { try { drone.stop(); } catch (e) {} });
      drone.connect(createGain(0.13)).connect(g);
      drone.start();

      const harmonic = createOsc('sine', 180);
      addCleanup(() => { try { harmonic.stop(); } catch (e) {} });
      harmonic.connect(createGain(0.09)).connect(g);
      harmonic.start();

      loop(() => {
        if (Math.random() > 0.8) {
          const freq = rng(200, 600);
          const bowl = createOsc('sine', freq);
          const gBowl = createGain(0);
          bowl.connect(createFilter('bandpass', freq, 0.5)).connect(gBowl).connect(g);
          bowl.start();
          const t = c.currentTime;
          gBowl.gain.setValueAtTime(0, t);
          gBowl.gain.linearRampToValueAtTime(0.16, t + 0.1);
          gBowl.gain.exponentialRampToValueAtTime(0.001, t + 4);
          bowl.stop(t + 4);
        }
      }, 3000);
    }
  };

  soundscapes.cave = {
    name: 'Cave', icon: '🕳️',
    start() {
      const c = getCtx();
      const g = newMaster(0.2);

      const wind = createNoiseSource();
      addCleanup(() => { try { wind.stop(); } catch (e) {} });
      wind.connect(createFilter('lowpass', 250, 2)).connect(createGain(0.22)).connect(g);
      wind.start();

      const drone = createOsc('sine', 45);
      addCleanup(() => { try { drone.stop(); } catch (e) {} });
      drone.connect(createGain(0.16)).connect(g);
      drone.start();

      loop(() => {
        if (Math.random() > 0.6) {
          const drip = createOsc('sine', rng(800, 2000));
          const gDrip = createGain(0);
          drip.connect(gDrip).connect(g);
          drip.start();
          const t = c.currentTime;
          gDrip.gain.setValueAtTime(0, t);
          gDrip.gain.linearRampToValueAtTime(0.07, t + 0.02);
          gDrip.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          drip.stop(t + 0.5);

          if (Math.random() > 0.5) {
            const echo = createOsc('sine', rng(800, 2000) * 0.5);
            const gEcho = createGain(0);
            echo.connect(gEcho).connect(g);
            echo.start();
            gEcho.gain.setValueAtTime(0.04, t + 0.15);
            gEcho.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
            echo.stop(t + 0.7);
          }
        }
      }, 600);
    }
  };

  soundscapes.underwater = {
    name: 'Underwater', icon: '🫧',
    start() {
      const c = getCtx();
      const g = newMaster(0.2);

      const noise = createNoiseSource();
      addCleanup(() => { try { noise.stop(); } catch (e) {} });
      noise.connect(createFilter('lowpass', 200, 3)).connect(createGain(0.28)).connect(g);
      noise.start();

      const drone = createOsc('sine', 40);
      addCleanup(() => { try { drone.stop(); } catch (e) {} });
      drone.connect(createFilter('lowpass', 100)).connect(createGain(0.16)).connect(g);
      drone.start();

      loop(() => {
        if (Math.random() > 0.85) {
          const bub = createOsc('sine', rng(300, 1200));
          const gBub = createGain(0);
          bub.connect(gBub).connect(g);
          bub.start();
          const t = c.currentTime;
          gBub.gain.setValueAtTime(0.06, t);
          gBub.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
          bub.stop(t + 0.15);
        }
      }, 400);
    }
  };

  return {
    getSoundscapes() {
      return Object.entries(soundscapes).map(([id, s]) => ({ id, name: s.name, icon: s.icon }));
    },
    play(id) {
      this.stop();
      const sc = soundscapes[id];
      if (!sc) return false;
      try {
        sc.start();
        return true;
      } catch (e) {
        this.stop();
        return false;
      }
    },
    stop() {
      runCleanup();
      if (masterGain) {
        try { masterGain.disconnect(); } catch (e) {}
        masterGain = null;
      }
    },
    unlock() {
      const c = getCtx();
      if (c.state === 'suspended') c.resume();
      return c;
    },
    isUnlocked() {
      return ctx && ctx.state === 'running';
    },
    destroy() {
      this.stop();
      if (ctx) {
        try { ctx.close(); } catch (e) {}
        ctx = null;
      }
    },
    setVolume(val) {
      userVolume = Math.max(0, Math.min(1, val));
      applyVolume();
    },
    getVolume() {
      return userVolume;
    }
  };
})();

