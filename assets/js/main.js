(function(){
'use strict';
var d=document,rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

var hd=d.getElementById('hd'),st=d.getElementById('stick'),
    navA=[].slice.call(d.querySelectorAll('#nv a')),
    secs=navA.map(function(a){return d.querySelector(a.getAttribute('href'))});
function sc(){
  var y=window.scrollY;
  hd.classList.toggle('stuck',y>60);
  st.classList.toggle('show',y>window.innerHeight*0.8);
  var cur=-1;
  secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<=140)cur=i});
  navA.forEach(function(a,i){a.classList.toggle('act',i===cur)});
}
window.addEventListener('scroll',sc,{passive:true});sc();

var bg=d.getElementById('bg'),mn=d.getElementById('menu');
bg.addEventListener('click',function(){
  var o=mn.classList.toggle('open');
  bg.classList.toggle('on',o);bg.setAttribute('aria-expanded',o);
  d.body.style.overflow=o?'hidden':'';
});
mn.addEventListener('click',function(e){
  if(e.target.closest('a')){mn.classList.remove('open');bg.classList.remove('on');d.body.style.overflow=''}
});

var CFG=window.MitroRun||{};
var T=new Date(CFG.raceDate||'2026-10-04T11:00:00+02:00').getTime(),
    E={d:d.getElementById('cd-d'),h:d.getElementById('cd-h'),m:d.getElementById('cd-m'),s:d.getElementById('cd-s')};
function p2(n){return n<10?'0'+n:''+n}
function tick(){
  if(!E.d)return;
  var f=Math.max(0,T-Date.now()),s=Math.floor(f/1000);
  E.d.textContent=Math.floor(s/86400);
  E.h.textContent=p2(Math.floor(s%86400/3600));
  E.m.textContent=p2(Math.floor(s%3600/60));
  E.s.textContent=p2(s%60);
}
tick();setInterval(tick,1000);

var io=new IntersectionObserver(function(en){
  en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})
},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
d.querySelectorAll('.rv,.head').forEach(function(n,i){n.style.transitionDelay=(i%3)*0.08+'s';io.observe(n)});

var ci=new IntersectionObserver(function(en){
  en.forEach(function(x){
    if(!x.isIntersecting)return;ci.unobserve(x.target);
    var n=x.target,end=+n.dataset.count,sf=n.dataset.suffix||'',t0=null;
    function step(ts){
      if(!t0)t0=ts;var pr=Math.min((ts-t0)/1300,1),e=1-Math.pow(1-pr,3);
      n.textContent=Math.round(end*e).toLocaleString('de-DE')+sf;
      if(pr<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  })
},{threshold:.5});
d.querySelectorAll('[data-count]').forEach(function(n){ci.observe(n)});


/* ================= GALERIA: staggered reveal + lightbox ================= */
(function(){
  var gal=d.getElementById('gal');
  if(!gal)return;
  var figs=[].slice.call(gal.querySelectorAll('figure'));

  var gio=new IntersectionObserver(function(en){
    en.forEach(function(x){
      if(!x.isIntersecting)return;
      gio.unobserve(x.target);
      /* uneven delays so the grid fills in like a person laid it out,
         not like a machine firing on a metronome */
      x.target.style.transitionDelay=(0.04+Math.random()*0.22).toFixed(2)+'s';
      x.target.classList.add('in');
    })
  },{threshold:.14,rootMargin:'0px 0px -4% 0px'});
  figs.forEach(function(f){rm?f.classList.add('in'):gio.observe(f)});

  var lb=d.getElementById('lb'),lbImg=lb.querySelector('img'),lbCap=lb.querySelector('.cap'),cur=0;
  function open(i){
    cur=(i+figs.length)%figs.length;
    var f=figs[cur];
    lbImg.src=f.dataset.full;
    lbImg.alt=f.dataset.cap||'';
    lbCap.textContent=(cur+1)+' / '+figs.length+'  ·  '+(f.dataset.cap||'');
    lb.classList.add('open');
    d.body.style.overflow='hidden';
  }
  function close(){lb.classList.remove('open');d.body.style.overflow='';lbImg.src=''}

  figs.forEach(function(f,i){f.addEventListener('click',function(){open(i)})});
  lb.querySelector('.x').addEventListener('click',close);
  lb.querySelector('.pv').addEventListener('click',function(e){e.stopPropagation();open(cur-1)});
  lb.querySelector('.nx').addEventListener('click',function(e){e.stopPropagation();open(cur+1)});
  lb.addEventListener('click',function(e){if(e.target===lb)close()});
  d.addEventListener('keydown',function(e){
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();
    if(e.key==='ArrowRight')open(cur+1);
    if(e.key==='ArrowLeft')open(cur-1);
  });

  /* swipe on touch */
  var x0=null;
  lb.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){
    if(x0===null)return;
    var dx=e.changedTouches[0].clientX-x0;
    if(Math.abs(dx)>50)open(cur+(dx<0?1:-1));
    x0=null;
  },{passive:true});
})();


