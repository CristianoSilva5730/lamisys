
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Helper function to run git commands
 * @param {string} command - Git command to run
 * @param {string[]} args - Arguments for the command
 * @returns {object} - Result of the command
 */
function runGitCommand(command, args = []) {
  console.log(`Running: git ${command} ${args.join(' ')}`);
  return spawnSync('git', [command, ...args], { 
    stdio: 'inherit',
    encoding: 'utf-8'
  });
}

/**
 * Initializes a git repository if it doesn't exist
 */
function initializeRepo() {
  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    console.log('Initializing Git repository...');
    runGitCommand('init');
    console.log('Git repository initialized.');
  } else {
    console.log('Git repository already exists.');
  }
}

/**
 * Adds files to git staging
 * @param {string[]} files - List of files to add
 */
function addFiles(files = ['.']) {
  console.log('Adding files to Git...');
  runGitCommand('add', files);
}

/**
 * Creates a commit with the given message
 * @param {string} message - Commit message
 */
function commit(message = 'Update project files') {
  console.log('Creating commit...');
  runGitCommand('commit', ['-m', message]);
}

/**
 * Sets up remote repository if needed
 * @param {string} name - Remote name
 * @param {string} url - Remote URL
 */
function setupRemote(name = 'origin', url) {
  if (url) {
    console.log(`Setting up remote ${name}...`);
    runGitCommand('remote', ['add', name, url]);
  }
}

/**
 * Pushes changes to remote repository
 * @param {string} remote - Remote name
 * @param {string} branch - Branch name
 */
function pushChanges(remote = 'origin', branch = 'main') {
  console.log(`Pushing changes to ${remote}/${branch}...`);
  runGitCommand('push', ['-u', remote, branch]);
}

/**
 * Performs a full sync operation
 */
function syncProject() {
  initializeRepo();

  // Create .gitignore if it doesn't exist
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    console.log('Creating .gitignore file...');
    fs.writeFileSync(gitignorePath, `
node_modules
dist
.env
*.log
.DS_Store
    `.trim());
  }

  addFiles();
  
  const commitMessage = process.argv[2] || 'Update project files';
  commit(commitMessage);
  
  console.log('\nGit sync completed locally.');
  console.log('\nTo push to a remote repository, run:');
  console.log('node src/git-sync.js push <remote-url> [branch-name]');
}

/**
 * Push to remote if requested
 */
function handlePush() {
  if (process.argv[2] === 'push') {
    const remoteUrl = process.argv[3];
    const branchName = process.argv[4] || 'main';
    
    if (!remoteUrl) {
      console.error('Error: Remote URL is required for push operation.');
      console.log('Usage: node src/git-sync.js push <remote-url> [branch-name]');
      process.exit(1);
    }
    
    setupRemote('origin', remoteUrl);
    pushChanges('origin', branchName);
    console.log('\nPush completed.');
  } else {
    syncProject();
  }
}

// Execute the script
handlePush();
