// ==========================================
// KimiShop - Cart & Wishlist System
// ==========================================

// Cart Functions
function addToCart(productId, quantity = 1, variants = {}) {
    const product = AppState.products.find(p => p.id === productId) || AppState.currentProduct;
    
    if (!product) {
        showToast('Produk tidak ditemukan', 'error');
        return;
    }
    
    if (product.stock < quantity) {
        showToast('Stok tidak mencukupi', 'error');
        return;
    }
    
    // Check if item with same variants exists
    const existingItemIndex = AppState.cart.findIndex(item => 
        item.id === productId && 
        JSON.stringify(item.variants) === JSON.stringify(variants)
    );
    
    if (existingItemIndex > -1) {
        const existingItem = AppState.cart[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        if (newQuantity > product.stock) {
            showToast(`Stok tidak mencukupi. Maksimal ${product.stock} unit`, 'error');
            return;
        }
        
        existingItem.quantity = newQuantity;
        showToast(`Jumlah ${product.name} diperbarui di keranjang`);
    } else {
        AppState.cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            variants: variants,
            vendor_id: product.vendor_id,
            vendor_name: product.vendor_name,
            added_at: new Date().toISOString()
        });
        showToast(`${product.name} ditambahkan ke keranjang`);
    }
    
    saveCart();
    updateCartUI();
    
    // Animate cart icon
    const cartIcon = document.querySelector('.fa-shopping-cart').parentElement;
    cartIcon.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
    }, 300);
}

function removeFromCart(index) {
    const item = AppState.cart[index];
    AppState.cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showToast(`${item.name} dihapus dari keranjang`);
}

function updateCartQuantity(index, delta) {
    const item = AppState.cart[index];
    const product = AppState.products.find(p => p.id === item.id);
    const newQty = item.quantity + delta;
    
    if (newQty < 1) {
        removeFromCart(index);
        return;
    }
    
    if (product && newQty > product.stock) {
        showToast(`Stok maksimal: ${product.stock} unit`, 'error');
        return;
    }
    
    item.quantity = newQty;
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('kimishop_cart', JSON.stringify(AppState.cart));
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cartCount) cartCount.textContent = totalItems;
    if (cartTotal) cartTotal.textContent = `Rp ${formatPrice(totalPrice)}`;
    
    if (cartItems) {
        if (AppState.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h4>Keranjang Kosong</h4>
                    <p>Yuk, tambahkan produk favorit Anda</p>
                    <button onclick="toggleCart(); scrollToProducts()" class="btn-primary">Belanja Sekarang</button>
                </div>
            `;
        } else {
            cartItems.innerHTML = AppState.cart.map((item, index) => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        ${Object.entries(item.variants).map(([k, v]) => `
                            <div class="cart-item-variant">${k}: ${v}</div>
                        `).join('')}
                        <div class="cart-item-price">Rp ${formatPrice(item.price)}</div>
                        <div class="cart-item-qty">
                            <button class="qty-btn" onclick="updateCartQuantity(${index}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${index})" title="Hapus">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `).join('');
        }
    }
}

function proceedToCheckout() {
    if (AppState.cart.length === 0) {
        showToast('Keranjang belanja kosong', 'error');
        return;
    }
    
    if (!AppState.user) {
        openModal('auth', 'login');
        showToast('Silakan login untuk melanjutkan', 'error');
        return;
    }
    
    // Populate checkout items
    const checkoutItems = document.getElementById('checkoutItems');
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 500000 ? 0 : 25000;
    const fee = 0; // Payment fee
    const total = subtotal + shipping + fee;
    
    if (checkoutItems) {
        checkoutItems.innerHTML = AppState.cart.map(item => `
            <div class="summary-row">
                <span>${item.name} (${item.quantity}x)</span>
                <span>Rp ${formatPrice(item.price * item.quantity)}</span>
            </div>
        `).join('');
    }
    
    document.getElementById('checkoutSubtotal').textContent = `Rp ${formatPrice(subtotal)}`;
    document.getElementById('checkoutShipping').textContent = shipping === 0 ? 'GRATIS' : `Rp ${formatPrice(shipping)}`;
    document.getElementById('checkoutFee').textContent = `Rp ${formatPrice(fee)}`;
    document.getElementById('checkoutTotal').textContent = `Rp ${formatPrice(total)}`;
    
    // Reset steps
    document.querySelectorAll('.checkout-step-content').forEach((el, idx) => {
        el.classList.toggle('active', idx === 0);
    });
    document.querySelectorAll('.step').forEach((el, idx) => {
        el.classList.toggle('active', idx === 0);
        el.classList.toggle('completed', false);
    });
    
    toggleCart();
    openModal('checkout');
}

