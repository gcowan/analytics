/* ==========================================================================
   OG Games — shared runtime
   Settings (theme / reading comfort), page shell, speech, local progress,
   shareable word-list links. Vanilla JS, no build step, no dependencies.
   ========================================================================== */
(function (global) {
  'use strict';

  var KEY_SETTINGS = 'og.settings.v1';
  var KEY_PROGRESS = 'og.progress.v1';

  var DEFAULTS = {
    theme: 'auto',      // auto | light | dark
    tint: 'none',       // none | cream | blue | yellow | green | pink | grey
    font: 'sans',       // sans | verdana | serif | mono
    size: 1,            // 0.9 – 1.5
    track: 0.01,        // letter-spacing, em
    leading: 1.6,       // line-height
    sound: true,        // speech on/off
    motion: 'on'        // on | off
  };

  var FONTS = {
    sans:    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    verdana: 'Verdana, Tahoma, Geneva, sans-serif',
    serif:   'Georgia, "Iowan Old Style", "Palatino Linotype", Palatino, serif',
    mono:    'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace'
  };

  /* ---------- storage helpers (never throw: private mode, locked-down iPads) */
  function read(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { global.localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  var settings = Object.assign({}, DEFAULTS, read(KEY_SETTINGS, {}));

  function applySettings() {
    var root = document.documentElement;
    var theme = settings.theme;
    if (theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    root.setAttribute('data-tint', settings.tint);
    root.setAttribute('data-motion', settings.motion);
    root.style.setProperty('--font-read', FONTS[settings.font] || FONTS.sans);
    root.style.setProperty('--ui-scale', String(settings.size));
    root.style.setProperty('--track', settings.track + 'em');
    root.style.setProperty('--word-space', (settings.track * 2) + 'em');
    root.style.setProperty('--leading', String(settings.leading));
  }

  function saveSettings() { write(KEY_SETTINGS, settings); applySettings(); }

  /* ---------- tiny DOM helper ------------------------------------------- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    });
    (children || []).forEach(function (c) {
      if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sample(list) { return list[Math.floor(Math.random() * list.length)]; }

  /* ---------- speech ------------------------------------------------------
     Browser speech only — nothing is uploaded and no audio files ship.
     Voices load lazily in some browsers, hence the retry on first use.     */
  var voice = null;
  function pickVoice() {
    if (!('speechSynthesis' in global)) return null;
    var voices = global.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;
    var prefer = voices.filter(function (v) { return /^en(-|_|$)/i.test(v.lang); });
    var named = prefer.filter(function (v) { return /(Samantha|Daniel|Karen|Google UK|Google US|Serena|Moira)/i.test(v.name); });
    voice = named[0] || prefer[0] || voices[0];
    return voice;
  }
  if ('speechSynthesis' in global) {
    global.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    pickVoice();
  }

  function say(text, opts) {
    opts = opts || {};
    if (!settings.sound || !('speechSynthesis' in global) || !text) return false;
    try {
      if (!opts.queue) global.speechSynthesis.cancel();
      var u = new global.SpeechSynthesisUtterance(String(text));
      u.voice = voice || pickVoice();
      u.rate = opts.rate === undefined ? 0.85 : opts.rate;
      u.pitch = opts.pitch === undefined ? 1 : opts.pitch;
      u.lang = (u.voice && u.voice.lang) || 'en-GB';
      global.speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }

  /* Say a grapheme the way a tutor would: the sound, then its key word. */
  function sayGrapheme(g, table) {
    var entry = (table || {})[g];
    if (!entry) return say(g, { rate: 0.7 });
    say(entry.hint + (entry.key ? ', ' + entry.key : ''), { rate: 0.75 });
    return true;
  }

  /* Segment then blend: "c … a … t … cat" */
  function sayBlend(parts, word, table) {
    if (!settings.sound) return;
    global.speechSynthesis && global.speechSynthesis.cancel();
    parts.forEach(function (p) {
      var entry = (table || {})[p];
      say(entry ? entry.hint : p, { rate: 0.6, queue: true });
    });
    say(word, { rate: 0.75, queue: true });
  }

  /* ---------- progress (local only — no accounts, nothing leaves the device) */
  var progress = {
    all: function () { return read(KEY_PROGRESS, {}); },
    record: function (gameId, correct, total) {
      var p = this.all();
      var g = p[gameId] || { plays: 0, correct: 0, attempted: 0, best: 0, last: null };
      g.plays += 1;
      g.correct += correct;
      g.attempted += total;
      g.best = Math.max(g.best, total ? Math.round((correct / total) * 100) : 0);
      g.last = new Date().toISOString().slice(0, 10);
      p[gameId] = g;
      write(KEY_PROGRESS, p);
      return g;
    },
    forGame: function (gameId) { return this.all()[gameId] || null; },
    reset: function () { write(KEY_PROGRESS, {}); }
  };

  /* ---------- shareable word lists ---------------------------------------
     A tutor can hand out today's words as a link — no login, no homework app. */
  function encodeList(words) {
    try {
      var json = JSON.stringify(words);
      return btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) { return ''; }
  }
  function decodeList(str) {
    try {
      var b = str.replace(/-/g, '+').replace(/_/g, '/');
      while (b.length % 4) b += '=';
      var out = JSON.parse(decodeURIComponent(escape(atob(b))));
      return Array.isArray(out) ? out : null;
    } catch (e) { return null; }
  }
  function customList() {
    var m = /[#&?]w=([A-Za-z0-9\-_]+)/.exec(global.location.hash + global.location.search);
    return m ? decodeList(m[1]) : null;
  }
  function shareLink(words) {
    return global.location.origin + global.location.pathname + '#w=' + encodeList(words);
  }

  /* ---------- announcements for screen readers ---------------------------- */
  var liveRegion = null;
  function announce(msg) {
    if (!liveRegion) {
      liveRegion = el('div', { class: 'sr-only', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = '';
    global.setTimeout(function () { liveRegion.textContent = msg; }, 60);
  }

  /* ---------- page shell -------------------------------------------------- */
  var NAV = [
    { href: 'index.html', label: 'All games' },
    { href: 'how-to-use.html', label: 'How to use' },
    { href: 'word-lists.html', label: 'Word lists' }
  ];

  function shell(opts) {
    opts = opts || {};
    var base = opts.base === undefined ? '' : opts.base;
    var header = el('header', { class: 'og-header no-print' }, [
      el('div', { class: 'wrap og-header__inner' }, [
        el('a', { class: 'og-logo', href: base + 'index.html' }, [
          el('span', { class: 'og-logo__mark', 'aria-hidden': 'true', text: 'OG' }),
          el('span', {}, [
            el('span', { text: 'OG Games' }),
            el('span', { class: 'muted', style: 'font-weight:500;font-size:.82rem;display:block;margin-top:-4px', text: 'New Vision Tutoring' })
          ])
        ]),
        el('div', { class: 'og-header__spacer' }),
        el('nav', { 'aria-label': 'Main' }, NAV.map(function (item) {
          return el('a', {
            href: base + item.href,
            text: item.label,
            'aria-current': opts.active === item.href ? 'page' : null
          });
        })),
        el('button', {
          class: 'btn btn--ghost', type: 'button', id: 'og-settings-btn',
          'aria-haspopup': 'dialog',
          html: '<span aria-hidden="true">Aa</span><span class="sr-only">Reading and display settings</span>'
        })
      ])
    ]);

    var skip = el('a', { class: 'skip-link', href: '#main', text: 'Skip to content' });
    document.body.insertBefore(header, document.body.firstChild);
    document.body.insertBefore(skip, document.body.firstChild);

    var footer = el('footer', { class: 'og-footer no-print' }, [
      el('div', { class: 'wrap' }, [
        el('p', { html: '<strong>OG Games</strong> — free structured-literacy practice from New Vision Tutoring. ' +
          'Works offline, on any device, with no sign-in. Nothing you type here leaves your device.' }),
        el('p', { class: 'muted', html: 'Games support Orton–Gillingham lessons; they do not replace them. ' +
          '<a href="' + base + 'how-to-use.html">How to use these with your child</a>.' })
      ])
    ]);
    document.body.appendChild(footer);
    buildSettingsDialog();
    return header;
  }

  function segGroup(labelText, options, current, onPick) {
    var buttons = options.map(function (o) {
      return el('button', {
        type: 'button', text: o.label, 'data-value': o.value,
        'aria-pressed': String(o.value === current),
        onclick: function () {
          Array.prototype.forEach.call(this.parentNode.children, function (b) { b.setAttribute('aria-pressed', 'false'); });
          this.setAttribute('aria-pressed', 'true');
          onPick(o.value);
        }
      });
    });
    return el('div', { class: 'field' }, [
      el('span', { text: labelText }),
      el('div', { class: 'seg' }, buttons)
    ]);
  }

  function slider(labelText, min, max, step, value, onInput, format) {
    var out = el('output', { text: format(value) });
    var input = el('input', {
      type: 'range', min: min, max: max, step: step, value: value,
      oninput: function () { out.textContent = format(parseFloat(this.value)); onInput(parseFloat(this.value)); }
    });
    return el('label', { class: 'field' }, [
      el('span', {}, [document.createTextNode(labelText + ' '), out]),
      input
    ]);
  }

  function buildSettingsDialog() {
    var dlg = el('dialog', { class: 'og-dialog', 'aria-labelledby': 'og-settings-title' });
    var tints = ['none', 'cream', 'blue', 'yellow', 'green', 'pink', 'grey'];
    var body = el('div', { class: 'og-dialog__body' }, [
      segGroup('Theme', [
        { value: 'auto', label: 'Match device' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }
      ], settings.theme, function (v) { settings.theme = v; saveSettings(); }),

      segGroup('Letter style', [
        { value: 'sans', label: 'Standard' }, { value: 'verdana', label: 'Verdana' },
        { value: 'serif', label: 'Serif' }, { value: 'mono', label: 'Monospace' }
      ], settings.font, function (v) { settings.font = v; saveSettings(); }),

      slider('Text size', 0.9, 1.6, 0.05, settings.size,
        function (v) { settings.size = v; saveSettings(); },
        function (v) { return Math.round(v * 100) + '%'; }),

      slider('Letter spacing', 0, 0.14, 0.01, settings.track,
        function (v) { settings.track = v; saveSettings(); },
        function (v) { return v === 0 ? 'normal' : '+' + Math.round(v * 100) / 100 + 'em'; }),

      slider('Line spacing', 1.3, 2.2, 0.05, settings.leading,
        function (v) { settings.leading = v; saveSettings(); },
        function (v) { return String(Math.round(v * 100) / 100); }),

      el('div', { class: 'field' }, [
        el('span', { text: 'Page tint' }),
        el('div', { class: 'seg' }, tints.map(function (t) {
          var bg = { none: 'var(--surface)', cream: '#fdf6e3', blue: '#e8f1fa', yellow: '#fdf7d8',
                     green: '#e9f5ea', pink: '#fbecf1', grey: '#eceae6' }[t];
          return el('button', {
            type: 'button', class: 'swatch', style: 'background:' + bg, title: t,
            'aria-label': 'Tint: ' + t, 'aria-pressed': String(settings.tint === t),
            onclick: function () {
              Array.prototype.forEach.call(this.parentNode.children, function (b) { b.setAttribute('aria-pressed', 'false'); });
              this.setAttribute('aria-pressed', 'true');
              settings.tint = t; saveSettings();
            }
          });
        }))
      ]),

      segGroup('Spoken sounds', [
        { value: 'on', label: 'On' }, { value: 'off', label: 'Off' }
      ], settings.sound ? 'on' : 'off', function (v) { settings.sound = (v === 'on'); saveSettings(); }),

      segGroup('Animation', [
        { value: 'on', label: 'On' }, { value: 'off', label: 'Reduced' }
      ], settings.motion, function (v) { settings.motion = v; saveSettings(); })
    ]);

    dlg.appendChild(el('div', { class: 'og-dialog__head' }, [
      el('h2', { id: 'og-settings-title', text: 'Reading & display' }),
      el('button', { class: 'btn btn--quiet', type: 'button', text: 'Close',
        onclick: function () { dlg.close(); } })
    ]));
    dlg.appendChild(body);
    dlg.appendChild(el('div', { class: 'og-dialog__foot' }, [
      el('button', {
        class: 'btn btn--quiet', type: 'button', text: 'Reset to defaults',
        onclick: function () {
          settings = Object.assign({}, DEFAULTS);
          saveSettings();
          dlg.remove();
          buildSettingsDialog();
          document.querySelector('.og-dialog').showModal();
        }
      }),
      el('button', { class: 'btn', type: 'button', text: 'Done', onclick: function () { dlg.close(); } })
    ]));

    document.body.appendChild(dlg);
    var btn = document.getElementById('og-settings-btn');
    if (btn) btn.addEventListener('click', function () { dlg.showModal(); });
  }

  applySettings();

  global.OG = {
    settings: settings,
    save: saveSettings,
    apply: applySettings,
    el: el,
    shuffle: shuffle,
    sample: sample,
    say: say,
    sayGrapheme: sayGrapheme,
    sayBlend: sayBlend,
    progress: progress,
    announce: announce,
    shell: shell,
    encodeList: encodeList,
    decodeList: decodeList,
    customList: customList,
    shareLink: shareLink
  };
}(window));
