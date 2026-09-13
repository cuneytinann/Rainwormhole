/* goruntu.js — oyunu gercek node-canvas uzerinde kosturup PNG kare yazar.
   Kullanim: node goruntu.js <kaynak.html> <bolum> <kare> <cikti.png> [sim]
   sim: "spawn" (varsayilan, hic tusa basmadan N kare) | "run" (D basili) */
const fs=require('fs'), vm=require('vm');
const {createCanvas, Image, CanvasRenderingContext2D}=require('canvas');

/* ---- Path2D vekili: node-canvas'ta yok. Komutlari kaydeder, fill/stroke
   cagrisinda hedef baglama yeniden oynatir. M/C/L/Z + imperatif metodlar. ---- */
class Path2D {
  constructor(d){ this.c=[];
    if(typeof d==='string'){
      const tk=d.match(/[MCLZmclz]|-?\d*\.?\d+/g)||[]; let i=0,cmd='M';
      const num=()=>+tk[i++];
      while(i<tk.length){
        if(/[MCLZmclz]/.test(tk[i]))cmd=tk[i++];
        if(i>=tk.length&&cmd.toUpperCase()!=='Z')break;
        if(cmd==='M'){this.moveTo(num(),num());cmd='L';}
        else if(cmd==='L')this.lineTo(num(),num());
        else if(cmd==='C')this.bezierCurveTo(num(),num(),num(),num(),num(),num());
        else if(cmd.toUpperCase()==='Z')this.closePath();
        else i++;
      }
    }
  }
  moveTo(...a){this.c.push(['moveTo',a]);return this}
  lineTo(...a){this.c.push(['lineTo',a]);return this}
  bezierCurveTo(...a){this.c.push(['bezierCurveTo',a]);return this}
  quadraticCurveTo(...a){this.c.push(['quadraticCurveTo',a]);return this}
  arc(...a){this.c.push(['arc',a]);return this}
  ellipse(...a){this.c.push(['ellipse',a]);return this}
  rect(...a){this.c.push(['rect',a]);return this}
  closePath(){this.c.push(['closePath',[]]);return this}
  _play(X){X.beginPath();for(const [m,a] of this.c)X[m](...a);}
}
for(const m of ['fill','stroke','clip']){
  const orig=CanvasRenderingContext2D.prototype[m];
  CanvasRenderingContext2D.prototype[m]=function(p,...rest){
    if(p&&p.c&&p._play){p._play(this);return orig.call(this,...rest);}
    return orig.call(this,...(p===undefined?[]:[p,...rest]));
  };
}

