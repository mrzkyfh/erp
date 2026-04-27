/**
 * Script untuk verifikasi routes backend
 * Jalankan: node verify-routes.js
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

console.log('🔍 Verifikasi Routes Backend\n');

async function checkFile(path, description) {
  try {
    await readFile(path, 'utf-8');
    console.log(`✅ ${description}: ${path}`);
    return true;
  } catch (error) {
    console.log(`❌ ${description}: ${path} - NOT FOUND`);
    return false;
  }
}

async function checkImport(filePath, importName) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const hasImport = content.includes(importName);
    if (hasImport) {
      console.log(`✅ Import "${importName}" ditemukan di ${filePath}`);
    } else {
      console.log(`❌ Import "${importName}" TIDAK ditemukan di ${filePath}`);
    }
    return hasImport;
  } catch (error) {
    console.log(`❌ Tidak bisa membaca ${filePath}`);
    return false;
  }
}

async function checkRouteRegistration(filePath, routePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const hasRoute = content.includes(`"${routePath}"`);
    if (hasRoute) {
      console.log(`✅ Route "${routePath}" terdaftar di ${filePath}`);
    } else {
      console.log(`❌ Route "${routePath}" TIDAK terdaftar di ${filePath}`);
    }
    return hasRoute;
  } catch (error) {
    console.log(`❌ Tidak bisa membaca ${filePath}`);
    return false;
  }
}

async function listRouteFiles() {
  try {
    const files = await readdir('./src/routes');
    console.log('\n📁 File di src/routes/:');
    files.forEach(file => {
      console.log(`   - ${file}`);
    });
    return files;
  } catch (error) {
    console.log('❌ Tidak bisa membaca folder src/routes');
    return [];
  }
}

async function main() {
  console.log('1️⃣ Cek File Penting\n');
  
  await checkFile('./src/index.js', 'Server entry point');
  await checkFile('./src/app.js', 'App initialization');
  await checkFile('./src/routes/index.js', 'Main router');
  await checkFile('./src/routes/business-settings-routes.js', 'Settings routes');
  
  console.log('\n2️⃣ Cek Import Statements\n');
  
  await checkImport('./src/routes/index.js', 'businessSettingsRoutes');
  await checkImport('./src/routes/index.js', './business-settings-routes.js');
  
  console.log('\n3️⃣ Cek Route Registration\n');
  
  await checkRouteRegistration('./src/routes/index.js', '/settings');
  await checkRouteRegistration('./src/app.js', '/api');
  
  console.log('\n4️⃣ List Semua Route Files\n');
  
  const files = await listRouteFiles();
  
  console.log('\n5️⃣ Kesimpulan\n');
  
  const hasSettingsFile = files.includes('business-settings-routes.js');
  
  if (hasSettingsFile) {
    console.log('✅ File business-settings-routes.js ADA');
    console.log('✅ Setup routes sudah benar');
    console.log('\n💡 Jika endpoint masih 404 setelah deploy:');
    console.log('   1. Deploy ulang: npm run deploy');
    console.log('   2. Tunggu 30 detik');
    console.log('   3. Test: curl https://your-backend-url/api/settings');
  } else {
    console.log('❌ File business-settings-routes.js TIDAK ADA');
    console.log('\n💡 Solusi:');
    console.log('   1. Pastikan file sudah di-commit dan push');
    console.log('   2. Pull latest code: git pull origin main');
    console.log('   3. Cek lagi: node verify-routes.js');
  }
  
  console.log('\n📊 Endpoint yang Seharusnya Tersedia:\n');
  console.log('   GET  /api/settings          - Get business settings');
  console.log('   PUT  /api/settings          - Update settings (owner only)');
  console.log('   GET  /api/employees         - List employees');
  console.log('   GET  /api/attendance        - List attendance');
  console.log('   GET  /api/payroll           - List payroll');
  console.log('   GET  /api/inventory         - List inventory');
  console.log('   GET  /api/customers         - List customers');
  console.log('   GET  /api/dashboard         - Dashboard stats');
  console.log('   POST /api/auth/login        - Login');
  console.log('   POST /api/auth/register     - Register');
}

main().catch(console.error);
