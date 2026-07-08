const fs = require('fs');
const path = require('path');

const files = [
  'app/admin/utenti/page.tsx',
  'app/admin/components/AdminSidebar.tsx',
  'app/admin/gestione-admin/page.tsx',
  'app/admin/eventi/page.tsx',
  'app/admin/segnalazioni/page.tsx',
  'app/admin/page.tsx',
  'app/admin/login/page.tsx',
  'app/admin/sanzioni/page.tsx'
];

const replacements = [
  { search: /bg-zinc-950/g, replace: 'bg-[#12121a]' },
  { search: /bg-zinc-900\/50/g, replace: 'bg-[#1e1e24]' },
  { search: /bg-zinc-900/g, replace: 'bg-[#1e1e24]' },
  { search: /bg-zinc-800\/40/g, replace: 'bg-[#12121a]' },
  { search: /bg-zinc-800/g, replace: 'bg-[#2d2d3a]' },
  { search: /border-zinc-800\/80/g, replace: 'border-[#2d2d3a]' },
  { search: /border-zinc-800/g, replace: 'border-[#2d2d3a]' },
  { search: /border-zinc-700\/60/g, replace: 'border-[#2d2d3a]' },
  { search: /border-zinc-700/g, replace: 'border-[#3f3f50]' },
  { search: /text-zinc-400/g, replace: 'text-gray-400' },
  { search: /text-zinc-500/g, replace: 'text-gray-500' },
  { search: /bg-violet-650\/10/g, replace: 'bg-[#0ea5e9]/10' },
  { search: /bg-indigo-650\/10/g, replace: 'bg-[#0284c7]/10' },
  { search: /bg-gradient-to-br from-violet-500 to-indigo-600/g, replace: 'bg-gradient-to-br from-[#0ea5e9] to-[#0284c7]' },
  { search: /from-violet-500 to-indigo-600/g, replace: 'from-[#0ea5e9] to-[#0284c7]' },
  { search: /shadow-violet-600\/20/g, replace: 'shadow-[#0ea5e9]/20' },
  { search: /shadow-violet-600\/30/g, replace: 'shadow-[#0ea5e9]/30' },
  { search: /text-violet-400/g, replace: 'text-[#0ea5e9]' },
  { search: /hover:text-violet-300/g, replace: 'hover:text-[#38bdf8]' },
  { search: /bg-violet-600/g, replace: 'bg-[#0ea5e9]' },
  { search: /hover:bg-violet-750/g, replace: 'hover:bg-[#0284c7]' },
  { search: /hover:bg-violet-700/g, replace: 'hover:bg-[#0284c7]' },
  { search: /focus:ring-violet-500/g, replace: 'focus:ring-[#0ea5e9]' },
  { search: /text-violet-500/g, replace: 'text-[#0ea5e9]' },
  { search: /bg-violet-500/g, replace: 'bg-[#0ea5e9]' },
  { search: /bg-violet-500\/10/g, replace: 'bg-[#0ea5e9]/10' },
  { search: /text-violet-300/g, replace: 'text-[#38bdf8]' }
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
