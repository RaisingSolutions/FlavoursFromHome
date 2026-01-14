const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function createTestOrder() {
  try {
    // Get a product first
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price')
      .limit(1)
      .single();

    if (!products) {
      console.log('❌ No products found. Add products first!');
      return;
    }

    console.log('📦 Using product:', products.name);

    // Create order for Leeds
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        first_name: 'Test Customer',
        email: 'test@example.com',
        phone_number: '07700900000',
        address: 'LS1 1AA, Leeds Test Street',
        payment_method: 'ONLINE',
        total_amount: products.price * 2,
        location: 'Leeds',
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Order creation failed:', orderError);
      return;
    }

    console.log('✅ Order created:', order.id);

    // Create order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: products.id,
        quantity: 2,
        price: products.price
      });

    if (itemsError) {
      console.error('❌ Order items creation failed:', itemsError);
      return;
    }

    console.log('✅ Test order created successfully!');
    console.log('📍 Location: Leeds');
    console.log('🆔 Order ID:', order.id);
    console.log('💰 Total:', `£${order.total_amount}`);
    console.log('\n👉 Check Leeds admin dashboard to see this order!');
    console.log('👉 Derby and Sheffield admins should NOT see it!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestOrder();