function run(src, level, frames, out, mode){
  const html=fs.readFileSync(src,'utf8');
  let js=html.match(/<script>([\s\S]*?)<\/script>/)[1];

  const VW=+(process.env.VW||936), VH=+(process.env.VH||504);                 // 1.5x oyun alani, tam oran
  const cv=createCanvas(VW,VH);
  const rafs=[];

  const mkCanvas=()=>{
    const c=createCanvas(1,1);
    c.style={}; c.addEventListener=()=>{}; c.getBoundingClientRect=()=>({left:0,top:0,width:VW,height:VH});
    return c;
  };
  const main=cv;
  main.style={}; main.addEventListener=()=>{};
  main.getBoundingClientRect=()=>({left:0,top:0,width:VW,height:VH});

  const doc={
    getElementById:id=>id==='c'?main:null,
    createElement:t=>t==='canvas'?mkCanvas():{style:{},appendChild(){},addEventListener(){},
      set textContent(v){},get textContent(){return ''}},
    body:{appendChild(){},style:{}},
    addEventListener(){},
  };
  const fakeAudioNode={connect(){return fakeAudioNode},start(){},stop(){},
    gain:{value:1,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},
    frequency:{value:1,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},
    type:'',buffer:null,loop:false,playbackRate:{value:1},
    getChannelData:()=>new Float32Array(4410),
    copyToChannel(){},connect2(){}};
  class FakeAC{
    constructor(){this.state='running';this.sampleRate=44100;this.currentTime=0;
      this.destination=fakeAudioNode;}
    resume(){} createGain(){return Object.assign({},fakeAudioNode,{connect:()=>fakeAudioNode,gain:{value:1,setValueAtTime(){},linearRampToValueAtTime(){}}})}
    createOscillator(){return Object.assign({},fakeAudioNode,{connect:()=>fakeAudioNode,start(){},stop(){},frequency:{value:1,setValueAtTime(){},linearRampToValueAtTime(){}}})}
    createBufferSource(){return Object.assign({},fakeAudioNode,{connect:()=>fakeAudioNode,start(){},stop(){}})}
    createBuffer(ch,len){return {getChannelData:()=>new Float32Array(len),length:len,copyToChannel(){}}}
    createBiquadFilter(){return Object.assign({},fakeAudioNode,{connect:()=>fakeAudioNode,
      frequency:{value:1,setValueAtTime(){}},Q:{value:1},type:''})}
    createDynamicsCompressor(){return Object.assign({},fakeAudioNode,{connect:()=>fakeAudioNode,
      threshold:{value:0},knee:{value:0},ratio:{value:1},attack:{value:0},release:{value:0}})}
  }
  let T0=0;
  const sandbox={
    document:doc, Path2D, Image,
    devicePixelRatio:1, innerWidth:VW, innerHeight:VH,
    addEventListener(){}, removeEventListener(){},
    requestAnimationFrame:f=>{rafs.push(f);return rafs.length},
    performance:{now:()=>T0},
    AudioContext:FakeAC, webkitAudioContext:FakeAC,
    Math, JSON, Date, console:{log(){},warn(){},error(){}},
    Float32Array, Float64Array, Uint8Array, Uint16Array, Uint32Array, Int32Array, Array, Object,
    String, Number, Boolean, Set, Map, isNaN, parseInt, parseFloat, navigator:{maxTouchPoints:0,userAgent:'node'},
    ontouchstart:undefined, setTimeout:(f,t)=>0, matchMedia:()=>({matches:false,addListener(){}}), localStorage:{getItem:()=>null,setItem(){}},
  };
  sandbox.window=sandbox; sandbox.globalThis=sandbox; sandbox.self=sandbox;

  // vm'den disari acik disa aktarim (const/let sizmaz).
  // PAKETLI surumde isim yok (tek eval satiri) -> raf zinciriyle surulur.
  const PACKED=!!process.env.PACKED;
  if(!PACKED) js+=`\n;globalThis.__X={frame,load,update,fire,get P(){return P},get keys(){return keys},
      set mx(v){mx=v}, set my(v){my=v}, get tickv(){return tick}, set started(v){started=v},
      get LEVELS(){return LEVELS}, get cubes(){return cubes}, get level(){return level}, get done(){return done},
      get hOK(){return hOK}, get tOK(){return tOK}, get portals(){return portals}, get foes(){return foes}, get carried(){return carried}, hornTip, tailTip, limbDir, castStraight, bodyTeleport, embedded, isSolid, get map(){return map}, get mxv(){return mx}, get myv(){return my}, setNow:v=>{T0=v}, get lz(){return lz}, get gateOn(){return gateOn}, get rOn(){return rOn}};`;

  vm.createContext(sandbox);
  vm.runInContext(js, sandbox, {filename:'game.js'});
  if(PACKED){
    // duman testi: sadece "patlamadan donuyor mu + piksel basiyor mu"
    for(let i=0;i<frames;i++){T0=i*16.7;const f=rafs.pop();rafs.length=0;f(T0);}
    fs.writeFileSync(out, cv.toBuffer('image/png'));
    const d=cv.getContext('2d').getImageData(0,0,VW,VH).data;
    let nz=0;for(let i=0;i<d.length;i+=4)if(d[i]>25||d[i+1]>25)nz++;
    console.log('paketli surum: '+frames+' kare hatasiz, boyali piksel %'+
      (nz/(VW*VH)*100).toFixed(1));
    return null;
  }
  const G=sandbox.__X; G.SB=sandbox;

  G.started=1;
  G.load(level);
  if(mode==='gait'){
    // YERINDE kosu: her kareden sonra x geri alinir, at platformdan cikmaz.
    const x0=G.P.x, y0=G.P.y;
    G.keys.d=1;
    const sc=Math.min(VW/624,VH/336), oxx=(VW-624*sc)/2, oyy=(VH-336*sc)/2;
    const cw=62, ch=62, Z=9, N=5, SKIP=3;
    for(let i=0;i<80;i++){T0=i*16.7;rafs.length=0;G.frame();G.P.x=x0;G.P.y=y0;}
    const strip=createCanvas(N*cw*Z, ch*Z), SX=strip.getContext('2d');
    SX.fillStyle='#0d0f1a';SX.fillRect(0,0,strip.width,strip.height);
    for(let i=0;i<N;i++){
      for(let k=0;k<SKIP;k++){T0=(80+i*SKIP+k)*16.7;rafs.length=0;G.frame();G.P.x=x0;G.P.y=y0;}
      const px=oxx+(x0+G.P.w/2)*sc, py=oyy+(y0+G.P.h/2)*sc;
      SX.drawImage(cv, px-cw/2, py-ch/2+17, cw, ch, i*cw*Z, 0, cw*Z, ch*Z);
      SX.strokeStyle='#2a3050';SX.strokeRect(i*cw*Z,0,cw*Z,ch*Z);
    }
    fs.writeFileSync(out, strip.toBuffer('image/png'));
    return G;
  }
  // fare ortada dursun ki nisan makul olsun
  G.mx=400; G.my=120;
  if(mode==='run')G.keys.d=1;
  for(let i=0;i<frames;i++){ T0=i*16.7; rafs.length=0; G.frame(); }

  fs.writeFileSync(out, cv.toBuffer('image/png'));
  // yakin plan: atin etrafindan kirp, 4x buyut
  const sc=Math.min(VW/624,VH/336), oxx=(VW-624*sc)/2, oyy=(VH-336*sc)/2;
  const cw=190, ch=130, Z=4;
  const px=oxx+(G.P.x+G.P.w/2)*sc, py=oyy+(G.P.y+G.P.h/2)*sc;
  const zc=createCanvas(cw*Z,ch*Z), zx=zc.getContext('2d');
  zx.imageSmoothingEnabled=false;
  zx.drawImage(cv, px-cw/2, py-ch/2, cw, ch, 0,0, cw*Z, ch*Z);
  fs.writeFileSync(out.replace(/\.png$/,'-zoom.png'), zc.toBuffer('image/png'));
  return G;
}
if(require.main===module){
  run(process.argv[2], +(process.argv[3]||0), +(process.argv[4]||1),
      process.argv[5]||'kare.png', process.argv[6]||'spawn');
  console.log('yazildi:', process.argv[5]||'kare.png');
}
module.exports={run};
