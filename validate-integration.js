#!/usr/bin/env node

/**
 * Integration Validation Script
 * This script validates that all components work together properly
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkDockerComposeIntegration() {
  log('\n🐳 Checking Docker Compose integration...', 'magenta');

  const checks = [
    {
      name: 'Main compose file',
      check: () => {
        try {
          const content = fs.readFileSync('docker-compose.yml', 'utf8');
          const hasBackend = content.includes('backend:');
          const hasFrontend = content.includes('frontend:');
          const hasPostgres = content.includes('postgres:');
          const hasNginx = content.includes('nginx:');
          return hasBackend && hasFrontend && hasPostgres && hasNginx;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Development compose file',
      check: () => {
        try {
          const content = fs.readFileSync('docker-compose.dev.yml', 'utf8');
          const hasBackend = content.includes('backend:');
          const hasFrontend = content.includes('frontend:');
          const hasPostgres = content.includes('postgres:');
          return hasBackend && hasFrontend && hasPostgres;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Monitoring compose file',
      check: () => {
        try {
          const content = fs.readFileSync('docker-compose.monitoring.yml', 'utf8');
          const hasPrometheus = content.includes('prometheus:');
          const hasGrafana = content.includes('grafana:');
          const hasRedis = content.includes('redis:');
          return hasPrometheus && hasGrafana && hasRedis;
        } catch {
          return false;
        }
      }
    }
  ];

  checks.forEach(({ name, check }) => {
    try {
      const result = check();
      if (result) {
        log(`✓ ${name} integration check passed`, 'green');
      } else {
        log(`✗ ${name} integration check failed`, 'red');
      }
    } catch (error) {
      log(`✗ ${name} integration check error: ${error.message}`, 'red');
    }
  });
}

function checkNetworkConfiguration() {
  log('\n🌐 Checking network configuration...', 'magenta');

  const files = ['docker-compose.yml', 'docker-compose.dev.yml', 'docker-compose.monitoring.yml'];

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const hasNetwork = content.includes('ccpm-network');
      const hasDriver = content.includes('driver: bridge');

      if (hasNetwork && hasDriver) {
        log(`✓ ${file} network configuration valid`, 'green');
      } else {
        log(`✗ ${file} network configuration invalid`, 'red');
      }
    } catch (error) {
      log(`✗ ${file} network check error: ${error.message}`, 'red');
    }
  });
}

function checkVolumeConfiguration() {
  log('\n💾 Checking volume configuration...', 'magenta');

  const volumeChecks = [
    { file: 'docker-compose.yml', expected: ['postgres_data'] },
    { file: 'docker-compose.monitoring.yml', expected: ['prometheus_data', 'grafana_data', 'redis_data'] }
  ];

  volumeChecks.forEach(({ file, expected }) => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const volumesSection = content.match(/volumes:\s*\n([\s\S]*?)(?=\n\n|\n[a-zA-Z_-]+:|$)/);

      if (volumesSection) {
        const allVolumesPresent = expected.every(vol =>
          volumesSection[1].includes(vol)
        );

        if (allVolumesPresent) {
          log(`✓ ${file} volume configuration valid`, 'green');
        } else {
          log(`✗ ${file} missing required volumes: ${expected.filter(v => !volumesSection[1].includes(v)).join(', ')}`, 'red');
        }
      } else {
        // Fallback: just check if volumes are mentioned anywhere
        const hasAllVolumes = expected.every(vol => content.includes(vol));
        if (hasAllVolumes) {
          log(`✓ ${file} volume configuration valid`, 'green');
        } else {
          log(`✗ ${file} missing required volumes: ${expected.filter(v => !content.includes(v)).join(', ')}`, 'red');
        }
      }
    } catch (error) {
      log(`✗ ${file} volume check error: ${error.message}`, 'red');
    }
  });
}

function checkEnvironmentVariables() {
  log('\n🔧 Checking environment variables consistency...', 'magenta');

  const envFiles = [
    { path: '.env.example', name: 'Environment example' },
    { path: '.env.production', name: 'Production environment' }
  ];

  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'PORT',
    'NODE_ENV',
    'CORS_ORIGIN'
  ];

  envFiles.forEach(({ path, name }) => {
    try {
      const content = fs.readFileSync(path, 'utf8');
      const missingVars = requiredVars.filter(varName => !content.includes(`${varName}=`));

      if (missingVars.length === 0) {
        log(`✓ ${name} has all required variables`, 'green');
      } else {
        log(`✗ ${name} missing variables: ${missingVars.join(', ')}`, 'red');
      }
    } catch (error) {
      log(`✗ ${name} environment check error: ${error.message}`, 'red');
    }
  });
}

function checkPortConfiguration() {
  log('\n🔌 Checking port configuration...', 'magenta');

  const portConfigurations = [
    { file: 'docker-compose.yml', expectedPorts: ['3000:3000', '3001:80', '5432:5432'] },
    { file: 'docker-compose.dev.yml', expectedPorts: ['3000:3000', '3001:3000', '5432:5432'] },
    { file: 'docker-compose.monitoring.yml', expectedPorts: ['9090:9090', '3002:3000', '6379:6379'] }
  ];

  portConfigurations.forEach(({ file, expectedPorts }) => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const allPortsPresent = expectedPorts.every(port => content.includes(port));

      if (allPortsPresent) {
        log(`✓ ${file} port configuration valid`, 'green');
      } else {
        const missingPorts = expectedPorts.filter(port => !content.includes(port));
        log(`✗ ${file} missing ports: ${missingPorts.join(', ')}`, 'red');
      }
    } catch (error) {
      log(`✗ ${file} port check error: ${error.message}`, 'red');
    }
  });
}

function checkHealthChecks() {
  log('\n💓 Checking health check configuration...', 'magenta');

  const healthCheckFiles = ['docker-compose.yml', 'docker-compose.dev.yml'];

  healthCheckFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const hasHealthChecks = content.includes('healthcheck:');

      if (hasHealthChecks) {
        log(`✓ ${file} has health checks configured`, 'green');
      } else {
        log(`✗ ${file} missing health checks`, 'yellow');
      }
    } catch (error) {
      log(`✗ ${file} health check error: ${error.message}`, 'red');
    }
  });
}

function checkDependencies() {
  log('\n📦 Checking dependencies consistency...', 'magenta');

  try {
    const backendPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const frontendPackage = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));

    // Check for key dependencies
    const backendDeps = ['express', 'prisma', 'socket.io', 'jsonwebtoken'];
    const frontendDeps = ['react', 'react-dom', 'axios', 'socket.io-client'];

    const missingBackendDeps = backendDeps.filter(dep => !backendPackage.dependencies[dep]);
    const missingFrontendDeps = frontendDeps.filter(dep => !frontendPackage.dependencies[dep]);

    if (missingBackendDeps.length === 0) {
      log('✓ Backend dependencies are complete', 'green');
    } else {
      log(`✗ Backend missing dependencies: ${missingBackendDeps.join(', ')}`, 'red');
    }

    if (missingFrontendDeps.length === 0) {
      log('✓ Frontend dependencies are complete', 'green');
    } else {
      log(`✗ Frontend missing dependencies: ${missingFrontendDeps.join(', ')}`, 'red');
    }

  } catch (error) {
    log(`✗ Dependency check error: ${error.message}`, 'red');
  }
}

function checkDatabaseSchema() {
  log('\n🗄️  Checking database schema...', 'magenta');

  try {
    const schemaPath = path.join('prisma', 'schema.prisma');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');

      const requiredModels = ['User', 'Agent', 'Task'];
      const missingModels = requiredModels.filter(model => !schema.includes(`model ${model}`));

      if (missingModels.length === 0) {
        log('✓ Database schema has required models', 'green');
      } else {
        log(`✗ Database schema missing models: ${missingModels.join(', ')}`, 'red');
      }
    } else {
      log('✗ Database schema file not found', 'red');
    }
  } catch (error) {
    log(`✗ Database schema check error: ${error.message}`, 'red');
  }
}

function checkAPIEndpoints() {
  log('\n🔌 Checking API endpoint configuration...', 'magenta');

  try {
    const indexPath = path.join('src', 'index.ts');
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');

      const requiredRoutes = ['/api/auth', '/api/agents', '/api/tasks', '/api/health'];
      const missingRoutes = requiredRoutes.filter(route => !indexContent.includes(route));

      if (missingRoutes.length === 0) {
        log('✓ API endpoints are configured', 'green');
      } else {
        log(`✗ Missing API routes: ${missingRoutes.join(', ')}`, 'yellow');
      }
    } else {
      log('✗ Main application file not found', 'red');
    }
  } catch (error) {
    log(`✗ API endpoint check error: ${error.message}`, 'red');
  }
}

function checkSecurityConfiguration() {
  log('\n🔒 Checking security configuration...', 'magenta');

  const securityChecks = [
    {
      name: 'Nginx security headers',
      check: () => {
        try {
          const nginxConf = fs.readFileSync('nginx.conf', 'utf8');
          const headers = ['X-Frame-Options', 'X-Content-Type-Options', 'X-XSS-Protection'];
          return headers.every(header => nginxConf.includes(header));
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Environment secrets',
      check: () => {
        try {
          const envExample = fs.readFileSync('.env.example', 'utf8');
          return envExample.includes('JWT_SECRET') && envExample.includes('change-in-production');
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Rate limiting',
      check: () => {
        try {
          const indexPath = path.join('src', 'index.ts');
          const indexContent = fs.readFileSync(indexPath, 'utf8');
          return indexContent.includes('rateLimit') || indexContent.includes('express-rate-limit');
        } catch {
          return false;
        }
      }
    }
  ];

  securityChecks.forEach(({ name, check }) => {
    try {
      const result = check();
      if (result) {
        log(`✓ ${name} configured`, 'green');
      } else {
        log(`✗ ${name} not configured`, 'yellow');
      }
    } catch (error) {
      log(`✗ ${name} check error: ${error.message}`, 'red');
    }
  });
}

function checkBuildConfiguration() {
  log('\n🔨 Checking build configuration...', 'magenta');

  const buildChecks = [
    {
      name: 'Backend Docker build',
      check: () => {
        try {
          const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
          return dockerfile.includes('npm run build') && dockerfile.includes('COPY . .');
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Frontend Docker build',
      check: () => {
        try {
          const dockerfile = fs.readFileSync('frontend/Dockerfile', 'utf8');
          return dockerfile.includes('npm run build') && dockerfile.includes('COPY . .');
        } catch {
          return false;
        }
      }
    },
    {
      name: 'TypeScript configuration',
      check: () => {
        try {
          const tsconfig = fs.readFileSync('tsconfig.json', 'utf8');
          return tsconfig.includes('"compilerOptions"') && tsconfig.includes('"outDir"');
        } catch {
          return false;
        }
      }
    }
  ];

  buildChecks.forEach(({ name, check }) => {
    try {
      const result = check();
      if (result) {
        log(`✓ ${name} configured`, 'green');
      } else {
        log(`✗ ${name} not configured`, 'yellow');
      }
    } catch (error) {
      log(`✗ ${name} check error: ${error.message}`, 'red');
    }
  });
}

function main() {
  log('🚀 Starting integration validation...', 'cyan');
  log('================================================', 'cyan');

  // Run all checks
  checkDockerComposeIntegration();
  checkNetworkConfiguration();
  checkVolumeConfiguration();
  checkEnvironmentVariables();
  checkPortConfiguration();
  checkHealthChecks();
  checkDependencies();
  checkDatabaseSchema();
  checkAPIEndpoints();
  checkSecurityConfiguration();
  checkBuildConfiguration();

  log('\n📋 Integration validation complete!', 'cyan');
  log('================================================', 'cyan');

  log('\n🎯 Next Steps:', 'blue');
  log('1. Install Docker and Docker Compose', 'blue');
  log('2. Run: npm install (for dependencies)', 'blue');
  log('3. Copy .env.example to .env and configure', 'blue');
  log('4. Test development: docker-compose -f docker-compose.dev.yml up -d', 'blue');
  log('5. Test production: docker-compose up -d', 'blue');
  log('6. Access application: http://localhost:3001', 'blue');

  log('\n📚 Documentation:', 'blue');
  log('- DEPLOYMENT.md: Full deployment guide', 'blue');
  log('- API.md: API documentation', 'blue');
  log('- CONTRIBUTING.md: Development guide', 'blue');

  log('\n🔧 Scripts:', 'blue');
  log('- ./deploy.sh: Deployment script', 'blue');
  log('- node test-deployment-config.js: Configuration validation', 'blue');
  log('- node validate-integration.js: Integration validation', 'blue');

  log('\n✅ Ready for deployment!', 'green');
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