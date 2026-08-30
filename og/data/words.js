/* ==========================================================================
   OG Games — curriculum data
   Word banks follow a standard Orton–Gillingham scope and sequence:
   closed syllables -> digraphs -> blends -> floss -> magic e -> vowel teams
   -> r-controlled -> diphthongs -> soft c/g -> syllable division -> suffixes.
   Everything here is plain data so a tutor can edit a list without touching
   any game code.
   ========================================================================== */
(function (global) {
  'use strict';

  /* --- Grapheme table: the sound, a spoken hint, and its key word --------- */
  var GRAPHEMES = {
    a: { hint: 'ah',   key: 'apple',  type: 'vowel' },
    e: { hint: 'eh',   key: 'egg',    type: 'vowel' },
    i: { hint: 'ih',   key: 'itch',   type: 'vowel' },
    o: { hint: 'aw',   key: 'octopus',type: 'vowel' },
    u: { hint: 'uh',   key: 'up',     type: 'vowel' },
    b: { hint: 'b',    key: 'bat',    type: 'consonant' },
    c: { hint: 'k',    key: 'cat',    type: 'consonant' },
    d: { hint: 'd',    key: 'dog',    type: 'consonant' },
    f: { hint: 'fff',  key: 'fan',    type: 'consonant' },
    g: { hint: 'g',    key: 'goat',   type: 'consonant' },
    h: { hint: 'h',    key: 'hat',    type: 'consonant' },
    j: { hint: 'j',    key: 'jam',    type: 'consonant' },
    k: { hint: 'k',    key: 'kite',   type: 'consonant' },
    l: { hint: 'lll',  key: 'leaf',   type: 'consonant' },
    m: { hint: 'mmm',  key: 'man',    type: 'consonant' },
    n: { hint: 'nnn',  key: 'net',    type: 'consonant' },
    p: { hint: 'p',    key: 'pan',    type: 'consonant' },
    qu:{ hint: 'kw',   key: 'queen',  type: 'consonant' },
    r: { hint: 'rrr',  key: 'rat',    type: 'consonant' },
    s: { hint: 'sss',  key: 'sun',    type: 'consonant' },
    t: { hint: 't',    key: 'top',    type: 'consonant' },
    v: { hint: 'vvv',  key: 'van',    type: 'consonant' },
    w: { hint: 'w',    key: 'wind',   type: 'consonant' },
    x: { hint: 'ks',   key: 'box',    type: 'consonant' },
    y: { hint: 'y',    key: 'yes',    type: 'consonant' },
    z: { hint: 'zzz',  key: 'zip',    type: 'consonant' },

    sh: { hint: 'shhh', key: 'ship',  type: 'digraph' },
    ch: { hint: 'ch',   key: 'chip',  type: 'digraph' },
    th: { hint: 'th',   key: 'thumb', type: 'digraph' },
    wh: { hint: 'wh',   key: 'whale', type: 'digraph' },
    ck: { hint: 'k',    key: 'duck',  type: 'digraph' },
    ng: { hint: 'ng',   key: 'ring',  type: 'digraph' },
    nk: { hint: 'ngk',  key: 'pink',  type: 'digraph' },
    ph: { hint: 'fff',  key: 'phone', type: 'digraph' },
    ff: { hint: 'fff',  key: 'cliff', type: 'digraph' },
    ll: { hint: 'lll',  key: 'bell',  type: 'digraph' },
    ss: { hint: 'sss',  key: 'glass', type: 'digraph' },
    zz: { hint: 'zzz',  key: 'buzz',  type: 'digraph' },
    tch:{ hint: 'ch',   key: 'catch', type: 'digraph' },
    dge:{ hint: 'j',    key: 'badge', type: 'digraph' },

    ai: { hint: 'ay',  key: 'rain',  type: 'team' },
    ay: { hint: 'ay',  key: 'play',  type: 'team' },
    ee: { hint: 'ee',  key: 'feet',  type: 'team' },
    ea: { hint: 'ee',  key: 'eat',   type: 'team' },
    oa: { hint: 'oh',  key: 'boat',  type: 'team' },
    oe: { hint: 'oh',  key: 'toe',   type: 'team' },
    igh:{ hint: 'eye', key: 'night', type: 'team' },
    ie: { hint: 'eye', key: 'pie',   type: 'team' },
    oo: { hint: 'oo',  key: 'moon',  type: 'team' },
    ou: { hint: 'ow',  key: 'out',   type: 'team' },
    ow: { hint: 'ow',  key: 'cow',   type: 'team' },
    oi: { hint: 'oy',  key: 'coin',  type: 'team' },
    oy: { hint: 'oy',  key: 'boy',   type: 'team' },
    aw: { hint: 'aw',  key: 'saw',   type: 'team' },
    au: { hint: 'aw',  key: 'sauce', type: 'team' },
    ew: { hint: 'you', key: 'few',   type: 'team' },

    ar: { hint: 'ar',  key: 'car',   type: 'rcontrolled' },
    or: { hint: 'or',  key: 'corn',  type: 'rcontrolled' },
    er: { hint: 'er',  key: 'her',   type: 'rcontrolled' },
    ir: { hint: 'er',  key: 'bird',  type: 'rcontrolled' },
    ur: { hint: 'er',  key: 'turn',  type: 'rcontrolled' }
  };

  /* Longest-match segmenter over the grapheme inventory above. */
  var ORDER = Object.keys(GRAPHEMES).sort(function (a, b) { return b.length - a.length; });
  function segment(word) {
    var parts = [], i = 0;
    while (i < word.length) {
      var hit = null;
      for (var k = 0; k < ORDER.length; k++) {
        var g = ORDER[k];
        if (word.substr(i, g.length) === g) { hit = g; break; }
      }
      if (!hit) { hit = word[i]; }
      parts.push(hit);
      i += hit.length;
    }
    return parts;
  }

  function make(list, set, opts) {
    return list.map(function (w) {
      var entry = { w: w, set: set, g: segment(w) };
      if (opts && opts.silentE) {
        entry.g = segment(w.slice(0, -1)).concat(['e']);
        entry.silent = [entry.g.length - 1];
      }
      return entry;
    });
  }

  /* --- Decoding sets, in teaching order ---------------------------------- */
  var SETS = [
    {
      id: 'cvc-a', label: 'Short a (closed syllables)', level: 1, skill: 'closed',
      words: make(['cat','map','bag','tan','sad','ham','jam','lap','ran','wax','pan','fan','cap','bat','mad'], 'cvc-a')
    },
    {
      id: 'cvc-all', label: 'Short vowels a e i o u', level: 1, skill: 'closed',
      words: make(['pet','hen','bed','wet','leg','pig','fin','him','lid','zip','dog','hop','mop','box','pot',
                   'sun','bug','mud','cup','run'], 'cvc-all')
    },
    {
      id: 'digraphs', label: 'Digraphs sh ch th wh ck', level: 2, skill: 'digraphs',
      words: make(['ship','shop','fish','wish','chin','chop','much','rich','thin','moth','path','whip','when',
                   'duck','sock','back','lock','rock','shed','chat'], 'digraphs')
    },
    {
      id: 'blends', label: 'Blends (two sounds side by side)', level: 2, skill: 'blends',
      words: make(['stop','flag','clap','drum','frog','crab','plum','skip','spin','swim','best','lamp','hand',
                   'jump','tent','milk','desk','wind','sand','gift'], 'blends')
    },
    {
      id: 'floss', label: 'FLOSS words (ff ll ss zz)', level: 2, skill: 'floss',
      words: make(['hill','bell','doll','will','fell','miss','kiss','mess','pass','buzz','fuzz','puff','cliff',
                   'off','glass','grass','spell','stiff'], 'floss')
    },
    {
      id: 'magic-e', label: 'Magic e (a_e i_e o_e u_e)', level: 3, skill: 'magic-e',
      words: make(['cake','bake','game','name','tape','bike','ride','time','kite','line','home','bone','note',
                   'rope','hope','cute','tube','mule','cube','wave'], 'magic-e', { silentE: true })
    },
    {
      id: 'teams-ai-ay', label: 'Vowel team ai / ay', level: 4, skill: 'vowel-teams',
      words: make(['rain','main','pain','trail','paint','snail','chain','day','play','stay','tray','clay','gray','way'], 'teams-ai-ay')
    },
    {
      id: 'teams-ee-ea', label: 'Vowel team ee / ea', level: 4, skill: 'vowel-teams',
      words: make(['feet','week','seed','green','sheep','tree','eat','seat','beach','team','leaf','dream','clean'], 'teams-ee-ea')
    },
    {
      id: 'teams-oa-igh', label: 'Vowel team oa / ow / igh', level: 4, skill: 'vowel-teams',
      words: make(['boat','coat','road','soap','toast','snow','grow','slow','night','light','high','right','sight'], 'teams-oa-igh')
    },
    {
      id: 'r-controlled', label: 'Bossy r: ar or er ir ur', level: 5, skill: 'r-controlled',
      words: make(['car','star','park','farm','sharp','corn','fork','storm','short','her','fern','bird','girl',
                   'shirt','turn','burn','surf','curl'], 'r-controlled')
    },
    {
      id: 'diphthongs', label: 'oi oy ou ow oo aw', level: 5, skill: 'diphthongs',
      words: make(['coin','boil','join','boy','toy','out','loud','shout','cow','down','town','moon','food',
                   'saw','paw','crawl'], 'diphthongs')
    }
  ];

  /* --- Sound sorts: the rule is the point, the words are the evidence ----- */
  var SORTS = [
    {
      id: 'ck-k-ke', level: 2, title: 'Spelling /k/ at the end',
      rule: 'Short vowel + /k/ at the end of a one-syllable word = ck.',
      why: 'After a short vowel we use <b>ck</b> (duck). After a consonant or a long vowel team we use <b>k</b> (milk, week). After a long vowel with magic e we use <b>ke</b> (cake).',
      columns: [
        { id: 'ck', label: 'ck', hint: 'after a short vowel' },
        { id: 'k',  label: 'k',  hint: 'after a consonant or vowel team' },
        { id: 'ke', label: 'ke', hint: 'long vowel, magic e' }
      ],
      items: [['duck','ck'],['sock','ck'],['back','ck'],['lick','ck'],['deck','ck'],['truck','ck'],['stick','ck'],
              ['milk','k'],['desk','k'],['book','k'],['week','k'],['park','k'],['thank','k'],['peek','k'],
              ['cake','ke'],['bike','ke'],['joke','ke'],['smoke','ke'],['make','ke']]
    },
    {
      id: 'ch-tch', level: 3, title: 'ch or tch?',
      rule: 'Short vowel + /ch/ at the end = tch.',
      why: 'Straight after a short vowel, /ch/ is spelled <b>tch</b> (catch). After a consonant or a vowel team it is <b>ch</b> (bench, beach). Four old words break the rule: <b>rich, much, such, which</b>.',
      columns: [
        { id: 'tch', label: 'tch', hint: 'right after a short vowel' },
        { id: 'ch',  label: 'ch',  hint: 'after a consonant or vowel team' }
      ],
      items: [['catch','tch'],['match','tch'],['pitch','tch'],['ditch','tch'],['witch','tch'],['hutch','tch'],
              ['notch','tch'],['stretch','tch'],['bench','ch'],['lunch','ch'],['beach','ch'],['peach','ch'],
              ['coach','ch'],['torch','ch'],['march','ch'],['pinch','ch']],
      tricky: ['rich','much','such','which']
    },
    {
      id: 'ge-dge', level: 3, title: 'ge or dge?',
      rule: 'Short vowel + /j/ at the end = dge.',
      why: 'Straight after a short vowel, /j/ is spelled <b>dge</b> (badge). Everywhere else it is <b>ge</b> (cage, large).',
      columns: [
        { id: 'dge', label: 'dge', hint: 'right after a short vowel' },
        { id: 'ge',  label: 'ge',  hint: 'after a long vowel or a consonant' }
      ],
      items: [['badge','dge'],['bridge','dge'],['fudge','dge'],['judge','dge'],['ledge','dge'],['hedge','dge'],
              ['dodge','dge'],['smudge','dge'],['cage','ge'],['page','ge'],['huge','ge'],['large','ge'],
              ['change','ge'],['bulge','ge'],['stage','ge'],['plunge','ge']]
    },
    {
      id: 'soft-c', level: 4, title: 'Hard c or soft c?',
      rule: 'c before e, i or y says /s/.',
      why: 'When <b>c</b> is followed by <b>e, i</b> or <b>y</b> it says /s/ (city). Anywhere else it says /k/ (cat).',
      columns: [
        { id: 'soft', label: 'soft c = /s/', hint: 'c before e, i, y' },
        { id: 'hard', label: 'hard c = /k/', hint: 'c before a, o, u or a consonant' }
      ],
      items: [['city','soft'],['cent','soft'],['circle','soft'],['ice','soft'],['race','soft'],['pencil','soft'],
              ['cycle','soft'],['decide','soft'],['cat','hard'],['cup','hard'],['cot','hard'],['clap','hard'],
              ['cream','hard'],['picnic','hard'],['candy','hard'],['cactus','hard']]
    },
    {
      id: 'soft-g', level: 4, title: 'Hard g or soft g?',
      rule: 'g before e, i or y usually says /j/.',
      why: 'Usually <b>g</b> before <b>e, i</b> or <b>y</b> says /j/ (gem). Some very common words keep the hard sound: <b>get, girl, give, gift</b>.',
      columns: [
        { id: 'soft', label: 'soft g = /j/', hint: 'g before e, i, y' },
        { id: 'hard', label: 'hard g = /g/', hint: 'everywhere else' }
      ],
      items: [['gem','soft'],['giant','soft'],['gym','soft'],['giraffe','soft'],['magic','soft'],['cage','soft'],
              ['energy','soft'],['germ','soft'],['game','hard'],['goat','hard'],['gum','hard'],['glad','hard'],
              ['dog','hard'],['bag','hard'],['grape','hard'],['ghost','hard']],
      tricky: ['get','girl','give','gift']
    },
    {
      id: 'ai-ay', level: 4, title: 'ai or ay?',
      rule: 'ay goes at the end of a word; ai goes in the middle.',
      why: 'English words rarely end in <b>i</b>, so we use <b>ay</b> at the end (play) and <b>ai</b> inside the word (rain).',
      columns: [
        { id: 'ai', label: 'ai', hint: 'in the middle' },
        { id: 'ay', label: 'ay', hint: 'at the end' }
      ],
      items: [['rain','ai'],['train','ai'],['paint','ai'],['mail','ai'],['chain','ai'],['snail','ai'],['wait','ai'],
              ['day','ay'],['play','ay'],['stay','ay'],['tray','ay'],['clay','ay'],['spray','ay'],['today','ay']]
    },
    {
      id: 'floss', level: 2, title: 'Does it double? (FLOSS)',
      rule: 'One syllable, one short vowel, ending in f, l, s or z: double it.',
      why: 'FLOSS words double the final <b>f, l, s</b> or <b>z</b> (hill, buzz). Words that break it are mostly small function words: <b>bus, gas, if, this, has, yes, plus, pal</b>.',
      columns: [
        { id: 'double', label: 'Double it', hint: 'hill, buzz, miss' },
        { id: 'single', label: 'Just one', hint: 'bus, if, this' }
      ],
      items: [['hill','double'],['bell','double'],['doll','double'],['miss','double'],['kiss','double'],
              ['glass','double'],['buzz','double'],['puff','double'],['cliff','double'],['dress','double'],
              ['bus','single'],['gas','single'],['if','single'],['this','single'],['has','single'],
              ['yes','single'],['plus','single'],['pal','single']]
    }
  ];

  /* --- Syllable division ------------------------------------------------- */
  var SYLLABLE_TYPES = {
    closed:  { label: 'Closed', blurb: 'One vowel, shut in by a consonant. The vowel is short: cat, nap/kin.' },
    open:    { label: 'Open',   blurb: 'The syllable ends with the vowel, so it says its name: me, ti/ger.' },
    magice:  { label: 'Magic e',blurb: 'Vowel – consonant – silent e. The vowel says its name: cake, in/vite.' },
    team:    { label: 'Vowel team', blurb: 'Two vowels working as one sound: rain, ex/plain.' },
    rcon:    { label: 'Bossy r', blurb: 'A vowel followed by r, which changes the sound: car, gar/den.' },
    cle:     { label: 'Consonant-le', blurb: 'The final chunk: -ble, -dle, -tle, as in ta/ble.' }
  };

  var SYLLABLES = [
    { w: 'rabbit', split: 3, pattern: 'VC/CV', types: ['closed','closed'] },
    { w: 'napkin', split: 3, pattern: 'VC/CV', types: ['closed','closed'] },
    { w: 'magnet', split: 3, pattern: 'VC/CV', types: ['closed','closed'] },
    { w: 'basket', split: 3, pattern: 'VC/CV', types: ['closed','closed'] },
    { w: 'muffin', split: 3, pattern: 'VC/CV', types: ['closed','closed'] },
    { w: 'sunset', split: 3, pattern: 'VC/CV', types: ['closed','closed'] },
    { w: 'picnic', split: 3, pattern: 'VC/CV', types: ['closed','closed'] },
    { w: 'insect', split: 2, pattern: 'VC/CV', types: ['closed','closed'] },
    { w: 'kitten', split: 3, pattern: 'VC/CV', types: ['closed','closed'] },
    { w: 'contest',split: 3, pattern: 'VC/CV', types: ['closed','closed'] },
    { w: 'tiger',  split: 2, pattern: 'V/CV',  types: ['open','rcon'] },
    { w: 'open',   split: 1, pattern: 'V/CV',  types: ['open','closed'] },
    { w: 'pilot',  split: 2, pattern: 'V/CV',  types: ['open','closed'] },
    { w: 'robot',  split: 2, pattern: 'V/CV',  types: ['open','closed'] },
    { w: 'music',  split: 2, pattern: 'V/CV',  types: ['open','closed'] },
    { w: 'silent', split: 2, pattern: 'V/CV',  types: ['open','closed'] },
    { w: 'spider', split: 3, pattern: 'V/CV',  types: ['open','rcon'] },
    { w: 'frozen', split: 3, pattern: 'V/CV',  types: ['open','closed'] },
    { w: 'human',  split: 2, pattern: 'V/CV',  types: ['open','closed'] },
    { w: 'basic',  split: 2, pattern: 'V/CV',  types: ['open','closed'] },
    { w: 'camel',  split: 3, pattern: 'VC/V',  types: ['closed','closed'] },
    { w: 'lemon',  split: 3, pattern: 'VC/V',  types: ['closed','closed'] },
    { w: 'wagon',  split: 3, pattern: 'VC/V',  types: ['closed','closed'] },
    { w: 'robin',  split: 3, pattern: 'VC/V',  types: ['closed','closed'] },
    { w: 'visit',  split: 3, pattern: 'VC/V',  types: ['closed','closed'] },
    { w: 'planet', split: 4, pattern: 'VC/V',  types: ['closed','closed'] },
    { w: 'seven',  split: 3, pattern: 'VC/V',  types: ['closed','closed'] },
    { w: 'finish', split: 3, pattern: 'VC/V',  types: ['closed','closed'] },
    { w: 'table',  split: 2, pattern: 'C+le',  types: ['open','cle'] },
    { w: 'apple',  split: 3, pattern: 'C+le',  types: ['closed','cle'] },
    { w: 'little', split: 3, pattern: 'C+le',  types: ['closed','cle'] },
    { w: 'purple', split: 3, pattern: 'C+le',  types: ['rcon','cle'] },
    { w: 'bubble', split: 3, pattern: 'C+le',  types: ['closed','cle'] },
    { w: 'candle', split: 3, pattern: 'C+le',  types: ['closed','cle'] },
    { w: 'jungle', split: 3, pattern: 'C+le',  types: ['closed','cle'] },
    { w: 'simple', split: 3, pattern: 'C+le',  types: ['closed','cle'] },
    { w: 'cupcake',split: 3, pattern: 'Compound', types: ['closed','magice'] },
    { w: 'bathtub',split: 4, pattern: 'Compound', types: ['closed','closed'] },
    { w: 'popcorn',split: 3, pattern: 'Compound', types: ['closed','rcon'] },
    { w: 'rainbow',split: 4, pattern: 'Compound', types: ['team','team'] },
    { w: 'peanut', split: 3, pattern: 'Compound', types: ['team','closed'] },
    { w: 'backpack',split:4, pattern: 'Compound', types: ['closed','closed'] }
  ];

  /* --- Heart words: high-frequency words with one irregular part ---------- */
  var HEART = [
    { w: 'said',  heart: [1,2], note: 'ai says /e/ — that is the heart part.' },
    { w: 'the',   heart: [2],   note: 'The e says /uh/ (schwa).' },
    { w: 'was',   heart: [1,2], note: 'a says /u/ and s says /z/.' },
    { w: 'of',    heart: [1],   note: 'f says /v/ — only in this word.' },
    { w: 'to',    heart: [1],   note: 'o says /oo/.' },
    { w: 'you',   heart: [1,2], note: 'ou says /oo/ here.' },
    { w: 'they',  heart: [2,3], note: 'ey says /ay/.' },
    { w: 'one',   heart: [0],   note: 'The o carries a hidden /w/ sound.' },
    { w: 'come',  heart: [1],   note: 'o says /u/; the e is silent.' },
    { w: 'some',  heart: [1],   note: 'o says /u/; the e is silent.' },
    { w: 'have',  heart: [3],   note: 'English words do not end in v, so we add a silent e.' },
    { w: 'give',  heart: [3],   note: 'Same rule: no English word ends in v.' },
    { w: 'from',  heart: [2],   note: 'o says /u/.' },
    { w: 'what',  heart: [2],   note: 'a says /o/ (or /u/) after wh.' },
    { w: 'were',  heart: [1,2,3], note: 'ere says /er/.' },
    { w: 'who',   heart: [0,1,2], note: 'wh says /h/ and o says /oo/.' },
    { w: 'does',  heart: [1,2,3], note: 'oe says /u/ and s says /z/.' },
    { w: 'again', heart: [2,3], note: 'ai says /e/ here.' },
    { w: 'friend',heart: [2,3], note: 'ie says /e/.' },
    { w: 'many',  heart: [1],   note: 'a says /e/.' },
    { w: 'any',   heart: [0],   note: 'a says /e/.' },
    { w: 'put',   heart: [1],   note: 'u says /oo/ as in book.' },
    { w: 'because',heart: [3,4,5,6], note: 'The second syllable is spelled -ause but says /uz/.' },
    { w: 'people',heart: [1,2], note: 'eo says /ee/; -ple is a consonant-le ending.' }
  ];

  /* --- Word chains: change exactly one sound ------------------------------ */
  var CHAINS = [
    { id: 'chain-a', level: 1, words: ['sat','sit','sip','lip','lap','lad','lid'] },
    { id: 'chain-b', level: 1, words: ['man','mat','bat','bit','big','bag','bug'] },
    { id: 'chain-c', level: 1, words: ['cap','cup','cut','hut','hot','hop','top'] },
    { id: 'chain-d', level: 2, words: ['ship','shop','chop','chip','chin','thin','than'] },
    { id: 'chain-e', level: 2, words: ['flag','flap','flip','slip','slap','snap','snip'] },
    { id: 'chain-f', level: 3, words: ['cake','bake','bike','bite','kite','mite','mine'] }
  ];

  /* --- Suffix / morphology drill ----------------------------------------- */
  var SUFFIX_RULES = [
    { id: 'double', label: 'Double the last letter',
      test: 'One syllable, one vowel, one final consonant — and the suffix starts with a vowel.',
      items: [['hop','ing','hopping'],['run','ing','running'],['big','er','bigger'],['sit','ing','sitting'],
              ['swim','er','swimmer'],['stop','ed','stopped'],['plan','ed','planned'],['wet','est','wettest']] },
    { id: 'drop-e', label: 'Drop the silent e',
      test: 'The base word ends in a silent e and the suffix starts with a vowel.',
      items: [['hope','ing','hoping'],['make','ing','making'],['nice','er','nicer'],['use','ing','using'],
              ['bake','ed','baked'],['safe','est','safest'],['drive','ing','driving'],['smile','ed','smiled']] },
    { id: 'y-to-i', label: 'Change y to i',
      test: 'The base word ends in a consonant + y (and the suffix is not -ing).',
      items: [['happy','er','happier'],['carry','ed','carried'],['baby','es','babies'],['try','ed','tried'],
              ['funny','est','funniest'],['hurry','ed','hurried'],['city','es','cities'],['easy','er','easier']] },
    { id: 'nothing', label: 'Just add it',
      test: 'None of the other three rules apply — the base word does not change at all.',
      items: [['jump','ing','jumping'],['play','ed','played'],['fast','er','faster'],['help','ful','helpful'],
              ['sing','ing','singing'],['cold','est','coldest'],['walk','ed','walked'],['joy','ful','joyful']] }
  ];

  global.OGDATA = {
    GRAPHEMES: GRAPHEMES,
    segment: segment,
    SETS: SETS,
    SORTS: SORTS,
    SYLLABLES: SYLLABLES,
    SYLLABLE_TYPES: SYLLABLE_TYPES,
    HEART: HEART,
    CHAINS: CHAINS,
    SUFFIX_RULES: SUFFIX_RULES
  };
}(window));
