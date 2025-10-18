const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, '../dist/server');
const sharedDir = path.join(__dirname, '../dist/shared');

// First, rename shared .js files to .cjs
if (fs.existsSync(sharedDir)) {
  const sharedFiles = fs.readdirSync(sharedDir).filter(file => file.endsWith('.js'));
  sharedFiles.forEach(file => {
    const oldPath = path.join(sharedDir, file);
    const newPath = path.join(sharedDir, file.replace('.js', '.cjs'));
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed ${file} to ${file.replace('.js', '.cjs')}`);
  });
}

// Read all .cjs files and fix require statements
const files = fs.readdirSync(serverDir).filter(file => file.endsWith('.cjs'));

files.forEach(file => {
  const filePath = path.join(serverDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix relative requires to include .cjs extension
  content = content.replace(/require\("\.\/([^"]+)"\)/g, 'require("./$1.cjs")');
  
  // Fix @shared imports to use relative paths
  content = content.replace(/require\("@shared\/([^"]+)"\)/g, 'require("../shared/$1.cjs")');
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed requires in ${file}`);
});
