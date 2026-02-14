// ==========================================
// KimiShop - Main JavaScript
// ==========================================

// State Management
const AppState = {
    cart: JSON.parse(localStorage.getItem('kimishop_cart')) || [],
    wishlist: JSON.parse(localStorage.getItem('kimishop_wishlist')) || [],
    user: JSON.parse(localStorage.getItem('kimishop_user')) || null,
    currentProduct: null,
    currentRating: 0,
    products: [],
    vendors: [],
    filteredProducts: [],
    page: 1,
    limit: 12,
    currentCategory: 'all',
    currentSort: 'newest',
    searchQuery: '',
    isLoading: false
};

// Mock Data - Products
const MOCK_PRODUCTS = [
    // Elektronik
    {
        id: 1,
        name: "iPhone 15 Pro Max 256GB",
        description: "iPhone terbaru dengan chip A17 Pro, kamera 48MP, dan layar Super Retina XDR. Performa luar biasa untuk produktivitas dan kreativitas.",
        price: 19999000,
        original_price: 21999000,
        stock: 15,
        category: "elektronik",
        category_id: 1,
        vendor_id: 1,
        vendor_name: "iBox Official",
        image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400",
        images: [
            "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=600",
            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600",
            "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600"
        ],
        rating: 4.9,
        review_count: 128,
        sold_count: 450,
        isNew: true,
        variants: {
            "Warna": ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"],
            "Storage": ["256GB", "512GB", "1TB"]
        }
    },
    {
        id: 2,
        name: "MacBook Air M2 13-inch",
        description: "Laptop tipis dan ringan dengan chip M2 yang powerful. Baterai tahan hingga 18 jam, layar Liquid Retina yang memukau.",
        price: 17499000,
        original_price: 18999000,
        stock: 8,
        category: "elektronik",
        category_id: 1,
        vendor_id: 1,
        vendor_name: "iBox Official",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        images: [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
            "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600"
        ],
        rating: 4.8,
        review_count: 89,
        sold_count: 320,
        isNew: false,
        variants: {
            "Warna": ["Midnight", "Starlight", "Space Gray", "Silver"],
            "RAM": ["8GB", "16GB", "24GB"]
        }
    },
    {
        id: 3,
        name: "Sony WH-1000XM5 Headphone",
        description: "Headphone wireless dengan noise cancelling terbaik di kelasnya. Suara high-resolution audio yang superior.",
        price: 4999000,
        original_price: 5999000,
        stock: 25,
        category: "elektronik",
        category_id: 1,
        vendor_id: 2,
        vendor_name: "Sony Store",
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400",
        images: [
            "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600"
        ],
        rating: 4.7,
        review_count: 256,
        sold_count: 890,
        isNew: false,
        variants: {
            "Warna": ["Black", "Silver", "Midnight Blue"]
        }
    },
    {
        id: 4,
        name: "Samsung Galaxy S24 Ultra",
        description: "Smartphone Android flagship dengan S Pen, kamera 200MP, dan fitur AI Galaxy yang inovatif.",
        price: 18999000,
        original_price: 20999000,
        stock: 12,
        category: "elektronik",
        category_id: 1,
        vendor_id: 3,
        vendor_name: "Samsung Official",
        image: "https://images.unsplash.com/photo-1610945265078-3858a0828671?w=400",
        images: [
            "https://images.unsplash.com/photo-1610945265078-3858a0828671?w=600",
            "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600"
        ],
        rating: 4.6,
        review_count: 167,
        sold_count: 280,
        isNew: true,
        variants: {
            "Warna": ["Titanium Gray", "Titanium Black", "Titanium Violet", "Titanium Yellow"],
            "Storage": ["256GB", "512GB", "1TB"]
        }
    },
    {
        id: 5,
        name: "iPad Pro 12.9 M2",
        description: "Tablet profesional dengan chip M2, layar Liquid Retina XDR, dan dukungan Apple Pencil 2.",
        price: 15999000,
        original_price: 17999000,
        stock: 6,
        category: "elektronik",
        category_id: 1,
        vendor_id: 1,
        vendor_name: "iBox Official",
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
        images: [
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600",
            "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600"
        ],
        rating: 4.8,
        review_count: 134,
        sold_count: 210,
        isNew: false,
        variants: {
            "Warna": ["Space Gray", "Silver"],
            "Storage": ["128GB", "256GB", "512GB", "1TB", "2TB"]
        }
    },
    {
        id: 6,
        name: "Canon EOS R6 Mark II",
        description: "Kamera mirrorless full-frame dengan autofocus canggih, 40fps burst shooting, dan video 4K 60p.",
        price: 32999000,
        original_price: 35999000,
        stock: 4,
        category: "elektronik",
        category_id: 1,
        vendor_id: 4,
        vendor_name: "Canon Pro",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
        images: [
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600",
            "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600"
        ],
        rating: 4.9,
        review_count: 45,
        sold_count: 67,
        isNew: true,
        variants: {
            "Kit": ["Body Only", "RF 24-105mm Kit", "RF 24-70mm Kit"]
        }
    },
    
    // Fashion
    {
        id: 7,
        name: "Nike Air Jordan 1 High OG",
        description: "Sneakers ikonik dengan desain timeless. Material premium untuk kenyamanan maksimal.",
        price: 2899000,
        original_price: 3499000,
        stock: 18,
        category: "fashion",
        category_id: 2,
        vendor_id: 5,
        vendor_name: "Nike Store",
        image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400",
        images: [
            "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600"
        ],
        rating: 4.8,
        review_count: 312,
        sold_count: 1200,
        isNew: false,
        variants: {
            "Ukuran": ["40", "41", "42", "43", "44", "45"],
            "Warna": ["Chicago", "Royal Toe", "Shadow"]
        }
    },
    {
        id: 8,
        name: "Levi's 501 Original Jeans",
        description: "Jeans klasik dengan straight fit. Denim premium yang semakin nyaman seiring pemakaian.",
        price: 899000,
        original_price: 1199000,
        stock: 45,
        category: "fashion",
        category_id: 2,
        vendor_id: 6,
        vendor_name: "Levi's Official",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
        images: [
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
            "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=600"
        ],
        rating: 4.6,
        review_count: 528,
        sold_count: 2100,
        isNew: false,
        variants: {
            "Ukuran": ["28", "30", "32", "34", "36", "38"],
            "Warna": ["Dark Indigo", "Medium Blue", "Light Wash", "Black"]
        }
    },
    {
        id: 9,
        name: "Zara Wool Blend Coat",
        description: "Coat elegan dengan bahan wool blend berkualitas. Cocok untuk musim dingin atau acara formal.",
        price: 1299000,
        original_price: 1799000,
        stock: 22,
        category: "fashion",
        category_id: 2,
        vendor_id: 7,
        vendor_name: "Zara Indonesia",
        image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400",
        images: [
            "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600",
            "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600"
        ],
        rating: 4.5,
        review_count: 89,
        sold_count: 340,
        isNew: true,
        variants: {
            "Ukuran": ["S", "M", "L", "XL", "XXL"],
            "Warna": ["Camel", "Black", "Navy", "Gray"]
        }
    },
    {
        id: 10,
        name: "Adidas Ultraboost Light",
        description: "Sepatu lari dengan teknologi Boost terbaru yang lebih ringan dan responsif.",
        price: 2499000,
        original_price: 2999000,
        stock: 30,
        category: "fashion",
        category_id: 2,
        vendor_id: 8,
        vendor_name: "Adidas Store",
        image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400",
        images: [
            "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600",
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600"
        ],
        rating: 4.7,
        review_count: 234,
        sold_count: 890,
        isNew: true,
        variants: {
            "Ukuran": ["40", "41", "42", "43", "44", "45"],
            "Warna": ["Core Black", "Cloud White", "Solar Red"]
        }
    },
    
    // Rumah Tangga
    {
        id: 11,
        name: "Dyson V15 Detect Vacuum",
        description: "Vacuum cleaner tanpa kabel dengan laser dust detection dan teknologi piezo sensor.",
        price: 12999000,
        original_price: 14999000,
        stock: 7,
        category: "rumah-tangga",
        category_id: 3,
        vendor_id: 9,
        vendor_name: "Dyson Official",
        image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400",
        images: [
            "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600",
            "https://images.unsplash.com/photo-1527515673510-8aa3135812db?w=600"
        ],
        rating: 4.9,
        review_count: 156,
        sold_count: 420,
        isNew: false,
        variants: {
            "Warna": ["Nickel/Blue", "Gold/Gold"]
        }
    },
    {
        id: 12,
        name: "Philips Air Fryer XXL",
        description: "Air fryer kapasitas besar dengan teknologi Rapid Air. Masak lebih sehat tanpa minyak.",
        price: 1899000,
        original_price: 2499000,
        stock: 35,
        category: "rumah-tangga",
        category_id: 3,
        vendor_id: 10,
        vendor_name: "Philips Store",
        image: "https://images.unsplash.com/photo-1626147116986-4601771470a6?w=400",
        images: [
            "https://images.unsplash.com/photo-1626147116986-4601771470a6?w=600",
            "https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=600"
        ],
        rating: 4.7,
        review_count: 892,
        sold_count: 3400,
        isNew: false,
        variants: {
            "Warna": ["Black", "White", "Red"]
        }
    },
    {
        id: 13,
        name: "IKEA POÄNG Armchair",
        description: "Kursi santai klasik dengan desain ergonomis. Cushion yang nyaman untuk bersantai.",
        price: 1299000,
        original_price: 1599000,
        stock: 28,
        category: "rumah-tangga",
        category_id: 3,
        vendor_id: 11,
        vendor_name: "IKEA Indonesia",
        image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400",
        images: [
            "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600",
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600"
        ],
        rating: 4.6,
        review_count: 445,
        sold_count: 1200,
        isNew: false,
        variants: {
            "Warna Frame": ["Birch", "Black-Brown", "White"],
            "Cushion": ["Hillared Beige", "Knisa Black", "Ransta Red"]
        }
    },
    
    // Kecantikan
    {
        id: 14,
        name: "SK-II Facial Treatment Essence",
        description: "Essence ikonik dengan Pitera™ untuk kulit yang lebih cerah dan lembab.",
        price: 2150000,
        original_price: 2650000,
        stock: 20,
        category: "kecantikan",
        category_id: 4,
        vendor_id: 12,
        vendor_name: "SK-II Official",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
        images: [
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600",
            "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600"
        ],
        rating: 4.8,
        review_count: 678,
        sold_count: 2300,
        isNew: false,
        variants: {
            "Size": ["75ml", "160ml", "230ml"]
        }
    },
    {
        id: 15,
        name: "Dior Sauvage Eau de Parfum",
        description: "Parfum maskulin dengan aroma segar bergamot dan notes woody yang kuat.",
        price: 1450000,
        original_price: 1750000,
        stock: 25,
        category: "kecantikan",
        category_id: 4,
        vendor_id: 13,
        vendor_name: "Dior Beauty",
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400",
        images: [
            "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600",
            "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600"
        ],
        rating: 4.9,
        review_count: 423,
        sold_count: 1500,
        isNew: false,
        variants: {
            "Size": ["60ml", "100ml", "200ml"]
        }
    },
    {
        id: 16,
        name: "Laneige Lip Sleeping Mask",
        description: "Masker bibir overnight untuk bibir lembut dan sehat. Berbagai varian rasa.",
        price: 245000,
        original_price: 320000,
        stock: 100,
        category: "kecantikan",
        category_id: 4,
        vendor_id: 14,
        vendor_name: "Laneige Official",
        image: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=400",
        images: [
            "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=600",
            "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=600"
        ],
        rating: 4.7,
        review_count: 1234,
        sold_count: 5600,
        isNew: false,
        variants: {
            "Varian": ["Berry", "Grapefruit", "Apple Lime", "Vanilla"]
        }
    },
    
    // Olahraga
    {
        id: 17,
        name: "Decathlon Quechua Tent 2P",
        description: "Tenda camping 2 orang dengan sistem pitch cepat. Tahan air dan ventilasi baik.",
        price: 599000,
        original_price: 799000,
        stock: 40,
        category: "olahraga",
        category_id: 5,
        vendor_id: 15,
        vendor_name: "Decathlon",
        image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400",
        images: [
            "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600",
            "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600"
        ],
        rating: 4.5,
        review_count: 234,
        sold_count: 890,
        isNew: false,
        variants: {
            "Warna": ["Blue", "Green", "Orange"]
        }
    },
    {
        id: 18,
        name: "Yeti Rambler Tumbler 30oz",
        description: "Tumbler stainless steel dengan isolasi double-wall. Tahan dingin/hangat berjam-jam.",
        price: 450000,
        original_price: 650000,
        stock: 55,
        category: "olahraga",
        category_id: 5,
        vendor_id: 16,
        vendor_name: "Yeti Store",
        image: "https://images.unsplash.com/photo-1610824352934-c10d87b700cc?w=400",
        images: [
            "https://images.unsplash.com/photo-1610824352934-c10d87b700cc?w=600",
            "https://images.unsplash.com/photo-1517254797898-04edd251bfb3?w=600"
        ],
        rating: 4.8,
        review_count: 567,
        sold_count: 2100,
        isNew: false,
        variants: {
            "Warna": ["Navy", "Black", "White", "Seafoam"]
        }
    },
    {
        id: 19,
        name: "Garmin Forerunner 965",
        description: "GPS smartwatch untuk runner dengan AMOLED display dan advanced training metrics.",
        price: 8499000,
        original_price: 9499000,
        stock: 12,
        category: "olahraga",
        category_id: 5,
        vendor_id: 17,
        vendor_name: "Garmin Indonesia",
        image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400",
        images: [
            "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600"
        ],
        rating: 4.9,
        review_count: 89,
        sold_count: 230,
        isNew: true,
        variants: {
            "Warna": ["Black", "Whitestone", "Amp Yellow"]
        }
    },
    
    // Makanan
    {
        id: 20,
        name: "Starbucks Reserve Coffee Beans",
        description: "Biji kopi premium dari berbagai daerah penghasil kopi terbaik dunia.",
        price: 185000,
        original_price: 250000,
        stock: 80,
        category: "makanan",
        category_id: 6,
        vendor_id: 18,
        vendor_name: "Starbucks Store",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
        images: [
            "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600",
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"
        ],
        rating: 4.8,
        review_count: 445,
        sold_count: 3200,
        isNew: false,
        variants: {
            "Varian": ["Sumatra", "Ethiopia", "Colombia", "Pike Place"]
        }
    },
    {
        id: 21,
        name: "Godiva Gold Collection",
        description: "Koleksi cokelat premium Belgia dengan berbagai rasa eksklusif.",
        price: 450000,
        original_price: 550000,
        stock: 35,
        category: "makanan",
        category_id: 6,
        vendor_id: 19,
        vendor_name: "Godiva Indonesia",
        image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400",
        images: [
            "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600",
            "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600"
        ],
        rating: 4.9,
        review_count: 312,
        sold_count: 1500,
        isNew: false,
        variants: {
            "Size": ["12 pcs", "24 pcs", "36 pcs"]
        }
    },
    {
        id: 22,
        name: "Royal Ceylon Tea Set",
        description: "Set teh hitam premium dari Sri Lanka dengan teapot dan cangkir elegan.",
        price: 325000,
        original_price: 450000,
        stock: 45,
        category: "makanan",
        category_id: 6,
        vendor_id: 20,
        vendor_name: "Tea House",
        image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400",
        images: [
            "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600",
            "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600"
        ],
        rating: 4.6,
        review_count: 178,
        sold_count: 890,
        isNew: false,
        variants: {
            "Varian": ["Earl Grey", "English Breakfast", "Green Tea", "Oolong"]
        }
    },
    {
        id: 23,
        name: "Lindt Lindor Assorted",
        description: "Cokelat Lindt dengan creamy center yang meleleh di mulut. Berbagai rasa.",
        price: 165000,
        original_price: 220000,
        stock: 120,
        category: "makanan",
        category_id: 6,
        vendor_id: 21,
        vendor_name: "Lindt Store",
        image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400",
        images: [
            "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600",
            "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600"
        ],
        rating: 4.8,
        review_count: 678,
        sold_count: 4500,
        isNew: false,
        variants: {
            "Size": ["200g", "337g", "600g"]
        }
    },
    {
        id: 24,
        name: "Kopi Luwak Authentic 100g",
        description: "Kopi luwak asli Indonesia dengan proses alami. Rasa yang unik dan halus.",
        price: 850000,
        original_price: 1200000,
        stock: 15,
        category: "makanan",
        category_id: 6,
        vendor_id: 22,
        vendor_name: "Kopi Nusantara",
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
        images: [
            "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600",
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600"
        ],
        rating: 4.9,
        review_count: 89,
        sold_count: 340,
        isNew: false,
        variants: {
            "Bentuk": ["Biji Utuh", "Giling Halus", "Giling Sedang"]
        }
    }
];

