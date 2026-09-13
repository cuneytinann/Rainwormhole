/* cozum.js — bir bolumu SCRIPTLE oynar, cikisa ulasiyor mu diye bakar.
   Bu "cozulebilir gorunuyor" ile "cozulebilir" arasindaki fark.
   DSL: ['key',k,n] ['aim',x,y] ['fire',0|1] ['jump'] ['grab'] ['wait',n] ['pos'] */
const fs=require('fs');const {run}=require('./goruntu.js');
function coz(dosya, lvl, adimlar, opts={}){
  const G=run(dosya,lvl,3,'/tmp/c.png','spawn');
  const iz=[], say=[0];
  const kare=n=>{for(let i=0;i<n;i++){G.frame();say[0]++;
    if(say[0]%15===0)iz.push([say[0],G.P.x+G.P.w/2|0,G.P.y+G.P.h|0,+G.P.vx.toFixed(1),+G.P.vy.toFixed(1)]);
    if(G.done)return true;}return false;};
  const sifirla=()=>{for(const k in G.keys)G.keys[k]=0;};
  let hata=null;
  for(const a of adimlar){
    if(G.done)break;
    const [op,p,q]=a;
    if(op==='key'){G.keys[p]=1;if(kare(q))break;G.keys[p]=0;}
    else if(op==='aim'){G.mx=p;G.my=q;if(kare(14))break;}
    else if(op==='fire'){
      const ok=p===0?G.hOK:G.tOK;
      if(!ok){hata=`ATIS SEKTOR DISI: ${p===0?'boynuz':'kuyruk'} @kare ${say[0]} (mx=${G.mx},my=${G.my}) face=${G.P.face}`;break;}
      G.fire(p); kare(2);
      const sonra=G.portals[p];
      if(q==='kill'){ if(sonra){hata=`PORTAL KOPMADI (kasitli iska bekleniyordu) @kare ${say[0]}`;break;} }
      else if(!sonra){hata=`PORTAL OLUSMADI: ${p===0?'boynuz':'kuyruk'} @kare ${say[0]} hedef(${G.mxv},${G.myv})`;break;}
    }
    else if(op==='jump'){G.keys.w=1;if(kare(6))break;G.keys.w=0;}
    else if(op==='keys'){for(const k in p)G.keys[k]=1;if(kare(q))break;for(const k in p)G.keys[k]=0;}
    else if(op==='waitfor'){   // ['waitfor', fn(G)=>bool, maxKare]
      let n=0;while(!p(G)&&n<q){if(kare(1))break;n++;} if(n>=q)hata='waitfor zaman asimi @'+say[0];}
    else if(op==='check'){ if(!p(G)){hata='KONTROL BASARISIZ: '+q+' @kare '+say[0];break;} }
    else if(op==='grab'){G.keys.e=1;kare(2);G.keys.e=0;kare(2);}
    else if(op==='wait'){if(kare(p))break;}
    else if(op==='pos'){console.log('   konum:',G.P.x+G.P.w/2|0,G.P.y+G.P.h|0,'face',G.P.face,'portals',G.portals.map(x=>x?`(${x.cx},${x.cy} n${x.nx},${x.ny})`:'-').join(' '));}
    sifirla();
  }
  if(!G.done&&!hata)kare(60);
  const tag=(opts.ad||dosya+'#'+lvl).padEnd(22);
  if(G.done)console.log(tag+'COZULDU  ✔  '+say[0]+' kare');
  else console.log(tag+'COZULEMEDI ✘  '+(hata||'')+'\n   son konum: '+(G.P.x+G.P.w/2|0)+','+(G.P.y+G.P.h|0)+'  iz: '+JSON.stringify(iz.slice(-6)));
  if(opts.png)fs.copyFileSync('/tmp/c.png',opts.png);
  return G.done;
}
module.exports={coz};
if(require.main===module){
  // kalibrasyon: bolum 1 bilinen cozum
  coz('v41.html',0,[
    ['aim',60,300],['fire',1],          // kuyruk: ayak altina, bulut zemin
    ['aim',500,72],['fire',0],          // boynuz: sag ustteki bulutun alti
    ['wait',70],['pos'],
    ['key','d',20],['wait',10],
  ],{ad:'B1 kalibrasyon'});
}
