/* sadece drawUnicorn maliyetini olcer: N kare, ms/kare */
const {run}=require('./goruntu.js');
const f=process.argv[2], N=+(process.argv[3]||200);
const G=run(f,+(process.env.LV||0),3,'/tmp/x.png','spawn');
// isinma
for(let i=0;i<30;i++)G.frame();
const t0=process.hrtime.bigint();
for(let i=0;i<N;i++)G.frame();
const t1=process.hrtime.bigint();
console.log(f.padEnd(20), (Number(t1-t0)/1e6/N).toFixed(2)+' ms/kare');
