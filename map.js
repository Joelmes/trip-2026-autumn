/* SVG 示意地图（离线可用）——多页面共用
   页面在引入本文件前设置：
   window.MAP_CONFIG = { routes:["rt0",...], hidden:["rt0"] }
   routes 缺省显示全部；hidden 里的默认不勾选。 */
(function(){
const CITY = {
  杭州:[119.60,30.25], 阜阳:[115.81,32.89], 洛阳:[112.45,34.62], 西安:[108.94,34.34], 灵台:[107.62,35.07],
  宝鸡:[107.14,34.37], 留坝:[106.92,33.61], 汉中:[107.03,33.07], 武当山:[110.80,32.47], 襄阳:[112.12,32.01],
  武汉:[114.31,30.59], 合肥:[117.28,31.86], 宣城:[118.76,30.95],
  固原:[106.24,36.00], 银川:[106.23,38.48], 中卫:[105.18,37.51], 延安:[109.49,36.60], 壶口:[110.45,36.15], 平遥:[112.18,37.20],
  广元:[105.84,32.44], 重庆:[106.55,29.56], 凤凰:[109.60,27.95], 长沙:[112.94,28.23], 南昌:[115.86,28.68],
  兰州:[103.83,36.06], 临夏:[103.21,35.60], 夏河:[102.51,35.20], 郎木寺:[102.63,34.09], 若尔盖:[102.96,33.57],
  九寨沟:[103.92,33.26], 成都:[104.07,30.57],
  武威:[102.63,37.93], 张掖:[100.45,38.93], 嘉峪关:[98.28,39.77], 敦煌:[94.66,40.14],
  运城:[111.00,35.03], 晋城:[112.85,35.49], 新乡:[113.93,35.30], 郑州:[113.62,34.75],
};
const PROV = {
  杭州:"浙江", 阜阳:"安徽", 洛阳:"河南", 西安:"陕西", 灵台:"甘肃", 宝鸡:"陕西", 留坝:"陕西", 汉中:"陕西",
  武当山:"湖北", 襄阳:"湖北", 武汉:"湖北", 合肥:"安徽", 宣城:"安徽", 固原:"宁夏", 银川:"宁夏", 中卫:"宁夏",
  延安:"陕西", 壶口:"山西/陕西", 平遥:"山西", 广元:"四川", 重庆:"重庆", 凤凰:"湖南", 长沙:"湖南", 南昌:"江西",
  兰州:"甘肃", 临夏:"甘肃", 夏河:"甘肃", 郎木寺:"甘肃/四川", 若尔盖:"四川", 九寨沟:"四川", 成都:"四川",
  武威:"甘肃", 张掖:"甘肃", 嘉峪关:"甘肃", 敦煌:"甘肃",
  运城:"山西", 晋城:"山西", 新乡:"河南", 郑州:"河南",
};
const ROUTES = [
 {id:"rt0", color:"#2f6fed", short:"去程", pts:["杭州","阜阳","洛阳","西安","灵台"], name:"去程：杭州 → 阜阳 → 洛阳 → 西安 → 灵台"},
 {id:"rtn", color:"#9c36b5", short:"北线（宁夏·陕北·山西）", pts:["灵台","固原","银川","中卫","延安","壶口","平遥","杭州"], name:"北线：灵台 → 固原 → 银川 → 中卫 → 延安 → 壶口 → 平遥 → 杭州"},
 {id:"rt4", color:"#0c8599", short:"华中线（西安·武当·襄阳·武汉）", pts:["灵台","西安","武当山","襄阳","武汉","杭州"], name:"华中线：灵台 → 西安 → 武当山 → 襄阳 → 武汉 → 杭州"},
 {id:"rts", color:"#e8590c", short:"南线（川渝·湘西·赣）", pts:["灵台","广元","重庆","凤凰","长沙","南昌","杭州"], name:"南线：灵台 → 广元 → 重庆 → 凤凰 → 长沙 → 南昌 → 杭州"},
 {id:"rt5", color:"#d6336c", short:"甘南—川西线", pts:["灵台","兰州","临夏","夏河","郎木寺","若尔盖","九寨沟","成都","重庆","长沙","杭州"], name:"甘南—川西线：灵台 → 兰州 → 夏河 → 郎木寺 → 若尔盖 → 九寨沟 → 成都 → 重庆 → 长沙 → 杭州"},
 {id:"rt6", color:"#5f3dc4", short:"河西走廊线", pts:["灵台","兰州","武威","张掖","嘉峪关","敦煌","兰州","西安","合肥","杭州"], name:"河西走廊线：灵台 → 兰州 → 武威 → 张掖 → 嘉峪关 → 敦煌 → 兰州 → 西安 → 合肥 → 杭州"},
 {id:"rt7", color:"#495057", short:"太行山—晋中线", pts:["灵台","西安","运城","晋城","新乡","郑州","合肥","杭州"], name:"太行山—晋中线：灵台 → 西安 → 运城 → 晋城 → 新乡 → 郑州 → 合肥 → 杭州"},
];
const cfg = window.MAP_CONFIG || {};
const allowed = cfg.routes || ROUTES.map(r=>r.id);
const hidden = cfg.hidden || [];
const mapEl = document.getElementById("map");
if(!mapEl) return;

/* 视野范围（经度 92–126，纬度 20–43.5） */
const LON0=92, LON1=126, LAT0=20, LAT1=43.5, W=1000, H=760;
const X = lon => (lon-LON0)/(LON1-LON0)*W;
const Y = lat => (LAT1-lat)/(LAT1-LAT0)*H;
const svgNS = "http://www.w3.org/2000/svg";
function el(tag, attrs){
  const e = document.createElementNS(svgNS, tag);
  for(const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
/* 中国大陆轮廓（简化示意） */
const OUTLINE = [
[73.6,39.4],[76.0,40.6],[80.2,45.1],[83.0,47.2],[85.5,48.0],[87.8,49.1],[90.9,47.8],[96.4,42.8],
[105.0,41.8],[110.0,42.5],[114.5,45.0],[117.8,46.7],[117.5,49.6],[121.0,52.8],[124.0,53.2],[126.5,52.8],
[134.7,48.4],[133.0,45.2],[131.2,43.3],[130.6,42.4],[128.0,41.5],[124.4,40.1],[121.7,39.0],[122.5,37.4],
[119.2,37.2],[120.3,36.1],[119.4,34.7],[120.9,32.6],[121.9,31.0],[121.4,28.4],[119.6,26.0],[118.1,24.5],
[116.7,23.3],[113.9,22.5],[110.4,21.4],[108.3,21.5],[106.7,22.0],[105.3,23.3],[103.9,22.4],[101.7,21.6],
[99.9,21.5],[97.5,23.9],[98.7,25.8],[97.5,28.2],[95.4,29.0],[92.1,26.9],[88.9,27.3],[85.8,30.3],
[81.2,30.2],[79.0,32.4],[78.2,34.6],[76.0,35.5],[74.5,37.0]
];
const TW = [[121.0,25.3],[121.9,24.9],[121.5,23.0],[120.7,22.6],[120.1,23.1],[120.9,25.0]];
const HN = [[108.7,20.0],[110.6,20.1],[111.0,19.6],[109.2,18.2],[108.6,19.0]];

const svg = el("svg",{viewBox:`0 0 ${W} ${H}`, xmlns:svgNS});
mapEl.appendChild(svg);
/* 背景 + 网格 */
svg.appendChild(el("rect",{x:0,y:0,width:W,height:H,fill:"#eaf2f6"}));
for(let lon=95; lon<=125; lon+=5){
  svg.appendChild(el("line",{x1:X(lon),y1:0,x2:X(lon),y2:H,stroke:"#d3e2ea","stroke-width":1}));
  const t = el("text",{x:X(lon)+3,y:H-6,fill:"#9fb8c4","font-size":11}); t.textContent = lon+"°E"; svg.appendChild(t);
}
for(let lat=25; lat<=40; lat+=5){
  svg.appendChild(el("line",{x1:0,y1:Y(lat),x2:W,y2:Y(lat),stroke:"#d3e2ea","stroke-width":1}));
  const t = el("text",{x:6,y:Y(lat)-4,fill:"#9fb8c4","font-size":11}); t.textContent = lat+"°N"; svg.appendChild(t);
}
[OUTLINE,TW,HN].forEach(pg=>{
  svg.appendChild(el("polygon",{points:pg.map(p=>X(p[0])+","+Y(p[1])).join(" "),fill:"#f5f1e8",stroke:"#c9bfa8","stroke-width":1.2,"fill-opacity":.9}));
});
/* 路线 + 图例 */
const legend = document.getElementById("mapLegend");
allowed.forEach(id=>{
  const r = ROUTES.find(x=>x.id===id);
  if(!r) return;
  const g = el("g",{});
  const pts = r.pts.map(n=>CITY[n]);
  for(let i=0;i<pts.length-1;i++){
    g.appendChild(el("line",{x1:X(pts[i][0]),y1:Y(pts[i][1]),x2:X(pts[i+1][0]),y2:Y(pts[i+1][1]),stroke:r.color,"stroke-width":4,"stroke-linecap":"round",opacity:.9}));
  }
  const title = el("title",{}); title.textContent = r.name; g.appendChild(title);
  svg.appendChild(g);
  if(legend){
    const lab = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = !hidden.includes(id);
    const sw = document.createElement("span"); sw.className = "swatch"; sw.style.background = r.color;
    lab.appendChild(cb); lab.appendChild(sw);
    lab.appendChild(document.createTextNode(" " + r.short));
    legend.appendChild(lab);
    g.style.display = cb.checked ? "" : "none";
    cb.addEventListener("change", function(){ g.style.display = this.checked ? "" : "none"; });
  }
});
/* 城市点位 */
Object.keys(CITY).forEach(n=>{
  const [lon,lat] = CITY[n];
  const big = (n==="杭州"||n==="灵台");
  const g = el("g",{cursor:"pointer"});
  g.appendChild(el("circle",{cx:X(lon),cy:Y(lat),r:big?7:5,fill:"#fff",stroke:"#1f2329","stroke-width":big?2.5:1.8}));
  const title = el("title",{}); title.textContent = `${PROV[n]} · ${n}`; g.appendChild(title);
  const labelRight = lon < 111;
  const t = el("text",{x:X(lon)+(labelRight?10:-10),y:Y(lat)+4,fill:"#1f2329","font-size":13,"font-weight":big?700:500,"text-anchor":labelRight?"start":"end",stroke:"#eaf2f6","stroke-width":3,"paint-order":"stroke"});
  t.textContent = n; g.appendChild(t);
  svg.appendChild(g);
});
})();
