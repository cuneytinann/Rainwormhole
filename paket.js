/* paket.js — yeniden kuruldu: kaynak HTML -> terser -> roadroller -> kabuk -> zip
   Tek dogru boyut sayisi budur. Kullanim: node paket.js kaynak.html [cikti.zip] */
const fs=require('fs'), cp=require('child_process');

async function build(src, zipOut, opts={}){
  const html=fs.readFileSync(src,'utf8');
  const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const {minify}=require('terser');
  const r=await minify(js,{
    ecma:2020, toplevel:true,
    compress:{passes:3, drop_console:true},
    mangle:{toplevel:true},
    format:{comments:/ZzFX|Frank Force|MIT/}
  });
  if(r.error) throw r.error;
  const {Packer}=await import('roadroller');
  const packer=new Packer([{data:r.code,type:'js',action:'eval'}],{});
  await packer.optimize(opts.level===undefined?2:opts.level);
  const packed=packer.makeDecoder();
  const shell='<!DOCTYPE html><meta charset=utf-8>'+
    '<meta name=viewport content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">'+
    '<title>Rainwormhole</title><link rel=icon href=data:,>'+
    '<style>html,body{margin:0;height:100%;background:#0d0f1a;overflow:hidden;overscroll-behavior:none;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}'+
    'canvas{display:block;cursor:crosshair;touch-action:none}'+
    '.tb{position:fixed;display:flex;align-items:center;justify-content:center;background:#ffffff12;border:1.5px solid #ffffff38;border-radius:16px;color:#cfd6ee;font:26px sans-serif;z-index:9;touch-action:none}'+
    '.tb:active{background:#ffffff29}</style>'+
    '<canvas id=c></canvas><script>'+packed.firstLine+packed.secondLine+'</script>';
  const dir=fs.mkdtempSync('/tmp/pk');
  fs.writeFileSync(dir+'/index.html',shell);
  const zf=zipOut||(dir+'/out.zip');
  try{fs.unlinkSync(zf)}catch(e){}
  cp.execSync(`cd ${dir} && zip -9 -X -q out.zip index.html`);
  if(zipOut) fs.copyFileSync(dir+'/out.zip',zipOut);
  const zs=fs.statSync(dir+'/out.zip').size;
  return {terser:r.code.length, html:shell.length, zip:zs};
}
if(require.main===module){
  build(process.argv[2],process.argv[3]).then(o=>{
    console.log(`terser : ${o.terser}`);
    console.log(`index  : ${o.html}`);
    console.log(`ZIP    : ${o.zip} / 13312  ·  %${(o.zip/13312*100).toFixed(1)}  ·  kalan ${13312-o.zip}`);
  }).catch(e=>{console.error(e);process.exit(1)});
}
module.exports={build};