// Mock Vendors
const MOCK_VENDORS = [
    { id: 1, name: "iBox Official", logo: "https://via.placeholder.com/150/6366f1/ffffff?text=iBox", rating: 4.9, products_count: 156 },
    { id: 2, name: "Sony Store", logo: "https://via.placeholder.com/150/000000/ffffff?text=Sony", rating: 4.8, products_count: 89 },
    { id: 3, name: "Samsung Official", logo: "https://via.placeholder.com/150/1428A0/ffffff?text=Samsung", rating: 4.7, products_count: 234 },
    { id: 4, name: "Canon Pro", logo: "https://via.placeholder.com/150/BC002D/ffffff?text=Canon", rating: 4.9, products_count: 45 },
    { id: 5, name: "Nike Store", logo: "https://via.placeholder.com/150/111111/ffffff?text=Nike", rating: 4.8, products_count: 312 },
    { id: 6, name: "Levi's Official", logo: "https://via.placeholder.com/150/C41230/ffffff?text=Levi's", rating: 4.6, products_count: 178 },
    { id: 7, name: "Zara Indonesia", logo: "https://via.placeholder.com/150/000000/ffffff?text=ZARA", rating: 4.5, products_count: 445 },
    { id: 8, name: "Adidas Store", logo: "https://via.placeholder.com/150/000000/ffffff?text=adidas", rating: 4.7, products_count: 267 }
];

