// ==========================================
// KimiShop - Payment System
// ==========================================

function processPayment() {
  const paymentMethod = document.querySelector('input[name="payment"]:checked');
  if (!paymentMethod) {
    showToast('Pilih metode pembayaran', 'error');
    return;
  }
  
  const method = paymentMethod.value;
  const shippingData = {
    name: document.querySelector('#shippingForm [name="name"]').value,
    phone: document.querySelector('#shippingForm [name="phone"]').value,
    address: document.querySelector('#shippingForm [name="address"]').value,
    province: document.querySelector('#provinceSelect option:checked').text,
    city: document.querySelector('#citySelect option:checked').text,
    postal: document.querySelector('#shippingForm [name="postal"]').value
  };
  
  // Show processing
  const confirmationBox = document.getElementById('confirmationBox');
  confirmationBox.innerHTML = `
        <div class="confirmation-icon">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
        <h3>Memproses Pembayaran...</h3>
        <p>Mohon tunggu sebentar</p>
    `;
  
  nextStep(3);
  
  // Simulate processing
  setTimeout(() => {
    const orderNumber = generateOrderNumber();
    
    // Handle different payment methods
    let paymentInstructions = '';
    
    switch (method) {
      case 'transfer_bca':
      case 'transfer_bni':
        const bank = method === 'transfer_bca' ? 'BCA' : 'BNI';
        const vaNumber = generateVirtualAccount(bank);
        paymentInstructions = `
                    <div style="background: var(--light); padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <p style="margin-bottom: 12px; font-size: 14px;">Nomor Virtual Account ${bank}:</p>
                        <div style="font-size: 28px; font-weight: 700; letter-spacing: 2px; font-family: monospace; color: var(--primary);">
                            ${vaNumber}
                        </div>
                        <p style="margin-top: 12px; font-size: 13px; color: var(--gray);">
                            Berlaku sampai: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <p style="font-size: 14px; color: var(--gray); margin-bottom: 16px;">
                        Transfer sesuai nominal ke nomor VA di atas. Pesanan akan diproses setelah pembayaran dikonfirmasi.
                    </p>
                `;
        break;
        
      case 'credit_card':
        paymentInstructions = `
                    <p style="margin: 20px 0; color: var(--gray);">
                        Anda akan diarahkan ke halaman pembayaran aman untuk memasukkan detail kartu kredit.
                    </p>
                    button onclick="simulate3DS()" class="btn-track">Simulasi Pembayaran</button>
                `;
        break;
        
      case 'gopay':
      case 'ovo':
        const wallet = method === 'gopay' ? 'GoPay' : 'OVO';
        paymentInstructions = `
                    <div style="margin: 20px 0;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=KIMISHOP${orderNumber}" 
                             alt="QR Code" style="border-radius: 12px; border: 2px solid var(--border);">
                    </div>
                    <p style="font-size: 14px; color: var(--gray); margin-bottom: 16px;">
                        Buka aplikasi ${wallet} dan scan kode QR di atas untuk menyelesaikan pembayaran.
                    </p>
                `;
        break;
        
      case 'cod':
        paymentInstructions = `
                    <p style="margin: 20px 0; color: var(--gray);">
                        Pembayaran tunai saat barang diterima. Pastikan Anda siap dengan uang pas.
                    </p>
                `;
        break;
    }
    
    confirmationBox.className = 'confirmation-box success';
    confirmationBox.innerHTML = `
            <div class="confirmation-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Pesanan Berhasil Dibuat!</h3>
            <p>Nomor Pesanan:</p>
            <div class="order-number-display">${orderNumber}</div>
            ${paymentInstructions}
            <div style="margin-top: 24px;">
                <button onclick="trackOrder()" class="btn-track">
                    <i class="fas fa-map-marker-alt"></i> Lacak Pesanan
                </button>
                <button onclick="closeModal('checkout'); resetAfterOrder()" class="btn-continue-shopping">
                    Lanjut Belanja
                </button>
            </div>
        `;
    
    // Clear cart
    AppState.cart = [];
    saveCart();
    updateCartUI();
    
  }, 2000);
}

function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${dateStr}-${random}`;
}

function generateVirtualAccount(bank) {
  const prefix = bank === 'BCA' ? '888' : '009';
  const random = Math.floor(Math.random() * 9000000000) + 1000000000;
  return prefix + random;
}

function simulate3DS() {
  showToast('Pembayaran berhasil dikonfirmasi!', 'success');
  setTimeout(() => {
    closeModal('checkout');
    resetAfterOrder();
  }, 1500);
}

function resetAfterOrder() {
  // Reset checkout form
  document.getElementById('shippingForm').reset();
  document.getElementById('citySelect').innerHTML = '<option value="">Pilih Kota</option>';
}