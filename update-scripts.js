
#!/usr/bin/env node

// Run this script to update the package.json with the correct scripts
require('./src/update-package.js');

// Make git sync script executable (Unix systems only)
const fs = require('fs');
const path = require('path');
const gitSyncPath = path.join(__dirname, 'src', 'git-sync.js');

try {
  fs.chmodSync(gitSyncPath, '755');
  console.log('Made git-sync.js executable');
} catch (error) {
  console.log('Note: On Windows, you may need to run scripts directly with node');
}

console.log('\nYou can now run the following commands:');
console.log('- npm run git:sync (commit all changes locally)');
console.log('- npm run git:push <remote-url> [branch-name] (push to remote)');
