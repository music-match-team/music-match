const fs = require('fs');
const path = require('path');

const dir = 'app/admin';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = getFiles(dir);

const replacements = [
  // Colori generici
  { search: /text-zinc-100/g, replace: 'text-white' },
  { search: /text-zinc-200/g, replace: 'text-gray-200' },
  { search: /text-zinc-300/g, replace: 'text-gray-300' },
  { search: /text-zinc-400/g, replace: 'text-gray-400' },
  { search: /text-zinc-500/g, replace: 'text-gray-500' },
  
  // Sfondi
  { search: /bg-zinc-950\/50/g, replace: 'bg-[#12121a]/50' },
  { search: /bg-zinc-950/g, replace: 'bg-[#12121a]' },
  { search: /bg-zinc-900\/80/g, replace: 'bg-[#1e1e24]/80' },
  { search: /bg-zinc-900\/50/g, replace: 'bg-[#1e1e24]/50' },
  { search: /bg-zinc-900/g, replace: 'bg-[#1e1e24]' },
  { search: /bg-zinc-800\/60/g, replace: 'bg-[#2d2d3a]/60' },
  { search: /bg-zinc-800\/50/g, replace: 'bg-[#2d2d3a]/50' },
  { search: /bg-zinc-800\/40/g, replace: 'bg-[#2d2d3a]/40' },
  { search: /bg-zinc-800\/30/g, replace: 'bg-[#2d2d3a]/30' },
  { search: /bg-zinc-800/g, replace: 'bg-[#2d2d3a]' },
  { search: /bg-zinc-700\/50/g, replace: 'bg-[#3f3f50]/50' },
  { search: /bg-zinc-700/g, replace: 'bg-[#3f3f50]' },
  { search: /hover:bg-zinc-800\/50/g, replace: 'hover:bg-[#2d2d3a]/50' },
  { search: /hover:bg-zinc-800/g, replace: 'hover:bg-[#2d2d3a]' },
  { search: /hover:bg-zinc-700/g, replace: 'hover:bg-[#3f3f50]' },

  // Bordi
  { search: /border-zinc-800\/80/g, replace: 'border-[#2d2d3a]/80' },
  { search: /border-zinc-800\/50/g, replace: 'border-[#2d2d3a]/50' },
  { search: /border-zinc-800/g, replace: 'border-[#2d2d3a]' },
  { search: /border-zinc-700\/60/g, replace: 'border-[#3f3f50]/60' },
  { search: /border-zinc-700/g, replace: 'border-[#3f3f50]' },

  // Colori primari / accenti (viola -> ciano)
  { search: /from-violet-600\/20/g, replace: 'from-[#0ea5e9]/20' },
  { search: /to-violet-700\/10/g, replace: 'to-[#0284c7]/10' },
  { search: /border-violet-700\/40/g, replace: 'border-[#0ea5e9]/40' },
  { search: /border-violet-600\/40/g, replace: 'border-[#0ea5e9]/40' },
  { search: /text-violet-400/g, replace: 'text-[#0ea5e9]' },
  { search: /bg-violet-600\/10/g, replace: 'bg-[#0ea5e9]/10' },
  { search: /bg-violet-600/g, replace: 'bg-[#0ea5e9]' },
  { search: /hover:bg-violet-700/g, replace: 'hover:bg-[#0284c7]' },
  { search: /ring-violet-500\/20/g, replace: 'ring-[#0ea5e9]/20' },
  { search: /text-violet-300/g, replace: 'text-[#38bdf8]' },
  { search: /text-violet-500/g, replace: 'text-[#0ea5e9]' },
  { search: /bg-violet-500\/10/g, replace: 'bg-[#0ea5e9]/10' },
  { search: /bg-violet-500\/20/g, replace: 'bg-[#0ea5e9]/20' },
  { search: /bg-violet-500/g, replace: 'bg-[#0ea5e9]' },
  { search: /from-violet-500/g, replace: 'from-[#0ea5e9]' },
  { search: /to-indigo-600/g, replace: 'to-[#0284c7]' },
  { search: /shadow-violet-600\/20/g, replace: 'shadow-[#0ea5e9]/20' },
  { search: /bg-violet-650\/10/g, replace: 'bg-[#0ea5e9]/10' },
  { search: /bg-indigo-650\/10/g, replace: 'bg-[#0284c7]/10' }
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(({ search, replace }) => {
      content = content.replace(search, replace);
    });
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
