import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSalaryTypes() {
  console.log('🔍 Checking salary_types...\n');
  
  const { data, error } = await supabase
    .from('salary_types')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  console.log('📊 Salary Types:');
  console.table(data);
  
  const lemburType = data.find(t => t.unit === 'per_jam_lembur');
  
  if (lemburType) {
    console.log('\n✅ Komponen lembur ditemukan:');
    console.log(`   Nama: ${lemburType.name}`);
    console.log(`   Unit: ${lemburType.unit}`);
    console.log(`   Amount: Rp${lemburType.amount.toLocaleString('id-ID')}`);
  } else {
    console.log('\n⚠️  Komponen lembur (per_jam_lembur) TIDAK ditemukan!');
    console.log('   Perlu menambahkan komponen "Upah Lembur" dengan unit per_jam_lembur');
  }
}

checkSalaryTypes();
