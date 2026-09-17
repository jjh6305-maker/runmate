/* RUNMATE record-map enhancement: Leaflet + OpenStreetMap, no API key */
(function(){
  const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(css);
  const style=document.createElement('style');style.textContent=`
    .history li{cursor:pointer;transition:.18s;border:1px solid transparent;margin:6px 0}
    .history li.recordSelected{background:linear-gradient(135deg,#123d78,#172a43);border:2px solid #2d7dff;box-shadow:0 0 0 3px rgba(45,125,255,.12),0 8px 24px rgba(45,125,255,.18);transform:scale(1.01)}
    .history li.recordSelected:after{content:'📍 경로보기';display:block;color:#8fc0ff;font-size:11px;font-weight:900;position:absolute;right:12px;bottom:8px}
    .history li{position:relative;padding-bottom:18px!important}
    #routeMap{height:340px;width:100%;background:#10161b}
    .routeLegend{display:flex;gap:15px;align-items:center;padding:10px 14px;color:#aab4bd;font-size:12px}
    .routeDot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:5px}.routeStart{background:#21c55d}.routeEnd{background:#ff5252}
    .leaflet-control-attribution{font-size:9px!important}
  `;document.head.appendChild(style);
  const script=document.createElement('script');script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.onload=install;document.head.appendChild(script);
  let map=null;
  function install(){
    window.showMap=function(i){
      document.querySelectorAll('#history li[data-index]').forEach(li=>li.classList.toggle('recordSelected',Number(li.dataset.index)===Number(i)));
      const runs=JSON.parse(localStorage.getItem('runs')||'[]'),r=runs[i],area=document.getElementById('mapArea');
      if(!r||!r.route||r.route.length<2){area.innerHTML='<div class="mapHead">📍 GPS 이동경로</div><div class="mapEmpty">이 기록에는 저장된 GPS 경로가 없습니다.<br>업데이트 후 새 러닝부터 경로가 저장됩니다.</div>';return;}
      area.innerHTML='<div class="mapHead">📍 GPS 이동경로 · '+Number(r.km).toFixed(2)+' km</div><div id="routeMap"></div><div class="routeLegend"><span><i class="routeDot routeStart"></i>출발</span><span><i class="routeDot routeEnd"></i>도착</span></div>';
      if(map){try{map.remove()}catch(e){}}map=L.map('routeMap',{zoomControl:true,attributionControl:true});
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
      const pts=r.route.map(p=>[Number(p[0]),Number(p[1])]).filter(p=>isFinite(p[0])&&isFinite(p[1]));
      const line=L.polyline(pts,{color:'#2d7dff',weight:6,opacity:.95,lineCap:'round',lineJoin:'round'}).addTo(map);
      L.circleMarker(pts[0],{radius:8,color:'#fff',weight:3,fillColor:'#21c55d',fillOpacity:1}).addTo(map).bindPopup('출발');
      L.circleMarker(pts[pts.length-1],{radius:8,color:'#fff',weight:3,fillColor:'#ff5252',fillOpacity:1}).addTo(map).bindPopup('도착');
      map.fitBounds(line.getBounds(),{padding:[28,28]});setTimeout(()=>map.invalidateSize(),120);
      area.scrollIntoView({behavior:'smooth',block:'nearest'});
    };
    const oldRender=window.render;
    if(oldRender){window.render=function(){oldRender();bindRecordClicks();};}
    bindRecordClicks();
  }
  function bindRecordClicks(){document.querySelectorAll('#history li[data-index]').forEach(li=>{li.onclick=function(){window.showMap(Number(this.dataset.index));};});}
})();