// Mock Reviews
const generateMockReviews = (productId, count) => {
    const reviews = [];
    const names = ["Ahmad Rizky", "Siti Nurhaliza", "Budi Santoso", "Dewi Lestari", "Eko Prasetyo", "Fitriani", "Gilang Ramadhan", "Hana Salsabila"];
    const comments = [
        "Produk sangat bagus, sesuai dengan deskripsi. Pengiriman juga cepat!",
        "Kualitas premium, worth it dengan harganya. Recommended seller!",
        "Bagus sih, tapi agak lama pengirimannya. Overall oke.",
        "Suka banget! Bakal repeat order lagi.",
        "Packaging rapi, produk original. Terima kasih!",
        "Harga terjangkau, kualitas oke. Puas belanja di sini.",
        "Barang sampai dengan selamat, kondisi mulus. Thanks!",
        "Sesuai ekspektasi, bahkan lebih bagus dari foto. Recommended!"
    ];
    
    for (let i = 0; i < count; i++) {
        reviews.push({
            id: i + 1,
            product_id: productId,
            user_name: names[Math.floor(Math.random() * names.length)],
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            comment: comments[Math.floor(Math.random() * comments.length)],
            created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    return reviews;
};

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load mock data
    AppState.products = MOCK_PRODUCTS;
    AppState.vendors = MOCK_VENDORS;
    AppState.filteredProducts = [...MOCK_PRODUCTS];
    
    // Initialize UI
    renderProducts();
    renderVendors();
    renderFlashSale();
    updateCartUI();
    updateWishlistUI();
    checkAuthStatus();
    setupEventListeners();
    setupSearchAutocomplete();
    startHeroSlider();
    startFlashSaleCountdown();
    
    // Load AI recommendations if user is logged in
    if (AppState.user) {
        loadAIRecommendations();
    }
    
    console.log('KimiShop initialized successfully!');
}

// Event Listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length > 0) {
                document.getElementById('searchSuggestions').classList.add('active');
            }
        });
    }
    
    // Star rating in product modal
    const stars = document.querySelectorAll('#starRatingInput i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            setRating(rating);
        });
    });
    
    // Close modal on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Quantity input validation
    const qtyInput = document.getElementById('modalQty');
    if (qtyInput) {
        qtyInput.addEventListener('change', (e) => {
            const val = parseInt(e.target.value);
            const max = parseInt(e.target.max) || 99;
            if (val < 1) e.target.value = 1;
            if (val > max) e.target.value = max;
        });
    }
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Hero Slider
function startHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}

