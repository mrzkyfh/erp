async function testAPI() {
  const baseUrl = 'http://localhost:4001/api';
  
  console.log('--- Testing Health Check ---');
  try {
    const res = await fetch(`${baseUrl}/health`);
    const health = await res.json();
    console.log('Health:', health);
  } catch (e) {
    console.error('Backend tidak terjangkau di port 4001:', e.message);
    return;
  }

  const res = await fetch(`${baseUrl}/inventory/latest-price/123-456`);
  console.log('Status Latest Price (Random ID):', res.status);
  const body = await res.json().catch(() => ({}));
  console.log('Body:', body);
}

testAPI();
