import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function testPurchase() {
  console.log('--- Mencari data Supplier & Item ---')
  const { data: supplier } = await supabase.from('suppliers').select('id').limit(1).single()
  const { data: item } = await supabase.from('inventory_items').select('id').limit(1).single()
  const { data: profile } = await supabase.from('profiles').select('id').limit(1).single()

  if (!supplier || !item || !profile) {
    console.error('Data supplier/item/profile tidak cukup untuk testing.')
    return
  }

  console.log('Supplier ID:', supplier.id)
  console.log('Item ID:', item.id)
  console.log('Profile ID:', profile.id)

  console.log('\n--- Mencoba Create Purchase via Database (Simulasi Service) ---')
  
  const payload = {
    supplier_id: supplier.id,
    item_id: item.id,
    qty: 5,
    unit_price: 1000,
    date: new Date().toISOString().split('T')[0]
  }

  const totalAmount = Number(payload.qty) * Number(payload.unit_price || 0);

  const { data: purchase, error: purchaseError } = await supabase
    .from("stock_purchases")
    .insert({
      supplier_id: payload.supplier_id,
      date: payload.date,
      total_amount: totalAmount,
      status: "confirmed",
      created_by: profile.id,
    })
    .select("*")
    .single();

  if (purchaseError) {
    console.error('Error saat insert stock_purchases:', purchaseError)
    return
  }

  console.log('Success insert stock_purchases, ID:', purchase.id)

  const { error: itemError } = await supabase.from("stock_purchase_items").insert({
    purchase_id: purchase.id,
    item_id: payload.item_id,
    qty: payload.qty,
    unit_price: payload.unit_price,
  });

  if (itemError) {
    console.error('Error saat insert stock_purchase_items:', itemError)
  } else {
    console.log('Success insert stock_purchase_items')
  }
}

testPurchase()
