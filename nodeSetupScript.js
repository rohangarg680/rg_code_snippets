const { execSync } = require('child_process');

function checkNVM() {
  try {
    execSync('command -v nvm');
    console.log('NVM is already installed.');
    return true;
  } catch (error) {
    console.log('NVM is not installed.');
    return false;
  }
}

function checkNode() {
  try {
    execSync('command -v node');
    console.log('Node.js is already installed.');
    return true;
  } catch (error) {
    console.log('Node.js is not installed.');
    return false;
  }
}

function installNVM() {
  console.log('Installing NVM...');
  execSync('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash');
  console.log('NVM installed successfully.');
}

function installNode() {
  console.log('Installing Node.js...');
  execSync('nvm install node');
  console.log('Node.js installed successfully.');
}

if (!checkNVM()) {
  installNVM();
}

if (!checkNode()) {
  installNode();
}

