/* =====================================================================
   FlexCPP™ — interactive controller
   ===================================================================== */
(function(){
  const TOTAL = 7;
  const params = new URLSearchParams(window.location.search);
  const requestedLang = params.get('lang') || window.DEFAULT_LANG || document.documentElement.lang || 'ru';
  let cur = 1, lang = (requestedLang === 'en' ? 'en' : 'ru');

  /* --- DOM --- */
  const slides = document.querySelectorAll('.slide');
  const counter = document.getElementById('counter');
  const progress = document.getElementById('progress');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnFull = document.getElementById('btnFull');
  const btnPrint = document.getElementById('btnPrint');
  const langRu = document.getElementById('langRu');
  const langEn = document.getElementById('langEn');

  /* --- helpers --- */
  function get(path, obj){
    return path.split('.').reduce((a,k)=>a&&a[k], obj);
  }
  function pad(n){ return String(n).padStart(2,'0'); }

  /* --- grade-card helpers (read from window.GRADES) --- */
  function gtext(g, key){ return (g[key] && (g[key][lang]||g[key].en)) || ''; }
  function gval(g, field){ return (lang==='en' && g[field+'_en']!==undefined) ? g[field+'_en'] : g[field]; }
  function isNum(v){ return /[0-9]/.test(String(v)); }
  function miniSpec(label, val, unit){
    if(val===undefined || val===null || val==='') return '';
    return `<div class="ms"><span class="ms-l">${label}</span><span class="ms-v">${val}${unit?`<i>${unit}</i>`:''}</span></div>`;
  }

  function renderGrades(t){
    const grid = document.getElementById('gradeGrid');
    if(!grid || !window.GRADES) return;
    grid.innerHTML='';
    window.GRADES.forEach((g,idx)=>{
      const tag=gtext(g,'tag'), name=gtext(g,'name'), desc=gtext(g,'desc');
      const sit=gval(g,'sit'), seal=gval(g,'seal');
      const structure=(g.structure[lang]||g.structure.en);
      const features=(g.features[lang]||g.features.en).slice(0,4);
      const apps=(g.apps[lang]||g.apps.en);
      const sitTxt = sit ? (isNum(sit)? sit+'°C' : sit) : '';
      const sealUnit = isNum(seal) ? t.s5.unit_seal : '';
      const sitChip = sit ? `<span class="gc-pill">SIT ${sitTxt}</span>` : '';
      const structHtml = structure.map((s,i)=>{
        let cls = (i===0)?'top':(i===structure.length-1)?'seal':'mid';
        return `<div class="gc-layer ${cls}"><span class="gc-bar"></span><span class="gc-ltxt">${s}</span></div>`;
      }).join('');
      const featHtml = features.map(f=>`<li>${f}</li>`).join('');
      const appHtml = apps.map(a=>`<span class="gc-app">${a}</span>`).join('');
      grid.insertAdjacentHTML('beforeend', `
        <div class="grade-card accent-${g.accent}" data-code="${g.code}" tabindex="0" role="button" aria-label="${g.code} — ${name}">
          <div class="gc-inner">
            <div class="gc-face gc-front">
              <div class="gc-top"><span class="gc-tag">${tag}</span><span class="gc-num">${pad(idx+1)}</span></div>
              <div class="gc-code">${g.code}</div>
              <div class="gc-name">${name}</div>
              <p class="gc-desc">${desc}</p>
              <div class="gc-front-foot">
                <div class="gc-chips"><span class="gc-pill solid">${g.thk} ${t.s5.unit_um}</span>${sitChip}</div>
                <span class="gc-flip"><span class="gc-flip-ic">↻</span>${t.s5.flip_front}</span>
              </div>
            </div>
            <div class="gc-face gc-back">
              <div class="gc-back-head"><span class="gc-back-code">${g.code}</span><span class="gc-back-tag">${t.s5.back_lbl}</span></div>
              <div class="gc-spec">
                ${miniSpec(t.s5.lbl_thk, g.thk, t.s5.unit_um)}
                ${miniSpec(t.s5.lbl_sit, sit?(isNum(sit)?sit:sit):'', isNum(sit)?'°C':'')}
                ${miniSpec(t.s5.lbl_seal, seal, sealUnit)}
                ${miniSpec(t.s5.lbl_density, g.density, t.s5.unit_density)}
              </div>
              <div class="gc-sub">${t.s5.lbl_struct}</div>
              <div class="gc-struct">${structHtml}</div>
              <div class="gc-sub">${t.s5.lbl_features}</div>
              <ul class="gc-feats">${featHtml}</ul>
              <div class="gc-sub">${t.s5.lbl_apps}</div>
              <div class="gc-apps">${appHtml}</div>
              <span class="gc-flip back"><span class="gc-flip-ic">↩</span>${t.s5.flip_back}</span>
            </div>
          </div>
        </div>`);
    });
  }

  function setLang(l){
    lang = l;
    document.documentElement.lang = l;
    langRu.classList.toggle('active', l==='ru');
    langEn.classList.toggle('active', l==='en');
    const t = window.I18N[l];

    // 1) data-key text/html replacements
    document.querySelectorAll('[data-key]').forEach(el=>{
      const key = el.getAttribute('data-key');
      const val = get(key, t);
      if(typeof val === 'string'){
        if(el.getAttribute('data-html')==='true') el.innerHTML = val;
        else el.textContent = val;
      }
    });

    // 2) Dynamic populated areas — rebuild each lang switch
    populateAll(t);
    updateCounter();
  }

  function populateAll(t){
    // --- S1 meta tiles ---
    const m = document.getElementById('s1Meta');
    if(m){ m.innerHTML=''; t.s1.meta.forEach(([k,v])=>{
      m.insertAdjacentHTML('beforeend',
        `<div class="item"><div class="k">${k}</div><div class="v">${v}</div></div>`);
    });}

    // --- S2 stat cards ---
    const stat = document.getElementById('s2Stats');
    if(stat){ stat.innerHTML=''; t.s2.stats.forEach(([n,u,l,d])=>{
      stat.insertAdjacentHTML('beforeend',
        `<div class="stat-card">
           <div class="num">${n}<span class="unit">${u}</span></div>
           <div class="label">${l}</div>
           <div class="desc">${d}</div>
         </div>`);
    });}

    // --- S2 badges ---
    const bd = document.getElementById('s2Badges');
    if(bd){ bd.innerHTML=''; t.s2.badges.forEach((b,i)=>{
      bd.insertAdjacentHTML('beforeend',
        `<span class="badge ${i===0?'hot':''}">${b}</span>`);
    });}

    // --- S3 feats ---
    const f = document.getElementById('s3Feats');
    if(f){ f.innerHTML=''; t.s3.feats.forEach(([ic,tt,dd])=>{
      f.insertAdjacentHTML('beforeend',
        `<div class="cpp-feat">
           <div class="ic">${ic}</div>
           <div class="ft">${tt}</div>
           <div class="fd">${dd}</div>
         </div>`);
    });}

    // --- S3 layers ---
    const ly = document.getElementById('s3Layers');
    if(ly){ ly.innerHTML=''; const cls=['o','c','i'];
      t.s3.layers.forEach(([lab,role],i)=>{
        ly.insertAdjacentHTML('beforeend',
          `<div class="layer ${cls[i]}">
             <span>${lab}</span><span class="role">${role}</span>
           </div>`);
      });
    }

    // --- S4 stats ---
    const s4 = document.getElementById('s4Stats');
    if(s4){ s4.innerHTML=''; t.s4.stats.forEach(([v,l])=>{
      s4.insertAdjacentHTML('beforeend',
        `<div class="st"><div class="v">${v}</div><div class="l">${l}</div></div>`);
    });}

    // --- S4 bullets ---
    const b4 = document.getElementById('s4Bullets');
    if(b4){ b4.innerHTML=''; t.s4.bullets.forEach(([bb,tt])=>{
      b4.insertAdjacentHTML('beforeend',
        `<li><span><b>${bb}</b> ${tt}</span></li>`);
    });}

    // --- S5 interactive grade flip cards ---
    renderGrades(t);

    // --- S6 C-CPM spec row (real TDS data) ---
    const spec6 = document.getElementById('s6Spec');
    if(spec6 && window.GRADES){
      const cpm = window.GRADES.find(g=>g.code==='C-CPM');
      if(cpm){
        spec6.innerHTML =
          miniSpec(t.s5.lbl_thk, cpm.thk, t.s5.unit_um) +
          miniSpec(t.s5.lbl_sit, cpm.sit, '°C') +
          miniSpec(t.s5.lbl_seal, cpm.seal, t.s5.unit_seal) +
          miniSpec(t.s5.lbl_density, cpm.density, t.s5.unit_density);
      }
    }

    // --- S6 props ---
    const p6 = document.getElementById('s6Props');
    if(p6){ p6.innerHTML=''; t.s6.props.forEach(([ic,tt,dd])=>{
      p6.insertAdjacentHTML('beforeend',
        `<div class="cpm-prop">
           <div class="ic">${ic}</div>
           <div class="pt">${tt}</div>
           <div class="pd">${dd}</div>
         </div>`);
    });}

    // --- S6 benefits ---
    const b6 = document.getElementById('s6Benefits');
    if(b6){ b6.innerHTML=''; t.s6.benefits.forEach(([bb,tt])=>{
      b6.insertAdjacentHTML('beforeend',
        `<li><span><b>${bb}</b> ${tt}</span></li>`);
    });}

    // --- S6 ready laminate chip update ---
    document.querySelectorAll('.cpm-chip.muted').forEach(c=>{
      c.textContent = (lang==='ru' ? 'ГОТОВЫЙ ЛАМИНАТ' : 'FINISHED LAMINATE');
    });

    // --- S7 grades ---
    const g7 = document.getElementById('s7Grades');
    if(g7){ g7.innerHTML=''; t.s7.grades.forEach(([c,tt,dd])=>{
      g7.insertAdjacentHTML('beforeend',
        `<div class="oreo-grade">
           <div class="gc">${c}</div>
           <div><div class="gt">${tt}</div><div class="gd">${dd}</div></div>
         </div>`);
    });}
  }

  function showSlide(n){
    if(n<1) n=1; if(n>TOTAL) n=TOTAL;
    cur = n;
    slides.forEach(s=>{
      const idx = parseInt(s.dataset.slide,10);
      s.classList.toggle('active', idx===cur);
    });
    updateCounter();
    // re-trigger stagger by toggling class
    const active = document.querySelector('.slide.active');
    if(active){
      active.querySelectorAll('.stagger').forEach(g=>{
        g.style.animation='none';
        // force reflow
        g.offsetHeight;
        g.style.animation='';
      });
    }
  }

  function updateCounter(){
    counter.textContent = pad(cur)+' / '+pad(TOTAL);
    progress.style.width = (cur/TOTAL*100)+'%';
  }

  /* --- events --- */
  btnPrev.addEventListener('click', ()=>showSlide(cur-1));
  btnNext.addEventListener('click', ()=>showSlide(cur+1));
  langRu.addEventListener('click', ()=>setLang('ru'));
  langEn.addEventListener('click', ()=>setLang('en'));
  btnFull.addEventListener('click', ()=>{
    if(!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });
  btnPrint.addEventListener('click', ()=>{
    // show all slides for printing
    document.body.classList.add('printing');
    slides.forEach(s=>s.classList.add('active'));
    setTimeout(()=>{
      window.print();
      setTimeout(()=>{
        document.body.classList.remove('printing');
        slides.forEach(s=>s.classList.remove('active'));
        showSlide(cur);
      }, 500);
    }, 200);
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowRight' || e.key===' ' || e.key==='PageDown') { e.preventDefault(); showSlide(cur+1); }
    else if(e.key==='ArrowLeft' || e.key==='PageUp')               { e.preventDefault(); showSlide(cur-1); }
    else if(e.key==='Home')                                        { e.preventDefault(); showSlide(1); }
    else if(e.key==='End')                                         { e.preventDefault(); showSlide(TOTAL); }
    else if(e.key==='f' || e.key==='F')                            { btnFull.click(); }
    else if(e.key==='p' || e.key==='P')                            { btnPrint.click(); }
    else if(e.key==='l' || e.key==='L')                            { setLang(lang==='ru'?'en':'ru'); }
  });

  /* --- grade flip-card interaction --- */
  const gradeGrid = document.getElementById('gradeGrid');
  if(gradeGrid){
    gradeGrid.addEventListener('click', e=>{
      const card = e.target.closest('.grade-card');
      if(card){ card.classList.toggle('flipped'); }
    });
    gradeGrid.addEventListener('keydown', e=>{
      const card = e.target.closest('.grade-card');
      if(card && (e.key==='Enter' || e.key===' ')){
        e.preventDefault(); e.stopPropagation();
        card.classList.toggle('flipped');
      }
    });
  }

  // touch swipe (ignore swipes that start on a flip card so users can tap/scroll it)
  let xStart = null, yStart = null;
  document.addEventListener('touchstart', e=>{
    if(e.target.closest('.grade-card') || e.target.closest('#gradeGrid')){ xStart=null; return; }
    xStart = e.touches[0].clientX; yStart = e.touches[0].clientY;
  });
  document.addEventListener('touchend', e=>{
    if(xStart===null) return;
    const dx = e.changedTouches[0].clientX - xStart;
    const dy = e.changedTouches[0].clientY - yStart;
    if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)){ showSlide(cur + (dx<0?1:-1)); }
    xStart=null;
  });

  /* --- init --- */
  setLang(lang);
  showSlide(1);
})();
