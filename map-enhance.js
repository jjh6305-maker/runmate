/* RUNMATE record-map enhancement: Leaflet + OpenStreetMap, no API key */
(function(){
  const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(css);
  const style=document.createElement('style');style.textContent=`
    .history li{cursor:pointer;transition:.18s;border:1px solid transparent;margin:7px 0;position:relative;padding:14px 10px!important;min-height:78px}
    .history li.recordSelected{background:linear-gradient(135deg,#123d78,#172a43);border:2px solid #2d7dff;box-shadow:0 0 0 3px rgba(45,125,255,.12),0 8px 24px rgba(45,125,255,.18)}
    .routeBadge{display:none;clear:both;width:max-content;margin-top:9px;padding:5px 9px;border-radius:10px;background:#2d7dff;color:#fff;font-size:11px;font-weight:900;line-height:1.2;white-space:nowrap}
    .history li.recordSelected .routeBadge{display:inline-flex;align-items:center;gap:3px}
    #routeMap{height:340px;width:100%;background:#10161b;z-index:1}
    .routeLegend{display:flex;gap:15px;align-items:center;padding:10px 14px;color:#aab4bd;font-size:12px}
    .routeDot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:5px}.routeStart{background:#21c55d}.routeEnd{background:#ff5252}
    .routeStatus{padding:0 14px 12px;color:#8fc0ff;font-size:12px;font-weight:700}
    .leaflet-control-attribution{font-size:9px!important}
  `;document.head.appendChild(style);
  const script=document.createElement('script');script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.onload=install;script.onerror=()=>console.error('RUNMATE: Leaflet load failed');document.head.appendChild(script);
  let map=null;
  function validPoints(route){return (route||[]).map(p=>[Number(p[0]),Number(p[1])]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1])&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180);}
  function install(){
    window.showMap=function(i){
      document.querySelectorAll('#history li[data-index]').forEach(li=>li.classList.toggle('recordSelected',Number(li.dataset.index)===Number(i)));
      const runs=JSON.parse(localStorage.getItem('runs')||'[]'),r=runs[i],area=document.getElementById('mapArea');
      if(!r){area.innerHTML='<div class="mapHead">📍 GPS 이동경로</div><div class="mapEmpty">기록을 찾을 수 없습니다.</div>';return;}
      const pts=validPoints(r.route);
      if(pts.length<2){area.innerHTML='<div class="mapHead">📍 GPS 이동경로</div><div class="mapEmpty">이 기록에는 표시할 GPS 경로가 없습니다.<br>업데이트 후 새 러닝부터 GPS 좌표가 저장됩니다.</div>';return;}
      area.innerHTML='<div class="mapHead">📍 GPS 이동경로 · '+Number(r.km||0).toFixed(2)+' km</div><div class="routeStatus">GPS 포인트 '+pts.length+'개 · 경로 표시됨</div><div id="routeMap"></div><div class="routeLegend"><span><i class="routeDot routeStart"></i>출발</span><span><i class="routeDot routeEnd"></i>도착</span></div>';
      if(map){try{map.remove()}catch(e){}}map=L.map('routeMap',{zoomControl:true,attributionControl:true});
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
      const line=L.polyline(pts,{color:'#2d7dff',weight:6,opacity:.95,lineCap:'round',lineJoin:'round'}).addTo(map);
      L.circleMarker(pts[0],{radius:8,color:'#fff',weight:3,fillColor:'#21c55d',fillOpacity:1}).addTo(map).bindPopup('출발');
      L.circleMarker(pts[pts.length-1],{radius:8,color:'#fff',weight:3,fillColor:'#ff5252',fillOpacity:1}).addTo(map).bindPopup('도착');
      const bounds=line.getBounds();if(bounds.isValid())map.fitBounds(bounds,{padding:[28,28],maxZoom:17});else map.setView(pts[0],16);
      setTimeout(()=>map.invalidateSize(),150);
      area.scrollIntoView({behavior:'smooth',block:'nearest'});
    };
    const oldRender=window.render;
    if(oldRender){window.render=function(){oldRender();bindRecordClicks();};}
    bindRecordClicks();
  }
  function bindRecordClicks(){document.querySelectorAll('#history li[data-index]').forEach(li=>{
    if(!li.querySelector('.routeBadge')){const left=li.querySelector('span');if(left){const badge=document.createElement('span');badge.className='routeBadge';badge.textContent='📍 경로보기';left.appendChild(badge);}}
    li.onclick=function(){window.showMap(Number(this.dataset.index));};
  });}
})();