// Flash Sale Countdown
function startFlashSaleCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;
    
    let hours = 4;
    let minutes = 59;
    let seconds = 59;
    
    setInterval(() => {
        seconds--;
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            if (minutes < 0) {
                minutes = 59;
                hours--;
                if (hours < 0) {
                    hours = 4;
                    minutes = 59;
                    seconds = 59;
                }
            }
        }
        
        const spans = countdownEl.querySelectorAll('span');
        spans[0].textContent = String(hours).padStart(2, '0');
        spans[1].textContent = String(minutes).padStart(2, '0');
        spans[2].textContent = String(seconds).padStart(2, '0');
    }, 1000);
}

// Product Functions
function renderProducts(products = null, append = false) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    const productsToRender = products || AppState.filteredProducts;
    const start = (AppState.page - 1) * AppState.limit;
    const end = start + AppState.limit;
    const paginatedProducts = productsToRender.slice(start, end);
    
    if (!append) {
        grid.innerHTML = '';
    }
    
    if (paginatedProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-search"></i>
                <h4>Tidak ada produk ditemukan</h4>
                <p>Coba ubah filter atau kata kunci pencarian</p>
                <button onclick="resetFilters()" class="btn-primary">Reset Filter</button>
            </div>
        `;
        return;
    }
    
    const html = paginatedProducts.map(product => {
        const discount = product.original_price ? 
            Math.round((1 - product.price / product.original_price) * 100) : 0;
        
        return `
            <div class="product-card" data-id="${product.id}">
                ${discount > 0 ? `<span class="product-badge discount">-${discount}%</span>` : ''}
                ${product.isNew ? `<span class="product-badge new">Baru</span>` : ''}
                
                <button class="wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}" 
                        onclick="event.stopPropagation(); toggleWishlistItem(${product.id})"
                        title="${isInWishlist(product.id) ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}">
                    <i class="${isInWishlist(product.id) ? 'fas' : 'far'} fa-heart"></i>
                </button>
                
                <div class="product-image" onclick="openProductDetail(${product.id})">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="quick-view">Lihat Detail</div>
                </div>
                
                <div class="product-info">
                    <div class="vendor-tag">${product.vendor_name}</div>
                    <h3 class="product-title" onclick="openProductDetail(${product.id})">${product.name}</h3>
                    
                    <div class="product-meta">
                        <div class="rating">
                            <i class="fas fa-star"></i>
                            <span>${product.rating}</span>
                            <span>(${formatNumber(product.review_count)})</span>
                        </div>
                        <div class="sold-count">${formatNumber(product.sold_count)} terjual</div>
                    </div>
                    
                    <div class="price-box">
                        <span class="current-price">Rp ${formatPrice(product.price)}</span>
                        ${product.original_price ? `
                            <span class="original-price">Rp ${formatPrice(product.original_price)}</span>
                        ` : ''}
                    </div>
                    
                    ${discount > 0 ? `<span class="discount-percent">Hemat ${discount}%</span>` : ''}
                    
                    <div class="stock-status ${product.stock < 10 ? 'low' : ''} ${product.stock === 0 ? 'out' : ''}">
                        <i class="fas fa-${product.stock === 0 ? 'times-circle' : product.stock < 10 ? 'exclamation-circle' : 'check-circle'}"></i>
                        ${product.stock === 0 ? 'Stok Habis' : product.stock < 10 ? `Sisa ${product.stock} unit` : 'Stok Tersedia'}
                    </div>
                    
                    <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})" 
                            ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-${product.stock === 0 ? 'bell' : 'cart-plus'}"></i> 
                        ${product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    if (append) {
        grid.insertAdjacentHTML('beforeend', html);
    } else {
        grid.innerHTML = html;
    }
    
    renderPagination(productsToRender.length);
}

