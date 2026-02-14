let chatSocket = null;
let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

function toggleChat() {
    const widget = document.getElementById('chatWidget');
    widget.classList.toggle('minimized');
    
    if (!widget.classList.contains('minimized') && !chatSocket && AppState.user) {
        initializeChat();
    }
}

function initializeChat() {
    // Simulated WebSocket connection
    // In production, use: new WebSocket('wss://yourserver.com/chat')
    
    // For demo, we'll use polling
    setInterval(checkNewMessages, 5000);
    
    // Load chat history
    renderChatMessages();
}

function handleChatKey(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessageToChat('user', message);
    input.value = '';
    
    // Save to history
    chatHistory.push({
        type: 'user',
        message: message,
        time: new Date().toISOString()
    });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    
    // Send to server
    try {
        const response = await fetch('php/chat-server.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: AppState.user?.id || 'guest',
                message: message,
                session_id: getSessionId()
            })
        });
        
        const data = await response.json();
        
        // Bot response
        setTimeout(() => {
            addMessageToChat('bot', data.response);
            chatHistory.push({
                type: 'bot',
                message: data.response,
                time: new Date().toISOString()
            });
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        }, 500 + Math.random() * 1000); // Simulate typing delay
        
    } catch (error) {
        // Fallback response
        setTimeout(() => {
            const fallback = getFallbackResponse(message);
            addMessageToChat('bot', fallback);
        }, 1000);
    }
}

function addMessageToChat(type, message) {
    const container = document.getElementById('chatMessages');
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(message)}</div>
        <span class="time">${time}</span>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function renderChatMessages() {
    const container = document.getElementById('chatMessages');
    container.innerHTML = '';
    
    chatHistory.forEach(msg => {
        const time = new Date(msg.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const div = document.createElement('div');
        div.className = `message ${msg.type}`;
        div.innerHTML = `
            <div class="message-content">${escapeHtml(msg.message)}</div>
            <span class="time">${time}</span>
        `;
        container.appendChild(div);
    });
    
    container.scrollTop = container.scrollHeight;
}

function getFallbackResponse(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('harga') || lower.includes('price')) {
        return 'Anda bisa melihat harga produk di halaman detail. Ada yang bisa saya bantu tentang produk tertentu?';
    }
    if (lower.includes('kirim') || lower.includes('pengiriman') || lower.includes('ongkir')) {
        return 'Kami menyediakan gratis ongkir untuk pembelian di atas Rp 500.000. Pengiriman biasanya memakan waktu 2-5 hari kerja.';
    }
    if (lower.includes('bayar') || lower.includes('payment')) {
        return 'Kami menerima pembayaran via transfer bank, kartu kredit, e-wallet (OVO, GoPay, DANA), dan COD.';
    }
    if (lower.includes('status') || lower.includes('pesanan')) {
        return 'Anda bisa melacak pesanan di menu "Pesanan Saya" atau klik tombol "Lacak Pesanan" di website kami.';
    }
    if (lower.includes('return') || lower.includes('retur') || lower.includes('kembali')) {
        return 'Kami menerima retur dalam 7 hari setelah barang diterima, dengan syarat barang dalam kondisi asli.';
    }
    
    return 'Terima kasih atas pesan Anda. Customer service kami akan segera membantu. Mohon tunggu sebentar ya! 😊';
}

function checkNewMessages() {
    // Poll for new messages from admin
    if (!AppState.user) return;
    
    fetch(`php/chat-server.php?action=poll&user_id=${AppState.user.id}&last_id=${getLastMessageId()}`)
        .then(res => res.json())
        .then(data => {
            if (data.messages && data.messages.length > 0) {
                data.messages.forEach(msg => {
                    addMessageToChat('bot', msg.message);
                    chatHistory.push({
                        type: 'bot',
                        message: msg.message,
                        time: msg.created_at
                    });
                });
                localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
                
                // Show notification if chat minimized
                const widget = document.getElementById('chatWidget');
                if (widget.classList.contains('minimized')) {
                    document.getElementById('chatNotif').style.display = 'flex';
                }
            }
        });
}

function getSessionId() {
    let sessionId = localStorage.getItem('chatSessionId');
    if (!sessionId) {
        sessionId = 'sess_' + Date.now();
        localStorage.setItem('chatSessionId', sessionId);
    }
    return sessionId;
}

function getLastMessageId() {
    return chatHistory.length;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Admin typing indicator
let typingTimeout;
function showTypingIndicator() {
    const container = document.getElementById('chatMessages');
    const indicator = document.createElement('div');
    indicator.className = 'message bot typing';
    indicator.innerHTML = `
        <div class="message-content">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        </div>
    `;
    indicator.id = 'typingIndicator';
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}