/* ================= NEWSLETTER ================= */
(function(){
  var form=d.getElementById('mr-news');
  if(!form||!CFG.restUrl)return;
  var msg=form.querySelector('.mr-news-msg');
  var btn=form.querySelector('button[type=submit]');
  var t=CFG.i18n||{};

  function say(text,ok){
    msg.textContent=text;
    msg.className='mr-news-msg'+(ok?' ok':' err');
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var email=form.querySelector('input[name=email]').value.trim();
    var consent=form.querySelector('input[name=consent]').checked;
    var honey=form.querySelector('input[name=website]').value;

    if(!email||email.indexOf('@')<1){say(t.invalidMail||'Invalid email',false);return}
    if(!consent){say(t.error||'Please accept',false);return}

    btn.disabled=true;
    say(t.sending||'Sending…',true);

    fetch(CFG.restUrl+'subscribe',{
      method:'POST',
      headers:{'Content-Type':'application/json','X-WP-Nonce':CFG.nonce||''},
      body:JSON.stringify({email:email,consent:consent?1:0,website:honey})
    })
    .then(function(r){return r.json()})
    .then(function(data){
      btn.disabled=false;
      if(data&&data.ok){
        say(data.message||t.subscribed,true);
        form.reset();
      }else{
        say((data&&data.message)||t.error,false);
      }
    })
    .catch(function(){
      btn.disabled=false;
      say(t.error||'Error',false);
    });
  });
})();

/* ================= MAPS ================= */
var START=CFG.start||[42.8901,20.8672];
var ROUTES=CFG.routes||{};
var ATTR='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
var BASE=CFG.mapTiles||'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
var LABELS=CFG.mapLabels||'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png';

function hav(a,b){
  var R=6371000,t=Math.PI/180,dLa=(b[0]-a[0])*t,dLo=(b[1]-a[1])*t;
  var s=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(a[0]*t)*Math.cos(b[0]*t)*Math.sin(dLo/2)*Math.sin(dLo/2);
  return 2*R*Math.asin(Math.sqrt(s));
}
function densify(pts,step){
  var out=[pts[0]];
  for(var i=1;i<pts.length;i++){
    var a=pts[i-1],b=pts[i],n=Math.max(1,Math.round(hav(a,b)/step));
    for(var j=1;j<=n;j++)out.push([a[0]+(b[0]-a[0])*(j/n),a[1]+(b[1]-a[1])*(j/n)]);
  }
  return out;
}
function cumul(pts){var c=[0];for(var i=1;i<pts.length;i++)c.push(c[i-1]+hav(pts[i-1],pts[i]));return c}
function pointAt(pts,cs,dist){
  for(var i=1;i<cs.length;i++){
    if(cs[i]>=dist){
      var t=(dist-cs[i-1])/(cs[i]-cs[i-1]||1),a=pts[i-1],b=pts[i];
      return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
    }
  }
  return pts[pts.length-1];
}

var activeKm=10,rg=d.getElementById('p-range'),
    oT=d.getElementById('p-time'),oP=d.getElementById('p-pace');
var hasPace=!!(rg&&oT&&oP);
function fmt(sec){
  var h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=Math.round(sec%60);
  return (h?h+':'+p2(m):m)+':'+p2(s);
}
function updatePace(){
  if(!hasPace)return;
  var pace=+rg.value;
  oT.textContent=fmt(pace*activeKm);
  oP.innerHTML=Math.floor(pace/60)+':'+p2(pace%60)+' <small>'+((CFG.i18n&&CFG.i18n.minKm)||'min/km')+'</small>';
}
if(hasPace){rg.addEventListener('input',updatePace);updatePace();}

// The course map is opt-in, from MitroRun > Settings > Map. WordPress simply
// does not print the panel when it is off, so this is a no-op there. The static
// mockup keeps the markup and relies on this, so one flag drives both.
if(CFG.showMap===false){
  var mapCol=d.querySelector('.course-grid .panel');
  if(mapCol){(mapCol.closest('.rv')||mapCol).remove()}
}
var courseGrid=d.querySelector('.course-grid');
if(courseGrid && !courseGrid.querySelector('.panel')){courseGrid.classList.add('no-map')}

