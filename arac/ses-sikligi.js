/* ses-sikligi.js — kac ses, saniyede kac kez. Kosarken olcer. */
const {run}=require('./goruntu.js');
const G=run('olc-ses.html',1,3,'/tmp/s.png','spawn');
const x0=G.P.x,y0=G.P.y; G.keys.d=1;
const N=600;                       // 10 saniye
for(let i=0;i<N;i++){G.frame();G.P.x=x0;G.P.y=y0;}
const log=G.SB.__S||[];
const c={};for(const [n] of log)c[n]=(c[n]||0)+1;
console.log('10 saniye kosu:');
for(const [n,v] of Object.entries(c).sort((a,b)=>b[1]-a[1]))
  console.log('  '+n.padEnd(8)+String(v).padStart(4)+'  ->  '+(v/(N/60)).toFixed(1)+' /sn');
