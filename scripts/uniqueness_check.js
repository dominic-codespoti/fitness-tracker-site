#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function trigrams(s){
  s = s.toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ');
  const out = new Set();
  for(let i=0;i+3<=s.length;i++) out.add(s.slice(i,i+3));
  return out;
}

function jaccard(a,b){
  const A = Array.from(a);
  const B = Array.from(b);
  const inter = A.filter(x=>b.has(x)).length;
  const uni = new Set([...A,...B]).size;
  return uni===0?0:inter/uni;
}

async function main(){
  const args = process.argv.slice(2);
  if(args.length<1){
    console.error('Usage: uniqueness_check.js <candidate-file>'); process.exit(2);
  }
  const candidatePath = args[0];
  if(!fs.existsSync(candidatePath)){ console.error('Candidate file not found'); process.exit(2); }
  const cand = fs.readFileSync(candidatePath,'utf8');
  const candTr = trigrams(cand);
  const postsDir = path.join('src','content','post');
  const files = fs.readdirSync(postsDir).filter(f=>f.endsWith('.mdx')||f.endsWith('.md')).filter(f=>!f.startsWith('drafts')).sort().reverse();
  const recent = files.slice(0,50);
  let maxSim=0; let maxFile=null;
  for(const f of recent){
    const p = path.join(postsDir,f);
    const txt = fs.readFileSync(p,'utf8');
    const sim = jaccard(candTr,trigrams(txt));
    if(sim>maxSim){ maxSim=sim; maxFile=f; }
  }
  console.log(JSON.stringify({maxSimilarity:maxSim,mostSimilar:maxFile}));
}

main().catch(e=>{console.error(e); process.exit(1);});