function renderFlashSale() {
    const grid = document.getElementById('flashSaleGrid');
    if (!grid) return;
    
    const flashSaleProducts = MOCK_PRODUCTS.filter(p => p.original_price && (p.original_price - p.price) / p.original_price > 0.15)
        .slice(0, 6);
    
    grid.innerHTML = flashSaleProducts.map(product => {
        const discount = Math.round((1 - product.price / product.original_price) * 100);
        return `
            <div class="product-card" onclick="openProductDetail(${product.id})">
                <span class="product-badge discount">-${discount}%</span>
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="price-box">
                        <span class="current-price">Rp ${formatPrice(product.price)}</span>
                        <span class="original-price">Rp ${formatPrice(product.original_price)}</span>
                    </div>
                    <div class="flash-progress">
                        <div class="progress-bar" style="width: ${Math.random() * 40 + 60}%"></div>
                        <span>Segera habis</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderVendors() {
    const grid = document.getElementById('vendorGrid');
    if (!grid) return;
    
    grid.innerHTML = AppState.vendors.slice(0, 6).map(vendor => `
        <div class="vendor-card" onclick="filterByVendor(${vendor.id})">
            <img src="${vendor.logo}" alt="${vendor.name}">
            <h4>${vendor.name}</h4>
            <div class="rating">
                <i class="fas fa-star"></i> ${vendor.rating}
            </div>
            <div class="products-count">${vendor.products_count} produk</div>
        </div>
    `).join('');
}

function renderPagination(total) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(total / AppState.limit);
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button ${AppState.page === 1 ? 'disabled' : ''} onclick="changePage(${AppState.page - 1})">
        <i class="fas fa-chevron-left"></i>
    </button>`;
    
    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, AppState.page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        html += `<button onclick="changePage(1)">1</button>`;
        if (startPage > 2) html += `<span>...</span>`;
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="${i === AppState.page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span>...</span>`;
        html += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    html += `<button ${AppState.page === totalPages ? 'disabled' : ''} onclick="changePage(${AppState.page + 1})">
        <i class="fas fa-chevron-right"></i>
    </button>`;
    
    pagination.innerHTML = html;
}

function changePage(page) {
    AppState.page = page;
    renderProducts();
    document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Filtering & Sorting
function filterByCategory(category) {
    AppState.currentCategory = category;
    AppState.page = 1;
    
    // Update active state
    document.querySelectorAll('.category-nav a').forEach(link => {
        link.classList.toggle('active', link.textContent.toLowerCase().includes(category === 'all' ? 'semua' : category));
    });
    
    applyFilters();
}

function filterByVendor(vendorId) {
    const vendor = AppState.vendors.find(v => v.id === vendorId);
    if (!vendor) return;
    
    AppState.filteredProducts = AppState.products.filter(p => p.vendor_id === vendorId);
    AppState.page = 1;
    
    showActiveFilter(`Toko: ${vendor.name}`, () => {
        AppState.filteredProducts = [...AppState.products];
        renderProducts();
    });
    
    renderProducts();
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function sortProducts() {
    const sort = document.getElementById('sortFilter').value;
    AppState.currentSort = sort;
    AppState.page = 1;
    
    applyFilters();
}

function applyFilters() {
    let filtered = [...AppState.products];
    
    // Category filter
    if (AppState.currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === AppState.currentCategory);
    }
    
    // Search filter
    if (AppState.searchQuery) {
        const query = AppState.searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query) ||
            p.vendor_name.toLowerCase().includes(query)
        );
    }
    
    // Sorting
    switch (AppState.currentSort) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            filtered.sort((a, b) => b.sold_count - a.sold_count);
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
        default:
            filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id - a.id);
    }
    
    AppState.filteredProducts = filtered;
    renderProducts();
}

function showActiveFilter(label, onRemove) {
    const container = document.getElementById('activeFilters');
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
        ${label}
        <button onclick="this.parentElement.remove(); (${onRemove})()"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(tag);
}

function resetFilters() {
    AppState.currentCategory = 'all';
    AppState.searchQuery = '';
    AppState.page = 1;
    document.getElementById('searchInput').value = '';
    document.getElementById('activeFilters').innerHTML = '';
    document.querySelectorAll('.category-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.textContent.includes('Semua')) link.classList.add('active');
    });
    applyFilters();
}

// Search Functions
function handleSearch(e) {
    const query = e.target.value.trim();
    const suggestions = document.getElementById('searchSuggestions');
    
    if (query.length < 2) {
        suggestions.classList.remove('active');
        return;
    }
    
    AppState.searchQuery = query;
    
    // Filter suggestions
    const matches = AppState.products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    if (matches.length > 0) {
        suggestions.innerHTML = matches.map(p => `
            <div class="suggestion-item" onclick="selectSearchSuggestion(${p.id})">
                <img src="${p.image}" alt="${p.name}">
                <div class="info">
                    <div class="name">${highlightMatch(p.name, query)}</div>
                    <div class="price">Rp ${formatPrice(p.price)}</div>
                </div>
                <span class="category">${p.category}</span>
            </div>
        `).join('');
        suggestions.classList.add('active');
    } else {
        suggestions.innerHTML = '<div class="suggestion-item"><div class="info"><div class="name">Tidak ada hasil</div></div></div>';
        suggestions.classList.add('active');
    }
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function selectSearchSuggestion(productId) {
    document.getElementById('searchSuggestions').classList.remove('active');
    document.getElementById('searchInput').value = '';
    openProductDetail(productId);
}

function searchProducts() {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        AppState.searchQuery = query;
        AppState.page = 1;
        applyFilters();
        document.getElementById('searchSuggestions').classList.remove('active');
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        
        showActiveFilter(`Pencarian: "${query}"`, () => {
            AppState.searchQuery = '';
            document.getElementById('searchInput').value = '';
            applyFilters();
        });
    }
}

function setupSearchAutocomplete() {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            document.getElementById('searchSuggestions').classList.remove('active');
        }
    });
}