// Checkout Steps
function nextStep(step) {
    // Validate current step
    if (step === 2) {
        const form = document.getElementById('shippingForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
    }
    
    // Update steps
    document.querySelectorAll('.checkout-step-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    
    // Mark previous as completed
    for (let i = 1; i < step; i++) {
        document.querySelector(`.step[data-step="${i}"]`).classList.add('completed');
    }
    
    document.getElementById(`step${step}`).classList.add('active');
    document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
}

function prevStep(step) {
    document.querySelectorAll('.checkout-step-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`step${step}`).classList.add('active');
    document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
}

// Wishlist Functions
function toggleWishlistItem(productId) {
    const index = AppState.wishlist.findIndex(item => item.id === productId);
    
    if (index > -1) {
        AppState.wishlist.splice(index, 1);
        showToast('Dihapus dari wishlist');
    } else {
        const product = AppState.products.find(p => p.id === productId) || AppState.currentProduct;
        if (product) {
            AppState.wishlist.push({
                id: productId,
                name: product.name,
                price: product.price,
                image: product.image,
                added_at: new Date().toISOString()
            });
            showToast('Ditambahkan ke wishlist');
        }
    }
    
    saveWishlist();
    updateWishlistUI();
    updateWishlistButtons(productId);
}

function toggleWishlistFromModal() {
    if (!AppState.currentProduct) return;
    toggleWishlistItem(AppState.currentProduct.id);
    updateModalWishlistButton();
}

function isInWishlist(productId) {
    return AppState.wishlist.some(item => item.id === productId);
}

function saveWishlist() {
    localStorage.setItem('kimishop_wishlist', JSON.stringify(AppState.wishlist));
}

function updateWishlistUI() {
    const wishlistCount = document.getElementById('wishlistCount');
    const wishlistItems = document.getElementById('wishlistItems');
    
    if (wishlistCount) wishlistCount.textContent = AppState.wishlist.length;
    
    if (wishlistItems) {
        if (AppState.wishlist.length === 0) {
            wishlistItems.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h4>Wishlist Kosong</h4>
                    <p>Simpan produk favorit Anda di sini</p>
                    <button onclick="toggleWishlist(); scrollToProducts()" class="btn-primary">Jelajahi Produk</button>
                </div>
            `;
        } else {
            wishlistItems.innerHTML = AppState.wishlist.map((item, index) => `
                <div class="wishlist-item">
                    <img src="${item.image}" alt="${item.name}" onclick="openProductDetail(${item.id})">
                    <div class="wishlist-item-info">
                        <div class="wishlist-item-title" onclick="openProductDetail(${item.id})">${item.name}</div>
                        <div class="wishlist-item-price">Rp ${formatPrice(item.price)}</div>
                        <button class="btn-add-cart" onclick="addToCart(${item.id}); toggleWishlistItem(${item.id})" style="margin-top: 8px; padding: 8px 16px; font-size: 13px;">
                            <i class="fas fa-cart-plus"></i> Beli Sekarang
                        </button>
                    </div>
                    <button class="remove-item" onclick="toggleWishlistItem(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }
    }
}

function updateWishlistButtons(productId) {
    // Update all wishlist buttons for this product
    document.querySelectorAll(`.wishlist-btn[onclick*="${productId}"]`).forEach(btn => {
        const isActive = isInWishlist(productId);
        btn.classList.toggle('active', isActive);
        btn.innerHTML = `<i class="${isActive ? 'fas' : 'far'} fa-heart"></i>`;
        btn.title = isActive ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist';
    });
}

function updateModalWishlistButton() {
    if (!AppState.currentProduct) return;
    const btn = document.getElementById('modalWishlistBtn');
    const isActive = isInWishlist(AppState.currentProduct.id);
    
    btn.classList.toggle('active', isActive);
    btn.innerHTML = `<i class="${isActive ? 'fas' : 'far'} fa-heart"></i>`;
}

function addAllWishlistToCart() {
    if (AppState.wishlist.length === 0) return;
    
    let added = 0;
    AppState.wishlist.forEach(item => {
        const product = AppState.products.find(p => p.id === item.id);
        if (product && product.stock > 0) {
            addToCart(item.id, 1, {});
            added++;
        }
    });
    
    if (added > 0) {
        showToast(`${added} produk ditambahkan ke keranjang`);
        // Clear wishlist
        AppState.wishlist = [];
        saveWishlist();
        updateWishlistUI();
    }
}