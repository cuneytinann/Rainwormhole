/* paketli index.html'i kosturur, HER konsol cagrisini ve atilan hatayi yakalar */
const fs=require('fs'), vm=require('vm');
const g=require('./goruntu.js');
let hata=[],log=[];
const orig=console;
process.env.PACKED='1';
try{
  // goruntu.js'in sandbox'ini kullanamiyoruz (console susturulmus) -> kendi kosumuz
  const kod=fs.readFileSync('z52/index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
  const {createCanvas}=require('canvas');
  const cv=createCanvas(936,504); const rafs=[];
  const mkc=()=>{const c=createCanvas(1,1);c.style={};c.addEventListener=()=>{};
    c.getBoundingClientRect=()=>({left:0,top:0,width:936,height:504});return c;};
  cv.style={};cv.addEventListener=()=>{};cv.getBoundingClientRect=()=>({left:0,top:0,width:936,height:504});
  const fake={connect(){return fake},start(){},stop(){},gain:{value:1,setValueAtTime(){},linearRampToValueAtTime(){}},
    frequency:{value:1,setValueAtTime(){},linearRampToValueAtTime(){}},type:'',buffer:null,loop:false,
    playbackRate:{value:1},getChannelData:()=>new Float32Array(4410),copyToChannel(){}};
  class AC{constructor(){this.state='running';this.sampleRate=44100;this.currentTime=0;this.destination=fake;}
    resume(){}createGain(){return Object.assign({},fake,{connect:()=>fake})}
    createOscillator(){return Object.assign({},fake,{connect:()=>fake})}
    createBufferSource(){return Object.assign({},fake,{connect:()=>fake})}
    createBuffer(c,l){return{getChannelData:()=>new Float32Array(l),length:l,copyToChannel(){}}}
    createBiquadFilter(){return Object.assign({},fake,{connect:()=>fake,frequency:{value:1,setValueAtTime(){}},Q:{value:1}})}
    createDynamicsCompressor(){return Object.assign({},fake,{connect:()=>fake,threshold:{value:0},knee:{value:0},ratio:{value:1},attack:{value:0},release:{value:0}})}}
  let T0=0;
  const sb={document:{getElementById:i=>i==='c'?cv:null,createElement:t=>t==='canvas'?mkc():{style:{},appendChild(){},addEventListener(){}},
      body:{appendChild(){},style:{}},addEventListener(){}},
    Image:require('canvas').Image, devicePixelRatio:2, innerWidth:936, innerHeight:504,
    addEventListener(){},removeEventListener(){},requestAnimationFrame:f=>{rafs.push(f);return 1},
    performance:{now:()=>T0}, AudioContext:AC, webkitAudioContext:AC,
    Math,JSON,Date,Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,
    String,Number,Boolean,Set,Map,isNaN,parseInt,parseFloat,navigator:{maxTouchPoints:0,userAgent:'node'},
    setTimeout:(f,t)=>0, matchMedia:()=>({matches:false,addListener(){}}),
    console:{log:(...a)=>log.push(['log',a+'']),warn:(...a)=>log.push(['warn',a+'']),
             error:(...a)=>log.push(['error',a+'']),info:(...a)=>log.push(['info',a+''])}};
  sb.window=sb;sb.globalThis=sb;sb.self=sb;
  // Path2D vekili
  const P2=require('./goruntu.js');
  vm.createContext(sb);
  sb.Path2D=eval('('+fs.readFileSync('goruntu.js','utf8').match(/class Path2D \{[\s\S]*?\n\}/)[0]+')');
  vm.runInContext(kod,sb,{filename:'index.html'});
  for(let i=0;i<600;i++){T0=i*16.7;const f=rafs.pop();rafs.length=0;f(T0);}
}catch(e){hata.push(e.message);}
console.log('  atilan hata :', hata.length?hata.join(' | '):'YOK');
console.log('  konsol ciktisi:', log.length?JSON.stringify(log.slice(0,5)):'YOK (temiz)');
