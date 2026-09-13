const fs=require('fs');const {createCanvas}=require('canvas');const {run}=require('./goruntu.js');
const T=24, SC=3;                                  // 3x render
process.env.VW=String(624*SC); process.env.VH=String(336*SC);
const P0={cx:6,cy:10,nx:0,ny:-1,px:6*T+T/2,py:10*T,warm:1,born:-999};
const P1={cx:21,cy:2,nx:0,ny:1,px:21*T+T/2,py:2*T+T,warm:0,born:-999};
const G=run('v52-kapak.html',0,3,'/tmp/k.png','spawn');
G.portals[0]=P1;G.portals[1]=P0;
for(let i=0;i<50;i++)G.frame();
const cv=G.SB.document.getElementById('c'), W=cv.width, H=cv.height;
const ax=(G.P.x+G.P.w/2)*SC, ay=(G.P.y+G.P.h/2)*SC;   // atin merkezi, cihaz pikselinde
console.log('at:',(ax|0),(ay|0),'| tuval',W,H);

function kirp(sx,sy,sw,sh,ow,oh,ad){
  sx=Math.max(0,Math.min(W-sw,sx)); sy=Math.max(0,Math.min(H-sh,sy));
  const c=createCanvas(ow,oh),X=c.getContext('2d');
  X.imageSmoothingEnabled=true;X.imageSmoothingQuality='high';
  X.drawImage(cv,sx,sy,sw,sh,0,0,ow,oh);
  fs.writeFileSync(ad,c.toBuffer('image/png'));
  console.log(ad, fs.statSync(ad).size,'bayt   kaynak kirpim',sw+'x'+sh,'@',(sx|0)+','+(sy|0));
}
// 800x500 (1.6:1) — tam yukseklik, solu kesme: at solda, boru S ciziyor,
// sag portal kadrajin icinde kaliyor. Oyunun kimligi boru, o yuzden tamami gorunsun.
kirp(0, 0, Math.round(H*1.6), H, 800, 500, 'kapak-800x500.png');
// 320x320 — kucuk listeleme gorseli: konu TANINIR olmali, manzara degil.
// Ata yakin plan, portal agzi sagda, tas zemin kadraja az girsin (yukari kaydir).
const s=Math.round(112*SC);                        // 112 oyun px ≈ 4.7 karo
kirp(Math.round(ax-s*0.30), Math.round(ay-s*0.55), s, s, 320, 320, 'kapak-320x320.png');
