const {run}=require('./goruntu.js');
function olc(kosu,yonTut,zipTut){
  const G=run('/tmp/zip.html',0,3,'/tmp/z.png','spawn');
  for(let i=0;i<5;i++)G.frame();
  if(kosu){G.keys.d=1;for(let i=0;i<40;i++)G.frame();}
  const x0=G.P.x+G.P.w/2, y0=G.P.y+G.P.h; G.keys.w=1; G.keys.d=yonTut?1:0;
  let apex=999,inis=-1,xin=0;
  for(let i=0;i<80;i++){G.frame(); if(i==2&&!zipTut)G.keys.w=0;
    const f=G.P.y+G.P.h; apex=Math.min(apex,f);
    if(i>5&&Math.abs(f-y0)<0.6&&G.P.vy>=0){inis=i;xin=G.P.x+G.P.w/2;break;}}
  return 'yatay '+((xin-x0)/24).toFixed(1)+' karo, tepe '+((y0-apex)/24).toFixed(2)+' karo, '+inis+' kare';
}
console.log('duran,   ziplamayi birak        :',olc(0,0,0));
console.log('duran,   ziplamayi tut          :',olc(0,0,1));
console.log('kosarak, yonu birak, zip tut    :',olc(1,0,1));
console.log('kosarak, yon tut,   zip tut     :',olc(1,1,1));
console.log('kosarak, yon tut,   zip birak   :',olc(1,1,0));
