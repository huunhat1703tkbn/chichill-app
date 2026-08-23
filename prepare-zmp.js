import fs from 'fs';
import path from 'path';

const distPath = path.resolve(process.cwd(), 'dist');
const assetsPath = path.join(distPath, 'assets');

let listCSS = [];
let listSyncJS = [];
let listAsyncJS = [];

if (fs.existsSync(assetsPath)) {
  const files = fs.readdirSync(assetsPath);
  for (const file of files) {
    if (file.endsWith('.css')) {
      listCSS.push(`assets/${file}`);
    } else if (file.endsWith('.js')) {
      if (file.startsWith('index') || file.startsWith('app')) {
        listSyncJS.push(`assets/${file}`);
      } else {
        listAsyncJS.push(`assets/${file}`);
      }
    }
  }
}

// Fallback if listSyncJS is empty but there are js files
if (listSyncJS.length === 0 && listAsyncJS.length > 0) {
  listSyncJS = [listAsyncJS.shift()];
}

const config = {
  app: {
    title: "ChiChill AI",
    headerTitle: "ChiChill - Quản lý Chi tiêu",
    headerColor: "#059669",
    textColor: "white",
    statusBar: "transparent",
    leftButton: "none"
  },
  listCSS,
  listSyncJS,
  listAsyncJS,
  pages: [
    "pages/index"
  ]
};

// Write to root and dist
fs.writeFileSync(path.join(distPath, 'app-config.json'), JSON.stringify(config, null, 2));
fs.writeFileSync(path.resolve(process.cwd(), 'app-config.json'), JSON.stringify(config, null, 2));

console.log('✅ Generated app-config.json for ZMP with assets:');
console.log('  listCSS:', listCSS);
console.log('  listSyncJS:', listSyncJS);
console.log('  listAsyncJS:', listAsyncJS);
