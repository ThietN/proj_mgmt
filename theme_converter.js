const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components'];

const replacements = [
    { from: /className="dark"/g, to: 'className="light"' },
    { from: /bg-\[#0a0a0f\]/g, to: 'bg-slate-50' },
    { from: /bg-\[#111122\]/g, to: 'bg-white' },
    { from: /bg-\[#0d0d1a\]/g, to: 'bg-slate-50' },
    { from: /border-\[#1a1a2e\]/g, to: 'border-slate-200' },
    { from: /border-\[#252540\]/g, to: 'border-slate-300' },
    { from: /bg-\[#1a1a2e\]/g, to: 'bg-slate-100' },
    { from: /text-slate-100/g, to: 'text-slate-900' },
    { from: /text-white/g, to: 'text-slate-900' },
    { from: /text-slate-200/g, to: 'text-slate-800' },
    { from: /text-slate-300/g, to: 'text-slate-700' },
    { from: /text-slate-400/g, to: 'text-slate-500' },
    { from: /text-slate-500/g, to: 'text-slate-500' },
    { from: /hover:bg-white\/2/g, to: 'hover:bg-slate-100' },
    { from: /bg-white\/2/g, to: 'bg-slate-100' },
    { from: /hover:bg-white\/5/g, to: 'hover:bg-slate-200' },
    { from: /hover:text-slate-200/g, to: 'hover:text-slate-900' },
    { from: /indigo-400/g, to: 'blue-600' },
    { from: /indigo-500/g, to: 'blue-600' },
    { from: /indigo-600/g, to: 'blue-700' },
    { from: /violet-400/g, to: 'sky-600' },
    { from: /violet-500/g, to: 'sky-500' },
    { from: /violet-600/g, to: 'sky-600' },
    { from: /cyan-400/g, to: 'cyan-600' },
    { from: /cyan-500/g, to: 'cyan-500' },
    { from: /text-slate-600/g, to: 'text-slate-400' },
    { from: /border-white\/10/g, to: 'border-slate-300' },
    { from: /text-emerald-400/g, to: 'text-emerald-600' },
    { from: /text-amber-400/g, to: 'text-amber-600' },
    { from: /text-red-400/g, to: 'text-red-600' },
    { from: /bg-emerald-500\/10/g, to: 'bg-emerald-50' },
    { from: /bg-amber-500\/10/g, to: 'bg-amber-50' },
    { from: /bg-red-500\/10/g, to: 'bg-red-50' },
    { from: /border-emerald-500\/20/g, to: 'border-emerald-200' },
    { from: /border-amber-500\/20/g, to: 'border-amber-200' },
    { from: /border-red-500\/20/g, to: 'border-red-200' },
    { from: /border-blue-500\/20/g, to: 'border-blue-200' },
    { from: /bg-blue-500\/10/g, to: 'bg-blue-50' },
    { from: /border-sky-500\/20/g, to: 'border-sky-200' },
    { from: /bg-sky-500\/10/g, to: 'bg-sky-50' },
    { from: /border-cyan-500\/20/g, to: 'border-cyan-200' },
    { from: /bg-cyan-500\/10/g, to: 'bg-cyan-50' },
    { from: /divide-\[#1a1a2e\]/g, to: 'divide-slate-200' },
    { from: /divide-white\/10/g, to: 'divide-slate-200' },
];

// Special cases: wait, some buttons that were solid blue should keep white text.
// Example: bg-blue-600 text-white
// After our replace, they will be bg-blue-600 text-slate-900.
// We can fix this by a post-process replace:
const postReplacements = [
    { from: /bg-blue-600 text-slate-900/g, to: 'bg-blue-600 text-white' },
    { from: /bg-blue-700 text-slate-900/g, to: 'bg-blue-700 text-white' },
];

function processDir(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            replacements.forEach(r => {
                content = content.replace(r.from, r.to);
            });
            postReplacements.forEach(r => {
                content = content.replace(r.from, r.to);
            });
            fs.writeFileSync(fullPath, content);
            console.log(`Updated ${fullPath}`);
        }
    }
}

dirs.forEach(d => {
    const target = path.join(__dirname, d);
    if (fs.existsSync(target)) processDir(target);
});
