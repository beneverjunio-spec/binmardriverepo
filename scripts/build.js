const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Starting Universal BinmarDrive Build ===');

// 1. Install frontend dependencies
console.log('Installing frontend dependencies...');
execSync('npm --prefix frontend install --include=dev', { stdio: 'inherit' });

// 2. Build frontend
console.log('Building frontend with Vite...');
execSync('npm --prefix frontend run build', { stdio: 'inherit' });

// 3. Ensure dist exists at root as well for Netlify root publishing
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const rootDist = path.join(__dirname, '..', 'dist');

if (fs.existsSync(frontendDist)) {
  console.log(`Copying build output to root dist directory...`);
  fs.cpSync(frontendDist, rootDist, { recursive: true });
}

console.log('=== BinmarDrive Universal Build Complete! ===');
