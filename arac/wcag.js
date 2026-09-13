/* wcag.js — WCAG 2.3.1 alan olcumu, GERCEK karelerden.
   Boru karsi-fazla cizilir: performance.now()/FS_MS'in tek/cift olmasi isareti
   cevirir. Iki zit durumu ayni kareye cizip piksel piksel karsilastiriyoruz.
   "Cakan piksel" tanimi (WCAG genel flash): bagil parlaklik farki >= 0.10 VE
   ikisinden karanlik olani < 0.80. Esik: ekranin %25'i.
   EN KOTU HAL taranir: her bolumde birbirinden EN UZAK portal cifti. */
const fs=require('fs'), vm=require('vm');
const {createCanvas, Image, CanvasRenderingContext2D}=require('canvas');
const {run}=require('./goruntu.js');
const T=24, W=624, H=336;

const lin=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;};

function kareAl(G,cv,ms){
  G.setNow(ms);
  G.frame();
  const sc=Math.min(cv.width/W,cv.height/H), ox=(cv.width-W*sc)/2, oy=(cv.height-H*sc)/2;
  return cv.getContext('2d').getImageData(0,0,cv.width,cv.height);
}

function olc(dosya,lvl){
  const G=run(dosya,lvl,3,'/tmp/w.png','spawn');
  const cv=G.SB.document.getElementById('c');
  // tum gecerli portal yuzeyleri
  const spots=[];
  for(let y=0;y<14;y++)for(let x=0;x<26;x++){
    if(G.map[y][x]!=='=')continue;
    for(const [nx,ny] of [[1,0],[-1,0],[0,1],[0,-1]])
      if(!G.isSolid(x+nx,y+ny))spots.push({cx:x,cy:y,nx,ny,px:x*T+T/2+nx*T/2,py:y*T+T/2+ny*T/2,warm:0,born:0});
  }
  if(spots.length<2)return null;
  // en uzak cift = en uzun boru = en genis cakan alan
  let A=null,B=null,dm=-1;
  for(const a of spots)for(const b of spots){
    const d=Math.hypot(a.px-b.px,a.py-b.py);
    if(d>dm){dm=d;A=a;B=b;}
  }
  G.portals[0]=A;G.portals[1]=B;
  const d1=kareAl(G,cv,0).data, d2=kareAl(G,cv,67).data;   // iki zit faz
  const N=cv.width*cv.height;
  let flas=0, mx=0;
  for(let i=0;i<N;i++){
    const p=i*4;
    const l1=.2126*lin(d1[p])+.7152*lin(d1[p+1])+.0722*lin(d1[p+2]);
    const l2=.2126*lin(d2[p])+.7152*lin(d2[p+1])+.0722*lin(d2[p+2]);
    const df=Math.abs(l1-l2); if(df>mx)mx=df;
    if(df>=.10&&Math.min(l1,l2)<.80)flas++;
  }
  return {lvl:lvl+1, uzaklik:(dm/T).toFixed(1), oran:flas/N*100, mx};
}

const dosya=process.argv[2], N=+(process.argv[3]||21);
let en=null;
for(let l=0;l<N;l++){
  const r=olc(dosya,l); if(!r)continue;
  if(!en||r.oran>en.oran)en=r;
  console.log(('bolum '+r.lvl).padEnd(10)+'en uzak cift '+r.uzaklik.padStart(5)+' karo  |  cakan alan %'+
    r.oran.toFixed(2)+(r.oran>=25?'   <<< ESIK ASILDI':''));
}
console.log('\nEN KOTU: bolum '+en.lvl+' — cakan alan %'+en.oran.toFixed(2)+
  '   (WCAG esigi %25)   en buyuk parlaklik farki '+en.mx.toFixed(3));
console.log(en.oran<25?'ALAN ISTISNASI GECERLI.':'ALAN ISTISNASI GECERSIZ — genligi dusur.');