// Route data drives the facts, the tabs and the pace tool whether or not a map
// is on screen. Only the drawing below is conditional on Leaflet and the panel.
var mapEl=d.getElementById('courseMap'),
    useMap=!!(window.L && mapEl && Object.keys(ROUTES).length),
    cm,halo,line,markerGrp,raf=null;

if(useMap){
  cm=L.map('courseMap',{zoomControl:true,scrollWheelZoom:false,attributionControl:true,zoomSnap:.25});
  L.tileLayer(BASE,{attribution:ATTR,maxZoom:19,subdomains:'abcd'}).addTo(cm);
  L.tileLayer(LABELS,{maxZoom:19,subdomains:'abcd',opacity:.72}).addTo(cm);
  cm.on('click',function(){cm.scrollWheelZoom.enable()});
  cm.on('mouseout',function(){cm.scrollWheelZoom.disable()});

  halo=L.polyline([],{color:'#25B34C',weight:16,opacity:.14,lineJoin:'round'}).addTo(cm);
  line=L.polyline([],{color:'#25B34C',weight:5,opacity:1,lineJoin:'round',lineCap:'round'}).addTo(cm);
  markerGrp=L.layerGroup().addTo(cm);
  L.marker(START,{icon:L.divIcon({className:'',html:'<span class="se-badge">'+((CFG.i18n&&CFG.i18n.startFinish)||'Start / Finish')+'</span>',
    iconSize:[100,20],iconAnchor:[50,32]})}).addTo(cm);
  L.circleMarker(START,{radius:7,color:'#fff',weight:2,fillColor:'#25B34C',fillOpacity:1}).addTo(cm);
}

function setFact(id,val){var n=d.getElementById(id);if(n)n.textContent=val}

function drawRoute(R,animate){
  var pts=densify(R.pts,15),cs=cumul(pts),len=cs[cs.length-1];
  halo.setLatLngs(pts);
  cm.invalidateSize();
  cm.fitBounds(L.latLngBounds(pts).pad(0.16));
  markerGrp.clearLayers();
  for(var i=1;i<R.km;i++){
    var pos=pointAt(pts,cs,len*(i/R.km));
    markerGrp.addLayer(L.marker(pos,{icon:L.divIcon({className:'',
      html:'<span class="km-badge">'+i+' '+((CFG.i18n&&CFG.i18n.km)||'km')+'</span>',iconSize:[46,18],iconAnchor:[23,9]})}));
  }
  if(raf)cancelAnimationFrame(raf);
  if(rm||!animate){line.setLatLngs(pts)}
  else{
    var t0=null,DUR=2000;line.setLatLngs([]);
    (function step(ts){
      if(!t0)t0=ts;
      var p=Math.min((ts-t0)/DUR,1),e=1-Math.pow(1-p,2.4);
      line.setLatLngs(pts.slice(0,Math.max(2,Math.floor(e*pts.length))));
      if(p<1)raf=requestAnimationFrame(step);
    })(performance.now());
  }
}

function showRoute(key,animate){
  var R=ROUTES[key];
  if(!R)return;
  if(useMap)drawRoute(R,animate);
  setFact('m-chip',R.label);
  setFact('f-dist',R.dist);
  setFact('f-time',R.time);
  setFact('f-elev',R.elev);
  setFact('f-price',R.price);
  activeKm=R.km;updatePace();
}

if(Object.keys(ROUTES).length){
  var firstTab=d.querySelector('.tab.on')||d.querySelector('.tab');
  var firstKey=firstTab?firstTab.dataset.r:Object.keys(ROUTES)[0];
  showRoute(firstKey,false);

  if(useMap){
    var fired=false;
    new IntersectionObserver(function(en){
      en.forEach(function(x){
        if(x.isIntersecting){cm.invalidateSize();if(!fired){fired=true;showRoute(firstKey,true)}}
      })
    },{threshold:.2}).observe(mapEl);
  }

  var tabsEl=d.getElementById('tabs');
  if(tabsEl)tabsEl.addEventListener('click',function(e){
    var b=e.target.closest('.tab');if(!b)return;
    this.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on');t.setAttribute('aria-selected','false')});
    b.classList.add('on');b.setAttribute('aria-selected','true');
    showRoute(b.dataset.r,true);
  });
}

})();
