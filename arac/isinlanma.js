/* isinlanma.js — devir teslimdeki isinlanma tarayicisinin yeniden kurulusu.
   Her bolumde GECERLI her portal cifti icin oyuncuyu a'dan sokup b'den cikarir;
   cikista duvara gomulu mu / harita disi mi diye bakar. */
const {run}=require('./goruntu.js');
const T=24,W=624,H=336;
function tara(dosya,lvl){
  const G=run(dosya,lvl,3,'/tmp/t.png','spawn');
  const map=G.map, spots=[];
  for(let y=0;y<14;y++)for(let x=0;x<26;x++){
    if(map[y][x]!=='=')continue;
    for(const [nx,ny] of [[1,0],[-1,0],[0,1],[0,-1]])
      if(!G.isSolid(x+nx,y+ny))spots.push({cx:x,cy:y,nx,ny,px:x*T+T/2+nx*T/2,py:y*T+T/2+ny*T/2,warm:0,born:0});
  }
  let n=0,bad=0; const kot=[];
  for(const a of spots)for(const b of spots){
    if(a===b||Math.hypot(a.px-b.px,a.py-b.py)<T*0.85)continue;
    for(const t of [-10,0,10])for(const v of [2,8,16]){
      n++;
      G.portals[0]=a;G.portals[1]=b;
      const P=G.P;
      // yanal kayma t: yuzey boyunca (normalin dikine)
      P.x=a.px-a.nx*T*0.5+(-a.ny)*t-P.w/2; P.y=a.py-a.ny*T*0.5+(a.nx)*t-P.h/2;
      P.vx=-a.nx*v; P.vy=-a.ny*v; P.tp=0;
      G.bodyTeleport(P);
      const ic=P.x>=0&&P.x+P.w<=W&&P.y>=0&&P.y+P.h<=H;
      if(!ic||G.embedded(P)){bad++; if(kot.length<3)kot.push(`(${a.cx},${a.cy})${a.nx},${a.ny} -> (${b.cx},${b.cy})${b.nx},${b.ny} t=${t} v=${v}`);}
    }
  }
  G.portals[0]=G.portals[1]=null;
  return {spots:spots.length,n,bad,kot};
}
const dosya=process.argv[2], N=+(process.argv[3]||9);
let top=0,topBad=0;
for(let l=0;l<N;l++){const r=tara(dosya,l);top+=r.n;topBad+=r.bad;
  console.log('bolum '+(l+1)+':',String(r.spots).padStart(3),'yuzey,',String(r.n).padStart(6),'gecis,',r.bad?('KOTU '+r.bad+'  ornek: '+r.kot.join(' | ')):'temiz');}
console.log('TOPLAM',top,'gecis,',topBad,'kotu');