// Product Detail Modal
function openProductDetail(productId) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;
    
    AppState.currentProduct = product;
    
    // Populate modal
    document.getElementById('modalMainImage').src = product.image;
    document.getElementById('modalVendor').textContent = product.vendor_name;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalSold').textContent = `${formatNumber(product.sold_count)} terjual • ${product.review_count} ulasan`;
    document.getElementById('modalPrice').textContent = `Rp ${formatPrice(product.price)}`;
    document.getElementById('modalDesc').textContent = product.description;
    
    // Original price & discount
    const originalPriceEl = document.getElementById('modalOriginalPrice');
    const discountEl = document.getElementById('modalDiscount');
    
    if (product.original_price) {
        originalPriceEl.textContent = `Rp ${formatPrice(product.original_price)}`;
        originalPriceEl.style.display = 'block';
        const discount = Math.round((1 - product.price / product.original_price) * 100);
        discountEl.textContent = `-${discount}%`;
        discountEl.style.display = 'block';
    } else {
        originalPriceEl.style.display = 'none';
        discountEl.style.display = 'none';
    }
    
    // Rating
    document.getElementById('modalRating').innerHTML = `
        ${renderStars(product.rating)}
        <span style="margin-left: 8px; color: var(--gray);">${product.rating}/5</span>
    `;
    
    // Stock
    const stockHtml = `
        <span class="indicator ${product.stock < 10 ? 'low' : ''} ${product.stock === 0 ? 'out' : ''}"></span>
        <span>${product.stock === 0 ? 'Stok habis' : product.stock < 10 ? `Sisa ${product.stock} unit - Segera checkout!` : `Stok tersedia: ${product.stock} unit`}</span>
    `;
    document.getElementById('modalStock').innerHTML = stockHtml;
    
    // Thumbnails
    const thumbnails = product.images ? product.images.map((img, idx) => `
        <img src="${img}" onclick="changeModalImage('${img}', this)" class="${idx === 0 ? 'active' : ''}" alt="">
    `).join('') : `<img src="${product.image}" class="active" alt="">`;
    document.getElementById('modalThumbnails').innerHTML = thumbnails;
    
    // Variants
    if (product.variants && Object.keys(product.variants).length > 0) {
        const variantHtml = Object.entries(product.variants).map(([type, options]) => `
            <div class="variant-title">${type}</div>
            <div class="variant-options" data-type="${type}">
                ${options.map((opt, idx) => `
                    <button class="variant-btn ${idx === 0 ? 'active' : ''}" 
                            onclick="selectVariant(this, '${type}', '${opt}')">${opt}</button>
                `).join('')}
            </div>
        `).join('');
        document.getElementById('modalVariants').innerHTML = variantHtml;
    } else {
        document.getElementById('modalVariants').innerHTML = '';
    }
    
    // Quantity
    const qtyInput = document.getElementById('modalQty');
    qtyInput.value = 1;
    qtyInput.max = product.stock;
    qtyInput.disabled = product.stock === 0;
    
    // Wishlist button state
    updateModalWishlistButton();
    
    // Reviews
    loadProductReviews(productId);
    
    // Show modal
    openModal('product');
    
    // Track view for AI
    if (AppState.user) {
        trackProductView(productId);
    }
}

function changeModalImage(src, thumb) {
    document.getElementById('modalMainImage').src = src;
    document.querySelectorAll('.thumbnail-list img').forEach(img => img.classList.remove('active'));
    if (thumb) thumb.classList.add('active');
}

function selectVariant(btn, type, value) {
    const container = btn.parentElement;
    container.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function adjustQty(delta) {
    const input = document.getElementById('modalQty');
    const newVal = parseInt(input.value) + delta;
    const max = parseInt(input.max) || 99;
    
    if (newVal >= 1 && newVal <= max) {
        input.value = newVal;
    }
}

function addToCartFromModal() {
    if (!AppState.currentProduct) return;
    
    const qty = parseInt(document.getElementById('modalQty').value);
    const variants = {};
    
    // Get selected variants
    document.querySelectorAll('.variant-options').forEach(container => {
        const active = container.querySelector('.active');
        if (active) {
            const type = container.dataset.type;
            variants[type] = active.textContent;
        }
    });
    
    addToCart(AppState.currentProduct.id, qty, variants);
}

function shareProduct() {
    if (!AppState.currentProduct) return;
    
    const url = `${window.location.origin}/product/${AppState.currentProduct.id}`;
    
    if (navigator.share) {
        navigator.share({
            title: AppState.currentProduct.name,
            text: `Lihat ${AppState.currentProduct.name} di KimiShop!`,
            url: url
        });
    } else {
        // Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link produk disalin ke clipboard!', 'success');
        });
    }
}

