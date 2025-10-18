const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, '../dist/server');

// Read all .cjs files and fix require statements
const files = fs.readdirSync(serverDir).filter(file => file.endsWith('.cjs'));

files.forEach(file => {
  const filePath = path.join(serverDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix relative requires to include .cjs extension
  content = content.replace(/require\("\.\/([^"]+)"\)/g, 'require("./$1.cjs")');
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed requires in ${file}`);
});
