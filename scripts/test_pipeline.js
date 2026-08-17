import http from 'http';

const BASE_URL = 'http://127.0.0.1:3001';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('🧪 BẮT ĐẦU CHẠY BỘ TEST TỰ ĐỘNG (INTERACTIVE BUTTONS & FORM SUBMIT)...');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: OAuth Token Status API
    console.log('\n--- 1. Test OAuth Token Status API ---');
    const tokenRes = await makeRequest('GET', '/api/token/status');
    assert(tokenRes.status === 200, 'GET /api/token/status trả về 200 OK');
    assert(tokenRes.body.success === true, 'Response body.success === true');

    // Test 2: Button "Lấy thông tin tài khoản" (Get Profile API)
    console.log('\n--- 2. Test Button: Lấy thông tin tài khoản (GET_USER_PROFILE_API) ---');
    const profileRes = await makeRequest('POST', '/api/simulate/send-user-msg', { text: 'Lấy thông tin tài khoản' });
    assert(profileRes.body.analysis.intent === 'GET_USER_PROFILE_API', 'Intent nhận diện đúng GET_USER_PROFILE_API');
    assert(profileRes.body.replyPayload.message.text.includes('Hội Viên VIP Gold'), 'Nội dung trả lời chứa cấp độ hội viên');

    // Test 3: Button "Cung cấp SĐT & Địa chỉ" (Zalo Form Submit API)
    console.log('\n--- 3. Test Button & Form: Cung cấp info cho API (SUBMIT_FORM_DATA_API) ---');
    const formData = {
      name: "Trần Văn Nam",
      phone: "0912 345 678",
      address: "456 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM",
      notes: "Gửi gấp trong hôm nay"
    };
    const formRes = await makeRequest('POST', '/api/simulate/send-user-msg', { text: 'Submit Form', formData });
    assert(formRes.body.analysis.intent === 'SUBMIT_FORM_DATA_API', 'Intent nhận diện đúng SUBMIT_FORM_DATA_API');
    assert(formRes.body.analysis.entities.phone === '0912 345 678', 'API tiếp nhận chuẩn SĐT 0912 345 678');
    assert(formRes.body.replyPayload.message.text.includes('Ticket ID'), 'Trả về mã Ticket ID xác nhận');

    // Test 4: Button "Lấy vị trí kho" (Get Location Info API)
    console.log('\n--- 4. Test Button: Lấy vị trí kho (GET_LOCATION_INFO_API) ---');
    const locationRes = await makeRequest('POST', '/api/simulate/send-user-msg', { text: 'Lấy vị trí kho' });
    assert(locationRes.body.analysis.intent === 'GET_LOCATION_INFO_API', 'Intent nhận diện đúng GET_LOCATION_INFO_API');
    assert(locationRes.body.replyPayload.message.attachment.payload.elements[0].buttons.length > 0, 'Trả về Nút chỉ đường Google Maps & Gọi Hotline');

    // Test 5: Button "Gửi voucher ZALO50K" (Verify Voucher API)
    console.log('\n--- 5. Test Button: Xác thực mã Voucher (VERIFY_VOUCHER_API) ---');
    const voucherRes = await makeRequest('POST', '/api/simulate/send-user-msg', { text: 'Gửi voucher ZALO50K' });
    assert(voucherRes.body.analysis.intent === 'VERIFY_VOUCHER_API', 'Intent nhận diện đúng VERIFY_VOUCHER_API');
    assert(voucherRes.body.replyPayload.message.text.includes('50.000đ'), 'Xác thực voucher giảm 50.000đ thành công');

    console.log(`\n==================================================`);
    console.log(`📊 TỔNG KẾT KẾT QUẢ TEST INTERACTIVE BUTTONS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Lỗi khi chạy bộ test:', err);
    process.exit(1);
  }
}

runAllTests();
