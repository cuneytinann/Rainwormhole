/* zzfx-lab.js — ZzFX'in ORNEKLERINI uretip olcer. Kulak yok, olcum var:
   zarf (RMS) ve perde konturu (sifir gecisi). Wilhelm'in imzasi:
   sert atak -> tiz tepe -> titresim -> dusen kuyruk. */
const fs=require('fs'), vm=require('vm');
const src=fs.readFileSync('v44.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
// zzfx govdesini izole et: 'let // ZzFX' ile baslayan bildirimden zzfxP'ye kadar
const i0=src.indexOf('let // ZzFXMicro'), i1=src.indexOf('function sfx');
let kod=src.slice(i0,i1);
kod=kod.replace(/zzfxX=new AudioContext,/,'zzfxX=SAHTE,');
// zzfx sonunda zzfxP cagirir; sadece ornekleri istiyoruz -> zzfxP'yi yakala
let YAKALA=null;
const SAHTE={createBuffer:(c,n,r)=>({getChannelData:()=>({set:a=>{YAKALA=a.slice()}}),length:n}),
  createBufferSource:()=>({connect(){},start(){},buffer:null}),destination:{},
  createGain:()=>({connect(){},gain:{value:1}})};
const sb={Math,console,SAHTE,Float32Array,Array,Object};
sb.globalThis=sb;
vm.createContext(sb);
vm.runInContext(kod+'\n;globalThis.__zzfx=zzfx;',sb);
function uret(p){YAKALA=null; sb.__zzfx(...p); return YAKALA;}

/* perde: OTOKORELASYON. Sifir gecisi dalga sekline bagli yalan soyluyordu
   (testere 1 gecis/cevrim, tan onlarca) — olcum araci once dogru olmali. */
function f0(buf,R){
  const n=buf.length, lo=Math.floor(R/2000), hi=Math.floor(R/80);
  let en=0; for(let i=0;i<n;i++)en+=buf[i]*buf[i];
  if(en<1e-9)return 0;
  let iyi=0,dv=0;
  for(let L=lo;L<=hi;L++){
    let c=0,e2=0;
    for(let i=0;i+L<n;i++){c+=buf[i]*buf[i+L];e2+=buf[i+L]*buf[i+L];}
    const v=c/Math.sqrt(en*e2+1e-12);
    if(v>dv){dv=v;iyi=L;}
  }
  return dv>0.3?R/iyi:0;
}
function analiz(s,ad){
  const R=44100, N=s.length, pen=Math.round(R*0.02);
  const sat=[];
  for(let o=0;o+pen<N;o+=Math.round(pen/2)){
    const w=s.subarray?s.subarray(o,o+pen):s.slice(o,o+pen);
    let rms=0;for(let i=0;i<pen;i++)rms+=w[i]*w[i];
    sat.push({t:o/R,rms:Math.sqrt(rms/pen),hz:f0(w,R)});
  }
  const tepe=Math.max(...sat.map(x=>x.rms));
  const canli=sat.filter(x=>x.rms>tepe*0.15&&x.hz>0);
  const hz=canli.map(x=>x.hz);
  const tepeIdx=hz.indexOf(Math.max(...hz));
  console.log(ad.padEnd(8),
    (N/R).toFixed(2)+'s',
    '| f0 basla '+(hz[0]|0)+' -> tepe '+(Math.max(...hz)|0)+' (%'+((tepeIdx/hz.length*100)|0)+' noktada) -> son '+(hz[hz.length-1]|0),
    '| atak '+(sat.findIndex(x=>x.rms>tepe*0.8)*10)+'ms');
  return sat;
}
module.exports={uret,analiz};
if(require.main===module){
  const T={ // volume,rand,freq,attack,sustain,release,shape,shapeCurve,slide,deltaSlide,
            // pitchJump,pitchJumpTime,repeatTime,noise,mod,bitCrush,delay,sustainVol,decay,tremolo,filter
    mevcut_olum: [0.5,0.05,180,0,0.12,0.25,3,1.6,-9,0,0,0,0,0.2],
    W1: [1,.05,320,.02,.28,.35,2,1.4,-3,0,180,.06,0,.08,.6,0,0,1,.1,0,0],
  };
  for(const [ad,p] of Object.entries(T)) analiz(uret(p),ad);
}

/* kontur cizimi: perde ve zarf, zamana karsi */
function ciz(liste, dosya){
  const {createCanvas}=require('canvas');
  const W=980,H=120*liste.length+30, c=createCanvas(W,H), X=c.getContext('2d');
  X.fillStyle='#12141f';X.fillRect(0,0,W,H);
  liste.forEach(([ad,sat],k)=>{
    const y0=k*120+26, hzmax=Math.max(700,...sat.map(s=>s.hz)), rmax=Math.max(...sat.map(s=>s.rms));
    const tmax=sat[sat.length-1].t;
    X.fillStyle='#8b93ad';X.font='12px sans-serif';X.fillText(ad+'   (tepe perde '+(Math.max(...sat.map(s=>s.hz))|0)+' Hz, sure '+tmax.toFixed(2)+'s)',6,y0-8);
    X.strokeStyle='#2e3348';X.beginPath();X.moveTo(60,y0+96);X.lineTo(W-10,y0+96);X.stroke();
    // zarf
    X.fillStyle='#26407a';X.beginPath();X.moveTo(60,y0+96);
    sat.forEach(s=>X.lineTo(60+(s.t/tmax)*(W-80),y0+96-(s.rms/rmax)*90));
    X.lineTo(W-20,y0+96);X.fill();
    // perde
    X.strokeStyle='#5fe0a0';X.lineWidth=1.8;X.beginPath();
    sat.filter(s=>s.rms>rmax*0.12).forEach((s,i)=>{const x=60+(s.t/tmax)*(W-80),y=y0+96-(s.hz/hzmax)*90;
      i?X.lineTo(x,y):X.moveTo(x,y);});
    X.stroke();
  });
  require('fs').writeFileSync(dosya,c.toBuffer('image/png'));
}
module.exports.ciz=ciz;
