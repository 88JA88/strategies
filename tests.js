globalThis.window=globalThis;
await import('./engine.js');
const A=BlueSecurityGame.analyse;
const close=(a,b)=>Math.abs(a-b)<1e-9;
console.assert(A([[3,1],[2,2]]).type==='pure','Point-selle attendu');
let r=A([[4,-3],[-6,6]]);
console.assert(r.type==='mixed'&&close(r.p,12/19)&&close(r.q,9/19),'Mélange asymétrique attendu');
console.assert(close(r.value,6/19),'Valeur attendue');
console.log('Point-selle : OK\nMélange minimax : OK');
