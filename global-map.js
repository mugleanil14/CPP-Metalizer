/* FlexFilm — Global Presence animated map */
(function () {
  const X = lon => (lon + 180) / 360 * 1000;
  const Y = lat => (90 - lat) / 180 * 500;

  const SITES = [
    { id:'ru', flag:'🇷🇺', lat:55.8, lon:37.6, hub:true,
      name:{en:'Russia',  ru:'Россия'},  city:{en:'CPP Division',     ru:'Дивизион CPP'},
      role:{en:'Local CPP production hub', ru:'Локальный хаб производства CPP'} },
    { id:'in', flag:'🇮🇳', lat:28.6, lon:77.4, hq:true,
      name:{en:'India',   ru:'Индия'},   city:{en:'Noida — Group HQ', ru:'Нойда — штаб-квартира'},
      role:{en:'UFlex group HQ & R&D', ru:'Штаб-квартира и R&D UFlex'} },
    { id:'ae', flag:'🇦🇪', lat:25.2, lon:55.3,
      name:{en:'UAE',     ru:'ОАЭ'},     city:{en:'Dubai', ru:'Дубай'},
      role:{en:'Film manufacturing site', ru:'Производство плёнок'} },
    { id:'eg', flag:'🇪🇬', lat:30.0, lon:31.2,
      name:{en:'Egypt',   ru:'Египет'},  city:{en:'Manufacturing', ru:'Производство'},
      role:{en:'Film manufacturing site', ru:'Производство плёнок'} },
    { id:'pl', flag:'🇵🇱', lat:52.3, lon:17.6,
      name:{en:'Poland',  ru:'Польша'},  city:{en:'Września', ru:'Вжесня'},
      role:{en:'European manufacturing site', ru:'Европейская площадка'} },
    { id:'hu', flag:'🇭🇺', lat:47.5, lon:19.0, isNew:true,
      name:{en:'Hungary', ru:'Венгрия'}, city:{en:'New plant', ru:'Новый завод'},
      role:{en:'Central Europe manufacturing footprint', ru:'Площадка в Центральной Европе'} },
    { id:'ng', flag:'🇳🇬', lat:6.5, lon:3.4, isNew:true,
      name:{en:'Nigeria', ru:'Нигерия'}, city:{en:'New plant', ru:'Новый завод'},
      role:{en:'Africa manufacturing footprint', ru:'Площадка в Африке'} },
    { id:'us', flag:'🇺🇸', lat:37.7, lon:-85.9,
      name:{en:'USA',     ru:'США'},     city:{en:'Kentucky', ru:'Кентукки'},
      role:{en:'North American manufacturing site', ru:'Площадка в Северной Америке'} },
    { id:'mx', flag:'🇲🇽', lat:22.4, lon:-97.9,
      name:{en:'Mexico',  ru:'Мексика'}, city:{en:'Altamira', ru:'Альтамира'},
      role:{en:'Manufacturing site for the Americas', ru:'Площадка для Америк'} }
  ];

  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  const L = () => (document.documentElement.lang === 'en' ? 'en' : 'ru');

  function build() {
    const mount = document.getElementById('globalMap');
    if (!mount) return;
    const lang = L();
    mount.innerHTML = '';

    const svg = el('svg', {
      class: 'gmap-svg',
      viewBox: '175 45 640 275',
      preserveAspectRatio: 'xMidYMid meet'
    });

    const defs = el('defs', {});
    const grad = el('radialGradient', { id:'hubGrad', cx:'50%', cy:'50%', r:'50%' });
    const s0 = el('stop', {}); s0.setAttribute('offset','0%'); s0.setAttribute('stop-color','#FF8A1F');
    const s1 = el('stop', {}); s1.setAttribute('offset','100%'); s1.setAttribute('stop-color','#E85D04');
    grad.appendChild(s0); grad.appendChild(s1);
    const glow = el('filter', { id:'glow', x:'-50%', y:'-50%', width:'200%', height:'200%' });
    const blur = el('feGaussianBlur', { stdDeviation:'2', result:'blur' });
    const merge = el('feMerge', {});
    const m1 = el('feMergeNode', { in:'blur' });
    const m2 = el('feMergeNode', { in:'SourceGraphic' });
    merge.appendChild(m1); merge.appendChild(m2);
    glow.appendChild(blur); glow.appendChild(merge);
    defs.appendChild(grad); defs.appendChild(glow);
    svg.appendChild(defs);

    const grat = el('g', { class: 'gmap-grat' });
    for (let lon = -180; lon <= 180; lon += 15)
      grat.appendChild(el('line', { x1:X(lon), y1:0, x2:X(lon), y2:500 }));
    for (let lat = -90; lat <= 90; lat += 15)
      grat.appendChild(el('line', { x1:0, y1:Y(lat), x2:1000, y2:Y(lat) }));
    svg.appendChild(grat);

    const hub = SITES.find(s => s.hub);
    const hx = X(hub.lon), hy = Y(hub.lat);

    const arcs = el('g', { class: 'gmap-arcs' });
    SITES.filter(s => !s.hub).forEach((s, i) => {
      const x = X(s.lon), y = Y(s.lat);
      const mx = (hx + x) / 2;
      const my = (hy + y) / 2 - Math.abs(x - hx) * 0.25 - 15;
      const p = el('path', { d:'M '+hx+' '+hy+' Q '+mx+' '+my+' '+x+' '+y, class:'gmap-arc' });
      p.style.animationDelay = (0.2 + i * 0.12) + 's';
      arcs.appendChild(p);
    });
    svg.appendChild(arcs);

    const pinsG = el('g', { class: 'gmap-pins' });
    SITES.forEach((s, i) => {
      const x = X(s.lon), y = Y(s.lat);
      const g = el('g', {
        class: 'gmap-pin' + (s.hub ? ' hub' : '') + (s.isNew ? ' isnew' : ''),
        tabindex: '0', role: 'button',
        transform: 'translate('+x+' '+y+')'
      });
      g.style.setProperty('--d', (0.3 + i * 0.13) + 's');
      g.appendChild(el('circle', { class:'gmap-pulse', r: s.hub ? 7 : 5 }));
      if (s.hub) g.appendChild(el('circle', { class:'gmap-pulse p2', r: 7 }));
      g.appendChild(el('circle', { class:'gmap-dot', r: s.hub ? 7 : 5 }));
      const lab = el('text', { class:'gmap-lab', x:0, y:-13, 'text-anchor':'middle' });
      lab.textContent = s.name[lang];
      g.appendChild(lab);
      if (s.isNew) {
        const nb = el('text', { class:'gmap-new', x:0, y:18, 'text-anchor':'middle' });
        nb.textContent = lang === 'en' ? 'NEW' : 'НОВЫЙ';
        g.appendChild(nb);
      }
      const activate = () => select(s, pinsG);
      g.addEventListener('click', activate);
      g.addEventListener('mouseenter', activate);
      g.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();} });
      pinsG.appendChild(g);
    });
    svg.appendChild(pinsG);
    mount.appendChild(svg);
    select(hub, pinsG);
  }

  function select(s, pinsG) {
    const lang = L();
    pinsG.querySelectorAll('.gmap-pin').forEach(function(p){ p.classList.remove('sel'); });
    const idx = SITES.indexOf(s);
    const node = pinsG.querySelectorAll('.gmap-pin')[idx];
    if (node) node.classList.add('sel');
    const card = document.getElementById('gmapCard');
    if (!card) return;
    const tag = s.hub   ? (lang==='en'?'CPP DIVISION':'ДИВИЗИОН CPP')
              : s.hq    ? (lang==='en'?'GROUP HQ':'ШТАБ-КВАРТИРА')
              : s.isNew ? (lang==='en'?'NEW PLANT':'НОВЫЙ ЗАВОД')
              :            (lang==='en'?'MANUFACTURING':'ПРОИЗВОДСТВО');
    card.innerHTML =
      '<div class="gc-flag">'+s.flag+'</div>'+
      '<div class="gc-body">'+
        '<div class="gc-tag'+(s.hub?' hub':'')+'">'+tag+'</div>'+
        '<div class="gc-name">'+s.name[lang]+'</div>'+
        '<div class="gc-city">'+s.city[lang]+'</div>'+
        '<div class="gc-role">'+s.role[lang]+'</div>'+
      '</div>';
    card.classList.add('show');
  }

  window.renderGlobalMap = build;

  document.addEventListener('DOMContentLoaded', function() {
    build();
    ['langRu','langEn'].forEach(function(id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', function(){ setTimeout(build, 0); });
    });
  });
})();
