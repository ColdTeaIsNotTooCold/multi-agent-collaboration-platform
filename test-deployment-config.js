#!/usr/bin/env node

/**
 * Deployment Configuration Validation Script
 * This script validates all deployment configuration files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      log(`✓ ${description} exists`, 'green');
      return true;
    } else {
      log(`✗ ${description} missing`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Error checking ${description}: ${error.message}`, 'red');
    return false;
  }
}

function checkFileContent(filePath, requiredContent, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasRequiredContent = requiredContent.some(item => content.includes(item));

    if (hasRequiredContent) {
      log(`✓ ${description} has required content`, 'green');
      return true;
    } else {
      log(`✗ ${description} missing required content`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Error checking ${description}: ${error.message}`, 'red');
    return false;
  }
}

function validateJsonFile(filePath, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    log(`✓ ${description} is valid JSON`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${description} is invalid JSON: ${error.message}`, 'red');
    return false;
  }
}

function checkDirectoryExists(dirPath, description) {
  try {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      log(`✓ ${description} directory exists`, 'green');
      return true;
    } else {
      log(`✗ ${description} directory missing`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Error checking ${description}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Starting deployment configuration validation...\n', 'blue');

  let allChecksPassed = true;
  const results = [];

  // Check Docker files
  log('📦 Checking Docker configuration...', 'magenta');

  const dockerFiles = [
    { path: 'Dockerfile', desc: 'Backend Dockerfile' },
    { path: 'Dockerfile.dev', desc: 'Backend development Dockerfile' },
    { path: 'frontend/Dockerfile', desc: 'Frontend Dockerfile' },
    { path: 'frontend/Dockerfile.dev', desc: 'Frontend development Dockerfile' }
  ];

  dockerFiles.forEach(({ path, desc }) => {
    const result = checkFileExists(path, desc);
    results.push({ check: desc, passed: result });
    if (!result) allChecksPassed = false;
  });

  // Check Docker Compose files
  log('\n🐳 Checking Docker Compose configuration...', 'magenta');

  const composeFiles = [
    { path: 'docker-compose.yml', desc: 'Main docker-compose file' },
    { path: 'docker-compose.dev.yml', desc: 'Development docker-compose file' },
    { path: 'docker-compose.monitoring.yml', desc: 'Monitoring docker-compose file' }
  ];

  composeFiles.forEach(({ path, desc }) => {
    const result = checkFileExists(path, desc);
    if (result) {
      // Check for required services
      const requiredServices = ['postgres', 'backend', 'frontend'];
      const contentResult = checkFileContent(path, requiredServices, desc);
      results.push({ check: desc, passed: contentResult });
      if (!contentResult) allChecksPassed = false;
    } else {
      results.push({ check: desc, passed: false });
      allChecksPassed = false;
    }
  });

  // Check deployment scripts
  log('\n📜 Checking deployment scripts...', 'magenta');

  const deployScript = checkFileExists('deploy.sh', 'Deployment script');
  results.push({ check: 'Deployment script', passed: deployScript });
  if (!deployScript) allChecksPassed = false;

  // Check environment files
  log('\n🔧 Checking environment configuration...', 'magenta');

  const envFiles = [
    { path: '.env.example', desc: 'Environment example file' },
    { path: '.env.production', desc: 'Production environment file' }
  ];

  envFiles.forEach(({ path, desc }) => {
    const result = checkFileExists(path, desc);
    results.push({ check: desc, passed: result });
    if (!result) allChecksPassed = false;
  });

  // Check configuration files
  log('\n⚙️  Checking configuration files...', 'magenta');

  const configFiles = [
    { path: 'nginx.conf', desc: 'Nginx configuration' },
    { path: 'monitoring/prometheus.yml', desc: 'Prometheus configuration' }
  ];

  configFiles.forEach(({ path, desc }) => {
    const result = checkFileExists(path, desc);
    results.push({ check: desc, passed: result });
    if (!result) allChecksPassed = false;
  });

  // Check documentation
  log('\n📚 Checking documentation...', 'magenta');

  const docFiles = [
    { path: 'DEPLOYMENT.md', desc: 'Deployment documentation' },
    { path: 'API.md', desc: 'API documentation' },
    { path: 'CONTRIBUTING.md', desc: 'Contributing guide' }
  ];

  docFiles.forEach(({ path, desc }) => {
    const result = checkFileExists(path, desc);
    results.push({ check: desc, passed: result });
    if (!result) allChecksPassed = false;
  });

  // Check package.json files
  log('\n📦 Checking package.json files...', 'magenta');

  const packageJsonValid = validateJsonFile('package.json', 'Backend package.json');
  results.push({ check: 'Backend package.json', passed: packageJsonValid });
  if (!packageJsonValid) allChecksPassed = false;

  const frontendPackageJsonValid = validateJsonFile('frontend/package.json', 'Frontend package.json');
  results.push({ check: 'Frontend package.json', passed: frontendPackageJsonValid });
  if (!frontendPackageJsonValid) allChecksPassed = false;

  // Check Prisma configuration
  log('\n🗄️  Checking database configuration...', 'magenta');

  const prismaDir = checkDirectoryExists('prisma', 'Prisma directory');
  results.push({ check: 'Prisma directory', passed: prismaDir });
  if (!prismaDir) allChecksPassed = false;

  // Check source code structure
  log('\n📂 Checking source code structure...', 'magenta');

  const srcDir = checkDirectoryExists('src', 'Backend source directory');
  results.push({ check: 'Backend source directory', passed: srcDir });
  if (!srcDir) allChecksPassed = false;

  const frontendSrcDir = checkDirectoryExists('frontend/src', 'Frontend source directory');
  results.push({ check: 'Frontend source directory', passed: frontendSrcDir });
  if (!frontendSrcDir) allChecksPassed = false;

  // Summary
  log('\n📊 Validation Summary', 'blue');
  log('==================', 'blue');

  const passedChecks = results.filter(r => r.passed).length;
  const totalChecks = results.length;

  results.forEach(({ check, passed }) => {
    const status = passed ? '✓' : '✗';
    const color = passed ? 'green' : 'red';
    log(`${status} ${check}`, color);
  });

  log(`\nResult: ${passedChecks}/${totalChecks} checks passed`, allChecksPassed ? 'green' : 'red');

  if (allChecksPassed) {
    log('\n🎉 All deployment configuration files are valid!', 'green');
    log('\nNext steps:', 'blue');
    log('1. Install Docker and Docker Compose', 'blue');
    log('2. Copy .env.example to .env and configure your environment', 'blue');
    log('3. Run: docker-compose -f docker-compose.dev.yml up -d', 'blue');
    log('4. Access the application at http://localhost:3001', 'blue');
    log('\nFor production deployment:', 'blue');
    log('1. Configure .env.production with your production values', 'blue');
    log('2. Run: ./deploy.sh deploy', 'blue');
  } else {
    log('\n❌ Some configuration files are missing or invalid', 'red');
    log('Please fix the issues above before proceeding with deployment', 'red');
  }

  process.exit(allChecksPassed ? 0 : 1);
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  log(`\n💥 Uncaught exception: ${error.message}`, 'red');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`\n💥 Unhandled rejection at: ${promise}, reason: ${reason}`, 'red');
  process.exit(1);
});

main();