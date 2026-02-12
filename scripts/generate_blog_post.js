#!/usr/bin/env node
const fs = require("fs");
const {execSync} = require("child_process");
const path = require("path");

function slugify(s){
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

const titles = [
  "Five Essential Gym Tools for Real Strength Gains",
  "Top Gym Gear That Actually Improves Strength",
  "Build Strength: The Minimal Equipment You Need",
  "Strength-First: Equipment Worth Investing In",
  "Gym Essentials: Tools That Drive Progress"
];

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

const title = pick(titles) + ' ('+ new Date().toLocaleTimeString()+')';
const date = new Date().toISOString().slice(0,10);
const slug = `${date}-${slugify(title)}`;
const filename = path.join(__dirname,'..','src','content','post', `${slug}.mdx`);

const content = `---\ntitle: "${title}"\nexcerpt: "A short, practical guide to the equipment that gives you the biggest strength returns."\nimage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGZpdG5lc3N8ZW58MHx8MHx8fDI%3D"\ncategory: Fitness\ntags: [\"strength training\",\"gym equipment\",\"home gym\"]\npublishDate: ${date}\nmetadata:\n  canonical: "https://www.workoutquestapp.com/${slug}"\n---\n\n## ${title}\n\nThis post was auto-generated to provide practical guidance on equipment selection for strength training. It is intended as a starter guide and includes references.\n\n### Key gear\n\n- Barbell and plates — central for heavy compound lifts.[^1]\n- Power rack — safety and versatility for heavy training.[^2]\n- Adjustable dumbbells — accessory and unilateral work.\n- Adjustable bench — pressing angles and support.\n- Kettlebell — dynamic power and conditioning.\n\n---\n\n[^1]: Healthline. \"Free weights vs machines\" — https://www.healthline.com/fitness/free-weights-vs-machines\n[^2]: ACE Fitness. \"Strength Training Equipment Guide\" — https://www.acefitness.org/education-and-resources/lifestyle/exercise-library/equipment/\n`;

fs.writeFileSync(filename, content);

try{
  execSync(`git add "${filename}"`);
  const authorName = process.env.GIT_AUTHOR_NAME || 'Workout Quest Bot';
  const authorEmail = process.env.GIT_AUTHOR_EMAIL || 'bot@workoutquest.local';
  execSync(`GIT_AUTHOR_NAME="${authorName}" GIT_AUTHOR_EMAIL="${authorEmail}" git commit -m "chore(blog): auto-generated post — ${title.replace(/\"/g,'')}"`);
  execSync('git push origin main');
  console.log('Pushed', filename);
}catch(e){
  console.error('Git error', e.message);
  process.exit(1);
}
