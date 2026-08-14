(function(){
'use strict';
var d=document,rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- header / sticky / scrollspy ---------- */
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

/* ---------- menu ---------- */
var bg=d.getElementById('bg'),mn=d.getElementById('menu');
bg.addEventListener('click',function(){
  var o=mn.classList.toggle('open');
  bg.classList.toggle('on',o);bg.setAttribute('aria-expanded',o);
  d.body.style.overflow=o?'hidden':'';
});
mn.addEventListener('click',function(e){
  if(e.target.closest('a')){mn.classList.remove('open');bg.classList.remove('on');d.body.style.overflow=''}
});

/* ---------- countdown ---------- */
var T=new Date('2026-10-04T11:00:00+02:00').getTime(),
    E={d:d.getElementById('cd-d'),h:d.getElementById('cd-h'),m:d.getElementById('cd-m'),s:d.getElementById('cd-s')};
function p2(n){return n<10?'0'+n:''+n}
function tick(){
  var f=Math.max(0,T-Date.now()),s=Math.floor(f/1000);
  E.d.textContent=Math.floor(s/86400);
  E.h.textContent=p2(Math.floor(s%86400/3600));
  E.m.textContent=p2(Math.floor(s%3600/60));
  E.s.textContent=p2(s%60);
}
tick();setInterval(tick,1000);

/* ---------- scroll reveals ---------- */
var io=new IntersectionObserver(function(en){
  en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})
},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
d.querySelectorAll('.rv,.head').forEach(function(n,i){n.style.transitionDelay=(i%3)*0.08+'s';io.observe(n)});
d.querySelectorAll('.plate').forEach(function(pl){
  pl.querySelectorAll('.pl-a').forEach(function(p){
    try{p.style.setProperty('--len',p.getTotalLength())}catch(e){}
  });
  io.observe(pl);
});

/* ---------- counters ---------- */
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

/* ==========================================================
   MAPS — OpenStreetMap / CARTO via Leaflet
   ========================================================== */
var START=[42.8901,20.8672];
var ROUTES={
 '10':{label:'10K Liqeni',dist:'10 km',time:'11:00',elev:'~20 m',price:'20 €',km:10,pts:[
  [42.8901,20.8672],[42.8913,20.8662],[42.8927,20.8652],[42.8942,20.8648],[42.8958,20.8656],
  [42.8972,20.8676],[42.8981,20.8704],[42.8983,20.8736],[42.8974,20.8768],[42.8957,20.8792],
  [42.8934,20.8806],[42.8908,20.8812],[42.8882,20.8806],[42.8857,20.8792],[42.8835,20.8770],
  [42.8818,20.8742],[42.8808,20.8708],[42.8806,20.8672],[42.8814,20.8636],[42.8832,20.8606],
  [42.8856,20.8586],[42.8878,20.8584],[42.8894,20.8602],[42.8901,20.8632],[42.8902,20.8656],
  [42.8901,20.8672]]},
 '5':{label:'5K Lumi',dist:'5 km',time:'11:00',elev:'~12 m',price:'15 €',km:5,pts:[
  [42.8901,20.8672],[42.8911,20.8664],[42.8922,20.8658],[42.8934,20.8664],[42.8942,20.8682],
  [42.8944,20.8704],[42.8936,20.8724],[42.8921,20.8736],[42.8903,20.8740],[42.8885,20.8734],
  [42.8871,20.8720],[42.8864,20.8700],[42.8866,20.8678],[42.8875,20.8660],[42.8888,20.8656],
  [42.8897,20.8664],[42.8901,20.8672]]},
 '2':{label:'2K Shotat',dist:'2 km',time:'10:00',elev:'~6 m',price:'Falas',km:2,pts:[
  [42.8901,20.8672],[42.8908,20.8666],[42.8915,20.8662],[42.8921,20.8668],[42.8922,20.8680],
  [42.8916,20.8690],[42.8906,20.8694],[42.8896,20.8690],[42.8892,20.8680],[42.8895,20.8672],
  [42.8901,20.8672]]}
};
var ATTR='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
var BASE='https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
var LABELS='https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png';

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
function fmt(sec){
  var h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=Math.round(sec%60);
  return (h?h+':'+p2(m):m)+':'+p2(s);
}
function updatePace(){
  var pace=+rg.value;
  oT.textContent=fmt(pace*activeKm);
  oP.innerHTML=Math.floor(pace/60)+':'+p2(pace%60)+' <small>min/km</small>';
}
rg.addEventListener('input',updatePace);updatePace();

if(window.L){
  /* ---- hero map (backdrop) ---- */
  var hm=L.map('heroMap',{zoomControl:false,attributionControl:true,dragging:false,
    scrollWheelZoom:false,doubleClickZoom:false,touchZoom:false,boxZoom:false,keyboard:false,zoomSnap:.1});
  L.tileLayer(BASE,{attribution:ATTR,maxZoom:19,subdomains:'abcd'}).addTo(hm);
  L.tileLayer(LABELS,{maxZoom:19,subdomains:'abcd',opacity:.45}).addTo(hm);
  var hpts=densify(ROUTES['10'].pts,20);
  function fitHero(){hm.invalidateSize();hm.fitBounds(L.latLngBounds(hpts).pad(0.22),{animate:false})}
  fitHero();
  L.polyline(hpts,{color:'#25B34C',weight:14,opacity:.12,lineJoin:'round'}).addTo(hm);
  L.polyline(hpts,{color:'#25B34C',weight:4,opacity:.85,lineJoin:'round',lineCap:'round'}).addTo(hm);
  L.circleMarker(START,{radius:6,color:'#fff',weight:2,fillColor:'#25B34C',fillOpacity:1}).addTo(hm);
  window.addEventListener('resize',fitHero);

  /* ---- course map ---- */
  var cm=L.map('courseMap',{zoomControl:true,scrollWheelZoom:false,attributionControl:true,zoomSnap:.25});
  L.tileLayer(BASE,{attribution:ATTR,maxZoom:19,subdomains:'abcd'}).addTo(cm);
  L.tileLayer(LABELS,{maxZoom:19,subdomains:'abcd',opacity:.72}).addTo(cm);
  cm.on('click',function(){cm.scrollWheelZoom.enable()});
  cm.on('mouseout',function(){cm.scrollWheelZoom.disable()});

  var halo=L.polyline([],{color:'#25B34C',weight:16,opacity:.14,lineJoin:'round'}).addTo(cm);
  var line=L.polyline([],{color:'#25B34C',weight:5,opacity:1,lineJoin:'round',lineCap:'round'}).addTo(cm);
  var markerGrp=L.layerGroup().addTo(cm);
  L.marker(START,{icon:L.divIcon({className:'',html:'<span class="se-badge">Start / Finish</span>',
    iconSize:[100,20],iconAnchor:[50,32]})}).addTo(cm);
  L.circleMarker(START,{radius:7,color:'#fff',weight:2,fillColor:'#25B34C',fillOpacity:1}).addTo(cm);

  var raf=null;
  function showRoute(key,animate){
    var R=ROUTES[key],pts=densify(R.pts,15),cs=cumul(pts),len=cs[cs.length-1];
    halo.setLatLngs(pts);
    cm.invalidateSize();
    cm.fitBounds(L.latLngBounds(pts).pad(0.16));
    markerGrp.clearLayers();
    for(var i=1;i<R.km;i++){
      var pos=pointAt(pts,cs,len*(i/R.km));
      markerGrp.addLayer(L.marker(pos,{icon:L.divIcon({className:'',
        html:'<span class="km-badge">'+i+' km</span>',iconSize:[46,18],iconAnchor:[23,9]})}));
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
    d.getElementById('m-chip').textContent=R.label;
    d.getElementById('f-dist').textContent=R.dist;
    d.getElementById('f-time').textContent=R.time;
    d.getElementById('f-elev').textContent=R.elev;
    d.getElementById('f-price').textContent=R.price;
    activeKm=R.km;updatePace();
  }
  showRoute('10',false);

  var fired=false;
  new IntersectionObserver(function(en){
    en.forEach(function(x){
      if(x.isIntersecting){cm.invalidateSize();if(!fired){fired=true;showRoute('10',true)}}
    })
  },{threshold:.2}).observe(d.getElementById('courseMap'));

  d.getElementById('tabs').addEventListener('click',function(e){
    var b=e.target.closest('.tab');if(!b)return;
    this.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on')});
    b.classList.add('on');
    showRoute(b.dataset.r,true);
  });
}
})();
