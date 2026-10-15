#!/usr/bin/env node

/**
 * Deployment Readiness Checklist Script
 * 
 * This script validates the system against production readiness criteria
 * from walkthrough.md section 16.
 */

import { pool } from '../src/db/pool.js';
import fs from 'fs';
import path from 'path';

const checks = {
  security: [],
  database: [],
  configuration: [],
  testing: [],
  documentation: [],
};

let passedChecks = 0;
let totalChecks = 0;

function logCheck(category, name, passed, message = '') {
  totalChecks++;
  const status = passed ? '✓' : '✗';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m ${name}${message ? ': ' + message : ''}`);
  
  checks[category].push({ name, passed, message });
  
  if (passed) passedChecks++;
}

async function checkEnvironmentVariables() {
  console.log('\n=== Environment Configuration ===');
  
  const requiredVars = [
    'DATABASE_URL',
    'PASETO_V3_LOCAL_KEY_BASE64',
    'ACCESS_TOKEN_EXPIRY',
    'REFRESH_TOKEN_EXPIRY',
  ];

  for (const varName of requiredVars) {
    const exists = !!process.env[varName];
    logCheck('configuration', `Environment variable ${varName}`, exists);
  }

  // Check NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  logCheck('configuration', 'NODE_ENV is set', !!nodeEnv, nodeEnv);

  // Check PASETO key length
  if (process.env.PASETO_V3_LOCAL_KEY_BASE64) {
    try {
      const key = Buffer.from(process.env.PASETO_V3_LOCAL_KEY_BASE64, 'base64');
      logCheck('security', 'PASETO key is 32 bytes', key.length === 32, `${key.length} bytes`);
    } catch (e) {
      logCheck('security', 'PASETO key is valid base64', false, e.message);
    }
  }

  // Check for example/default values
  const hasDefaultKey = process.env.PASETO_V3_LOCAL_KEY_BASE64?.includes('replace_with');
  logCheck('security', 'PASETO key is not default value', !hasDefaultKey);
}

async function checkDatabaseConnection() {
  console.log('\n=== Database Checks ===');
  
  try {
    await pool.query('SELECT 1');
    logCheck('database', 'Database connection successful', true);
  } catch (error) {
    logCheck('database', 'Database connection successful', false, error.message);
    return;
  }

  // Check for required tables
  const requiredTables = [
    'users', 'user_roles', 'org_units', 'categories', 'assets',
    'issues', 'qr_tokens', 'audit_log', 'notifications',
  ];

  for (const table of requiredTables) {
    try {
      await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
      logCheck('database', `Table ${table} exists`, true);
    } catch (error) {
      logCheck('database', `Table ${table} exists`, false);
    }
  }

  // Check for indexes
  try {
    const { rows } = await pool.query(`
      SELECT tablename, indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public'
    `);
    logCheck('database', 'Database indexes created', rows.length > 0, `${rows.length} indexes`);
  } catch (error) {
    logCheck('database', 'Database indexes check', false, error.message);
  }
}

async function checkSecurityFeatures() {
  console.log('\n=== Security Features ===');
  
  // Check if .env is in .gitignore
  try {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      logCheck('security', '.env in .gitignore', gitignore.includes('.env'));
    } else {
      logCheck('security', '.gitignore exists', false);
    }
  } catch (error) {
    logCheck('security', '.gitignore check', false, error.message);
  }

  // Check for password hashing
  try {
    const argon2 = await import('argon2');
    logCheck('security', 'Argon2 library installed', !!argon2);
  } catch (error) {
    logCheck('security', 'Argon2 library installed', false);
  }

  // Check audit log has sensitive field redaction
  try {
    const auditService = await import('../src/shared/audit.service.js');
    logCheck('security', 'Audit service exists', !!auditService.createAuditLog);
  } catch (error) {
    logCheck('security', 'Audit service check', false);
  }
}

async function checkCodeQuality() {
  console.log('\n=== Code Quality ===');
  
  // Check for SQL parameterization
  const sqlFiles = [];
  function findSQLFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.')) {
        findSQLFiles(filePath);
      } else if (file.endsWith('.js') && !file.includes('test')) {
        sqlFiles.push(filePath);
      }
    });
  }

  try {
    findSQLFiles(path.join(process.cwd(), 'src'));
    
    let dangerousPatterns = 0;
    for (const file of sqlFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for string concatenation in SQL (potential injection)
      if (content.match(/pool\.query\([^)]*\+[^)]*\)/)) {
        dangerousPatterns++;
      }
      if (content.match(/pool\.query\([^)]*\$\{[^}]*\}[^)]*\)/)) {
        dangerousPatterns++;
      }
    }
    
    logCheck('security', 'No SQL string concatenation found', dangerousPatterns === 0, 
      dangerousPatterns > 0 ? `${dangerousPatterns} potential issues` : '');
  } catch (error) {
    logCheck('security', 'Code quality check', false, error.message);
  }

  // Check for .env.example
  const envExampleExists = fs.existsSync(path.join(process.cwd(), '.env.example'));
  logCheck('documentation', '.env.example exists', envExampleExists);

  // Check package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    logCheck('configuration', 'package.json has test script', !!packageJson.scripts?.test);
    logCheck('configuration', 'package.json has start script', !!packageJson.scripts?.start);
    logCheck('configuration', 'package.json has migration script', !!packageJson.scripts?.['db:migrate']);
  }
}

async function checkImplementedEndpoints() {
  console.log('\n=== Endpoint Implementation ===');
  
  const implementedModules = [
    'auth', 'users', 'org-units', 'categories', 'locations',
    'vendors', 'purchases', 'assets', 'issues', 'drop-boxes',
    'borrower-blocks', 'audit-log', 'reports', 'alerts', 'transfers'
  ];

  for (const module of implementedModules) {
    const modulePath = path.join(process.cwd(), 'src/modules', module, `${module}.routes.js`);
    const moduleUnderscorePath = path.join(process.cwd(), 'src/modules', module.replace(/-/g, '_'), `${module.replace(/-/g, '_')}.routes.js`);
    const authPath = path.join(process.cwd(), 'src/routes/auth.routes.js');
    
    const exists = fs.existsSync(modulePath) || fs.existsSync(moduleUnderscorePath) || (module === 'auth' && fs.existsSync(authPath));
    logCheck('testing', `${module} module routes`, exists);
  }
}

async function checkTests() {
  console.log('\n=== Testing Infrastructure ===');
  
  const testDir = path.join(process.cwd(), 'tests');
  logCheck('testing', 'Tests directory exists', fs.existsSync(testDir));

  if (fs.existsSync(testDir)) {
    const testFiles = fs.readdirSync(path.join(testDir, 'integration')).filter(f => f.endsWith('.test.js'));
    logCheck('testing', 'Integration tests exist', testFiles.length > 0, `${testFiles.length} test files`);
  }

  // Check test dependencies
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    logCheck('testing', 'vitest installed', !!packageJson.devDependencies?.vitest);
    logCheck('testing', 'supertest installed', !!packageJson.devDependencies?.supertest);
  }
}

async function printSummary() {
  console.log('\n=== Summary ===');
  console.log(`Passed: ${passedChecks}/${totalChecks} checks`);
  
  const percentage = (passedChecks / totalChecks * 100).toFixed(1);
  console.log(`Success Rate: ${percentage}%`);
  
  if (passedChecks === totalChecks) {
    console.log('\n✓ All checks passed! System is ready for deployment.');
    return 0;
  } else {
    console.log('\n✗ Some checks failed. Review the issues above before deployment.');
    
    console.log('\nFailed checks by category:');
    for (const [category, categoryChecks] of Object.entries(checks)) {
      const failed = categoryChecks.filter(c => !c.passed);
      if (failed.length > 0) {
        console.log(`\n${category}:`);
        failed.forEach(check => {
          console.log(`  - ${check.name}${check.message ? ': ' + check.message : ''}`);
        });
      }
    }
    
    return 1;
  }
}

async function main() {
  console.log('=================================================');
  console.log('  BERM Inventory - Deployment Readiness Check');
  console.log('=================================================');
  
  try {
    await checkEnvironmentVariables();
    await checkDatabaseConnection();
    await checkSecurityFeatures();
    await checkCodeQuality();
    await checkImplementedEndpoints();
    await checkTests();
    
    const exitCode = await printSummary();
    
    await pool.end();
    process.exit(exitCode);
  } catch (error) {
    console.error('\n\nFatal error during checks:', error.message);
    await pool.end();
    process.exit(1);
  }
}

// Run checks
main();
