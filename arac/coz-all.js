/* coz-all.js — 21 bolumun 18'inin SCRIPTLI cozumu.
   Her biri amaclanan cozumu tus tus oynar ve cikisa ulasildigini dogrular.
   Motorda bir sey degistirdiysen ONCE bunu kosur. Iki motor hatasi bununla
   bulundu (dikey momentum, zemin portali giris payi) — oynayarak degil.
   Kullanim: node arac/coz-all.js ../rainwormhole.html
   Cozumu olmayanlar: 6 (kup), 8 (hendek), 21 (final). */
const {coz}=require('./cozum.js');
const F=process.argv[2]||'../rainwormhole.html';
let ok=true;
ok&=coz(F,0,[['aim',60,300],['fire',1],['aim',500,72],['fire',0],['wait',70],['key','d',20],['wait',10]],{ad:'1 temel'});
ok&=coz(F,1,[['aim',612,204],['fire',0],['aim',4,238],['fire',1],['key','a',40],['wait',20],['key','a',34],['wait',15]],{ad:'2 iki duvar'});
ok&=coz(F,2,[['key','a',2],['aim',120,44],['fire',0],['aim',420,300],['fire',1],['wait',70],['key','d',14],['wait',15]],{ad:'3 arkani don'});
ok&=coz(F,3,[['key','d',10],['key','a',2],['aim',12,70],['fire',0],['aim',110,290],['fire',1],['key','d',14],['key','a',4],['wait',60],['wait',30]],{ad:'4 yatay momentum'});
ok&=coz(F,4,[
  ['key','a',2],['aim',300,300],['fire',1],['aim',222,44],['fire',0],['wait',75],
  ['key','a',30],['wait',10],['key','d',1],['wait',6],
  ['aim',410,191],['fire',0],                       // B seridi (16,8) ustu — cols 16-19
  ['aim',121,300],['fire',1],
  ['key','a',9],['wait',12],['key','d',60],['wait',30],['key','d',20],['wait',20],
],{ad:'5 kuyu'});
ok&=coz(F,6,[['aim',60,300],['fire',1],['aim',456,44],['fire',0],['wait',70],['wait',20]],{ad:'7 prizma'});
ok&=coz(F,8,[
  ['key','d',24],['keys',{d:1,w:1},14],['wait',20],['aim',180,300],['fire',1],
  ['key','a',34],['wait',14],['aim',100,18],['fire',0],
  ['waitfor',G=>G.foes.length===0,700],['check',G=>G.foes.length===0,'karartı batmadi'],
  ['aim',60,300],['fire',1,'kill'],['key','d',10],['keys',{d:1,w:1},16],['key','d',110],['wait',20],
],{ad:'9 karartı'});
ok&=coz(F,9,[
  ['key','d',16],['key','a',1],['aim',104,300],['fire',1],
  ['key','a',40],['wait',40],['key','d',60],['wait',6],['aim',324,22],['fire',0],
  ['waitfor',G=>G.foes.length===0,140],['check',G=>G.foes.length===0,'ors karartıyi ezmedi'],
  ['key','d',30],['keys',{d:1,w:1},18],['key','d',100],['wait',20],
],{ad:'10 ors'});
ok&=coz(F,10,[
  ['aim',492,310],['fire',1],['aim',492,5],['fire',0],
  ['waitfor',G=>G.P.vy>12,150],['waitfor',G=>G.P.vy>0&&G.P.y+G.P.h>190&&G.P.y+G.P.h<270,150],
  ['aim',600,72],['fire',0],['wait',80],['wait',40],
],{ad:'11 firlatma'});
ok&=coz(F,11,[
  ['key','a',2],['aim',10,156],['fire',0],['aim',612,228],['fire',1],
  ['check',G=>G.rOn===1,'R yanmadi'],['check',G=>G.gateOn,'kapi acilmadi'],
  ['key','a',180],['wait',20],
],{ad:'12 lazer hedef'});
ok&=coz(F,12,[
  ['key','d',60],['key','a',2],['pos'],
  ['aim',612,228],['fire',1],['aim',12,120],['fire',0],
  ['waitfor',G=>G.foes.length===0,30],['check',G=>G.foes.length===0,'karartı yanmadi'],
  ['key','d',80],['wait',6],['pos'],
  ['aim',420,20],['fire',0],['aim',440,300],['fire',1],   // ONCE boynuz: eski cikis portali (0,5) hala acik, zemin portali onunla eslesirdi
  ['wait',80],['pos'],['key','d',30],['wait',20],
],{ad:'13 lazer karartı'});
ok&=coz(F,13,[
  ['key','d',70],['pos'],
  ['aim',12,228],['fire',1],['aim',564,20],['fire',0],
  ['check',G=>G.rOn===1,'R yanmadi'],
  ['key','d',170],['wait',10],
],{ad:'14 lazer tavan'});
ok&=coz(F,14,[
  ['key','d',36],['grab'],['check',G=>!!G.carried,'kup alinmadi'],['pos'],
  ['key','a',1],['aim',128,300],['fire',1],['pos'],
  ['key','d',1],['aim',444,20],['fire',0],['pos'],
  ['grab'],['waitfor',G=>G.gateOn,120],['check',G=>G.gateOn,'kup dugmeye oturmadi'],
  ['key','d',60],['keys',{d:1,w:1},14],['key','d',120],['keys',{d:1,w:1},14],['key','d',80],['wait',10],
],{ad:'15 prizma+kup'});
ok&=coz(F,15,[
  ['key','a',1],['pos'],
  ['aim',132,300],['fire',1],['pos'],
  ['key','d',1],['aim',612,180],['fire',0],['pos'],
  ['key','d',14],['wait',90],['pos'],['wait',30],
],{ad:'16 yumusak inis'});
ok&=coz(F,16,[
  ['key','d',20],['grab'],['check',G=>!!G.carried,'kup alinmadi'],
  ['key','d',190],['wait',10],
],{ad:'17 kalkan'});
ok&=coz(F,17,[
  ['key','d',30],['key','a',1],['pos'],['check',G=>G.gateOn,'dugme basili degil'],
  ['aim',12,110],['fire',0],['aim',612,228],['fire',1],
  ['check',G=>G.rOn===1,'R yanmadi'],
  ['key','d',40],['pos'],['check',G=>G.gateOn,'mandal tutmadi: dugmeden inince kapi kapandi'],
  ['key','d',160],['wait',10],
],{ad:'18 mandal'});
ok&=coz(F,18,[
  ['key','a',3],['pos'],
  ['aim',12,60],['fire',0],            // sola bak: ust hedef boynuz
  ['key','d',1],['aim',24,252],['fire',1],   // saga don: alt hedef arkada-asagida, kuyruk bosluktan gecer
  ['check',G=>G.rOn===1,'R yanmadi'],
  ['key','d',210],['wait',10],
],{ad:'19 tek duvar'});
ok&=coz(F,19,[
  ['key','d',16],['key','a',1],['aim',104,300],['fire',1],
  ['key','a',40],['wait',40],['key','d',40],['wait',6],['pos'],
  ['aim',492,22],['fire',0],['wait',80],['pos'],
  ['check',G=>G.lz.length&&G.lz[0][2]>460,'ors isini kesmedi'],
  ['key','d',24],['keys',{d:1,w:1},18],['key','d',130],['wait',10],
],{ad:'20 ors kalkan'});
console.log(ok?'\nHEPSI COZULDU':'\nEKSIK VAR');
process.exit(ok?0:1);