// Reviews
function loadProductReviews(productId) {
    // Generate mock reviews
    const reviews = generateMockReviews(productId, Math.floor(Math.random() * 5) + 3);
    const product = AppState.products.find(p => p.id === productId);
    
    // Summary
    const avgRating = product.rating;
    const totalReviews = product.review_count;
    
    document.getElementById('reviewCount').textContent = `(${totalReviews} ulasan)`;
    
    // Rating distribution (mock)
    const distribution = [60, 25, 10, 3, 2]; // 5, 4, 3, 2, 1 stars
    
    document.getElementById('reviewsSummary').innerHTML = `
        <div class="rating-big">
            <div class="number">${avgRating}</div>
            <div class="stars">${renderStars(avgRating)}</div>
            <div class="count">${totalReviews} ulasan</div>
        </div>
        <div class="rating-bars">
            ${distribution.map((pct, idx) => `
                <div class="rating-bar">
                    <span>${5 - idx}</span>
                    <div class="bar">
                        <div class="fill" style="width: ${pct}%"></div>
                    </div>
                    <span>${pct}%</span>
                </div>
            `).join('')}
        </div>
    `;
    
    // Reviews list
    const reviewsList = document.getElementById('modalReviews');
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-center" style="color: var(--gray); padding: 20px;">Belum ada ulasan</p>';
    } else {
        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-author">
                        <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                            ${review.user_name.charAt(0)}
                        </div>
                        <div>
                            <div>${review.user_name}</div>
                            <div class="review-rating">${renderStars(review.rating)}</div>
                        </div>
                    </div>
                    <span class="review-date">${formatDate(review.created_at)}</span>
                </div>
                <p class="review-text">${review.comment}</p>
            </div>
        `).join('');
    }
    
    // Show/hide add review section based on auth
    const addReviewSection = document.getElementById('addReviewSection');
    if (addReviewSection) {
        addReviewSection.style.display = AppState.user ? 'block' : 'none';
    }
}

function setRating(rating) {
    AppState.currentRating = rating;
    const stars = document.querySelectorAll('#starRatingInput i');
    stars.forEach((star, idx) => {
        if (idx < rating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

function submitReview() {
    if (!AppState.user) {
        showToast('Silakan login untuk memberi ulasan', 'error');
        openModal('auth', 'login');
        return;
    }
    
    const comment = document.getElementById('reviewText').value.trim();
    if (!comment) {
        showToast('Mohon isi ulasan Anda', 'error');
        return;
    }
    if (AppState.currentRating === 0) {
        showToast('Mohon berikan rating', 'error');
        return;
    }
    
    // Simulate submission
    showToast('Ulasan berhasil dikirim! Menunggu moderasi.', 'success');
    document.getElementById('reviewText').value = '';
    setRating(0);
    
    // Reload reviews
    setTimeout(() => loadProductReviews(AppState.currentProduct.id), 500);
}

// UI Helpers
function openModal(type, tab = null) {
    const modal = document.getElementById(type + 'Modal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (tab && type === 'auth') {
            switchAuthTab(tab);
        }
    }
}

function closeModal(type) {
    const modal = document.getElementById(type + 'Modal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.getElementById('overlay').classList.remove('active');
    document.body.style.overflow = '';
}

function closeAllSidebars() {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('wishlistSidebar').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    const isActive = sidebar.classList.toggle('active');
    overlay.classList.toggle('active', isActive);
}

function toggleWishlist() {
    const sidebar = document.getElementById('wishlistSidebar');
    const overlay = document.getElementById('overlay');
    const isActive = sidebar.classList.toggle('active');
    overlay.classList.toggle('active', isActive);
}

function toggleChat() {
    const widget = document.getElementById('chatWidget');
    widget.classList.toggle('minimized');
    
    if (!widget.classList.contains('minimized')) {
        document.getElementById('chatNotif').style.display = 'none';
        document.getElementById('chatInput').focus();
    }
}

function toggleMobileMenu() {
    const nav = document.getElementById('categoryNav');
    nav.classList.toggle('active');
}

function toggleView(view) {
    const grid = document.getElementById('productGrid');
    const buttons = document.querySelectorAll('.view-toggle button');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('button').classList.add('active');
    
    if (view === 'list') {
        grid.style.gridTemplateColumns = '1fr';
    } else {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Format Helpers
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(price);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'jt';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'rb';
    }
    return num.toString();
}

function renderStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            html += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            html += '<i class="fas fa-star-half-alt"></i>';
        } else {
            html += '<i class="far fa-star"></i>';
        }
    }
    return html;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Hari ini';
    if (diff === 1) return 'Kemarin';
    if (diff < 7) return `${diff} hari yang lalu`;
    if (diff < 30) return `${Math.floor(diff / 7)} minggu yang lalu`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Auth Functions
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tabs button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tab + 'Tab').classList.add('active');
    
    document.getElementById('loginForm').classList.toggle('active', tab === 'login');
    document.getElementById('registerForm').classList.toggle('active', tab === 'register');
}

function togglePassword(icon) {
    const input = icon.previousElementSibling;
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    
    // Mock login
    const mockUser = {
        id: 1,
        name: 'John Doe',
        email: email,
        avatar: null
    };
    
    AppState.user = mockUser;
    localStorage.setItem('kimishop_user', JSON.stringify(mockUser));
    
    closeModal('auth');
    checkAuthStatus();
    showToast('Login berhasil! Selamat datang kembali.');
    loadAIRecommendations();
}

function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirm = formData.get('confirm');
    
    if (password !== confirm) {
        showToast('Password tidak cocok!', 'error');
        return;
    }
    
    showToast('Registrasi berhasil! Silakan login.');
    switchAuthTab('login');
}

function checkAuthStatus() {
    const userMenu = document.getElementById('userMenu');
    const loginIcon = document.getElementById('loginIcon');
    
    if (AppState.user) {
        userMenu.style.display = 'block';
        loginIcon.style.display = 'none';
    } else {
        userMenu.style.display = 'none';
        loginIcon.style.display = 'flex';
    }
}

function logout() {
    AppState.user = null;
    localStorage.removeItem('kimishop_user');
    localStorage.removeItem('kimishop_cart');
    localStorage.removeItem('kimishop_wishlist');
    
    AppState.cart = [];
    AppState.wishlist = [];
    
    updateCartUI();
    updateWishlistUI();
    checkAuthStatus();
    
    showToast('Berhasil logout');
    closeAllModals();
    
    // Hide AI recommendations
    document.getElementById('aiRecommendBox').style.display = 'none';
}

function showProfile() {
    if (!AppState.user) return;
    showToast('Fitur profil sedang dalam pengembangan');
}

function showOrders() {
    if (!AppState.user) {
        openModal('auth', 'login');
        return;
    }
    openModal('orders');
    renderOrdersList();
}

function showWishlist() {
    toggleWishlist();
}

function showAllVendors() {
    showToast('Menampilkan semua toko...');
    // Could open a vendors page/modal
}

// Newsletter
function subscribeNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    showToast(`Terima kasih! ${email} telah berlangganan newsletter.`);
    e.target.reset();
}

// Tracking
function trackOrder() {
    closeModal('checkout');
    openModal('tracking');
}

function trackOrderQuery() {
    const number = document.getElementById('trackingNumber').value.trim();
    if (!number) {
        showToast('Mohon masukkan nomor pesanan', 'error');
        return;
    }
    
    // Mock tracking result
    const result = document.getElementById('trackingResult');
    result.innerHTML = `
        <div class="tracking-header">
            <h4>Pesanan ${number}</h4>
            <div class="tracking-status status-shipped">
                <i class="fas fa-truck"></i> Dalam Pengiriman
            </div>
            <p style="margin-top: 8px; color: var(--gray);">Estimasi tiba: 2-3 hari lagi</p>
        </div>
        <div class="tracking-timeline">
            <div class="timeline-item completed">
                <div class="timeline-content">
                    <div class="timeline-date"><i class="far fa-clock"></i> 14 Jan 2024, 09:30</div>
                    <div class="timeline-title">Pesanan Dibuat</div>
                    <div class="timeline-desc">Pembayaran berhasil dikonfirmasi</div>
                </div>
            </div>
            <div class="timeline-item completed">
                <div class="timeline-content">
                    <div class="timeline-date"><i class="far fa-clock"></i> 14 Jan 2024, 14:15</div>
                    <div class="timeline-title">Sedang Diproses</div>
                    <div class="timeline-desc">Penjual sedang menyiapkan pesanan</div>
                </div>
            </div>
            <div class="timeline-item completed">
                <div class="timeline-content">
                    <div class="timeline-date"><i class="far fa-clock"></i> 15 Jan 2024, 08:45</div>
                    <div class="timeline-title">Dikirim</div>
                    <div class="timeline-desc">Pesanan dalam perjalanan ke alamat Anda</div>
                </div>
            </div>
            <div class="timeline-item active">
                <div class="timeline-content">
                    <div class="timeline-date"><i class="far fa-clock"></i> Sedang berlangsung</div>
                    <div class="timeline-title">Tiba di Sortir Center</div>
                    <div class="timeline-desc">Paket sedang diproses di Jakarta Sortir Center</div>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-date">Menunggu</div>
                    <div class="timeline-title">Out for Delivery</div>
                    <div class="timeline-desc">Kurir akan mengantar pesanan ke alamat Anda</div>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-date">Menunggu</div>
                    <div class="timeline-title">Pesanan Selesai</div>
                    <div class="timeline-desc">Pesanan berhasil diterima</div>
                </div>
            </div>
        </div>
    `;
    result.classList.add('active');
}

// Orders
function renderOrdersList(status = 'all') {
    const list = document.getElementById('ordersList');
    
    // Mock orders
    const orders = [
        { id: 'ORD-20240115-001', date: '15 Jan 2024', status: 'delivered', total: 19999000, items: [MOCK_PRODUCTS[0]] },
        { id: 'ORD-20240114-002', date: '14 Jan 2024', status: 'shipped', total: 4999000, items: [MOCK_PRODUCTS[2]] },
        { id: 'ORD-20240113-003', date: '13 Jan 2024', status: 'processing', total: 2899000, items: [MOCK_PRODUCTS[6]] },
        { id: 'ORD-20240110-004', date: '10 Jan 2024', status: 'pending', total: 450000, items: [MOCK_PRODUCTS[20]] }
    ].filter(o => status === 'all' || o.status === status);
    
    if (orders.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h4>Tidak ada pesanan</h4>
                <p>Anda belum memiliki pesanan dengan status ini</p>
            </div>
        `;
        return;
    }
    
    const statusLabels = {
        pending: { text: 'Menunggu Pembayaran', class: 'status-pending' },
        processing: { text: 'Sedang Diproses', class: 'status-processing' },
        shipped: { text: 'Dalam Pengiriman', class: 'status-shipped' },
        delivered: { text: 'Selesai', class: 'status-delivered' }
    };
    
    list.innerHTML = orders.map(order => {
        const status = statusLabels[order.status];
        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-number">${order.id}</div>
                        <div class="order-date">${order.date}</div>
                    </div>
                    <span class="tracking-status ${status.class}">${status.text}</span>
                </div>
                <div class="order-items-preview">
                    ${order.items.map(item => `<img src="${item.image}" alt="${item.name}">`).join('')}
                </div>
                <div class="order-footer">
                    <div class="order-total">
                        Total: <strong>Rp ${formatPrice(order.total)}</strong>
                    </div>
                    <div class="order-actions">
                        <button class="btn-outline-sm" onclick="trackOrderQueryById('${order.id}')">Lacak</button>
                        ${order.status === 'delivered' ? '<button class="btn-primary-sm">Beli Lagi</button>' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterOrders(status) {
    document.querySelectorAll('.orders-tabs button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderOrdersList(status);
}

function trackOrderQueryById(orderId) {
    document.getElementById('trackingNumber').value = orderId;
    closeModal('orders');
    openModal('tracking');
    trackOrderQuery();
}

// AI Functions
function loadAIRecommendations() {
    const container = document.getElementById('aiRecommendBox');
    const productsContainer = document.getElementById('aiProducts');
    
    if (!AppState.user) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    
    // Mock AI recommendations based on random selection
    const recommendations = MOCK_PRODUCTS
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(product => ({
            product,
            reason: ['Sering dilihat bersamaan', 'Berdasarkan histori belanja', 'Trending di kategori ini'][Math.floor(Math.random() * 3)]
        }));
    
    productsContainer.innerHTML = recommendations.map(rec => `
        <div class="ai-product-card" onclick="openProductDetail(${rec.product.id})">
            <img src="${rec.product.image}" alt="${rec.product.name}">
            <div class="ai-product-info">
                <h4>${rec.product.name}</h4>
                <div class="price">Rp ${formatPrice(rec.product.price)}</div>
                <div class="ai-reason">
                    <i class="fas fa-magic"></i> ${rec.reason}
                </div>
            </div>
        </div>
    `).join('');
}

function trackProductView(productId) {
    // Mock tracking
    console.log('Tracked view for product:', productId);
}

// Province/City Data
const PROVINCES = [
    { id: 1, name: 'DKI Jakarta', cities: ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur'] },
    { id: 2, name: 'Jawa Barat', cities: ['Bandung', 'Bekasi', 'Bogor', 'Depok', 'Cimahi'] },
    { id: 3, name: 'Jawa Tengah', cities: ['Semarang', 'Solo', 'Yogyakarta', 'Magelang', 'Purwokerto'] },
    { id: 4, name: 'Jawa Timur', cities: ['Surabaya', 'Malang', 'Sidoarjo', 'Gresik', 'Mojokerto'] },
    { id: 5, name: 'Banten', cities: ['Tangerang', 'South Tangerang', 'Serang', 'Cilegon'] }
];

// Load provinces on checkout
function loadProvinces() {
    const select = document.getElementById('provinceSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Pilih Provinsi</option>';
    PROVINCES.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });
}

function loadCities() {
    const provinceId = document.getElementById('provinceSelect').value;
    const citySelect = document.getElementById('citySelect');
    
    if (!provinceId) {
        citySelect.innerHTML = '<option value="">Pilih Kota</option>';
        return;
    }
    
    const province = PROVINCES.find(p => p.id == provinceId);
    citySelect.innerHTML = '<option value="">Pilih Kota</option>';
    province.cities.forEach(city => {
        citySelect.innerHTML += `<option value="${city}">${city}</option>`;
    });
}

// Initialize provinces when checkout opens
document.addEventListener('DOMContentLoaded', () => {
    loadProvinces();
});