// --- 1. Product Catalog Data ---
const products = [
    {
        id: 1,
        name: "Wireless ANC Headphones",
        category: "Audio",
        price: 99.99,
        rating: "⭐⭐⭐⭐⭐ (4.8)",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
    },
    {
        id: 2,
        name: "Smart Fitness Watch",
        category: "Wearables",
        price: 149.99,
        rating: "⭐⭐⭐⭐ (4.6)",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"
    },
    {
        id: 3,
        name: "Ultra-Thin Laptop 15\"",
        category: "Laptops",
        price: 899.99,
        rating: "⭐⭐⭐⭐⭐ (4.9)",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80"
    },
    {
        id: 4,
        name: "Mechanical Gaming Keyboard",
        category: "Gaming",
        price: 79.99,
        rating: "⭐⭐⭐⭐⭐ (4.7)",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80"
    },
    {
        id: 5,
        name: "Wireless Gaming Mouse",
        category: "Gaming",
        price: 49.99,
        rating: "⭐⭐⭐⭐ (4.5)",
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80"
    },
    {
        id: 6,
        name: "Bluetooth Portable Speaker",
        category: "Audio",
        price: 59.99,
        rating: "⭐⭐⭐⭐ (4.4)",
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80"
    }
];

// --- 2. State Management & LocalStorage ---
let cart = JSON.parse(localStorage.getItem("techbite_cart")) || [];

// --- 3. DOM Elements ---
const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const filterBtns = document.querySelectorAll(".filter-btn");
const noResults = document.getElementById("noResults");

// Cart Elements
const cartBtn = document.getElementById("cartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartCount = document.getElementById("cartCount");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartTax = document.getElementById("cartTax");
const cartTotal = document.getElementById("cartTotal");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

// Modal Elements
const checkoutModal = document.getElementById("checkoutModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalDoneBtn = document.getElementById("modalDoneBtn");
const orderSummary = document.getElementById("orderSummary");

// --- 4. Render Products Function ---
function renderProducts(itemsToRender) {
    productsGrid.innerHTML = "";
    
    if (itemsToRender.length === 0) {
        noResults.classList.remove("hidden");
        return;
    }
    noResults.classList.add("hidden");

    itemsToRender.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";
        card.innerHTML = `
            <div class="img-container">
                <img src="${product.image}" alt="${product.name}">
                <span class="product-category">${product.category}</span>
            </div>
            <div class="product-info">
                <div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-rating">${product.rating}</div>
                </div>
                <div class="product-bottom">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="add-btn" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// --- 5. Search & Filter Logic ---
let currentCategory = "all";

function filterAndSearchProducts() {
    const query = searchInput.value.toLowerCase().trim();
    
    const filtered = products.filter(product => {
        const matchesCategory = (currentCategory === "all" || product.category === currentCategory);
        const matchesSearch = product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });

    renderProducts(filtered);
}

searchInput.addEventListener("input", filterAndSearchProducts);

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.category;
        filterAndSearchProducts();
    });
});

// --- 6. Cart Functions ---
window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    saveCart();
    openCart();
};

window.changeQuantity = function(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }

    updateCartUI();
    saveCart();
};

window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    saveCart();
};

function saveCart() {
    localStorage.setItem("techbite_cart", JSON.stringify(cart));
}

function updateCartUI() {
    // 1. Total items count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // 2. Render Cart Items
    cartItemsContainer.innerHTML = "";
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p style="text-align:center; color:#64748b; margin-top:40px;">Your cart is empty.</p>`;
    } else {
        cart.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "cart-item";
            itemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    <div class="cart-qty-controls">
                        <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });
    }

    // 3. Price Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10; // 10% Tax
    const total = subtotal + tax;

    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    cartTax.textContent = `$${tax.toFixed(2)}`;
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Open & Close Drawer
function openCart() {
    cartDrawer.classList.add("open");
    overlay.classList.add("active");
}

function closeCart() {
    cartDrawer.classList.remove("open");
    overlay.classList.remove("active");
}

cartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
overlay.addEventListener("click", () => {
    closeCart();
    closeModal();
});

// Clear Cart
clearCartBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your cart?")) {
        cart = [];
        updateCartUI();
        saveCart();
    }
});

// --- 7. Checkout Modal ---
checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Your cart is empty! Add some products first.");
        return;
    }
    
    const total = cartTotal.textContent;
    orderSummary.innerHTML = `
        <p><strong>Items Ordered:</strong> ${cart.reduce((sum, i) => sum + i.quantity, 0)}</p>
        <p><strong>Total Paid:</strong> ${total}</p>
        <p><strong>Payment Method:</strong> Cash on Delivery / Card</p>
    `;
    
    closeCart();
    checkoutModal.classList.add("active");
    overlay.classList.add("active");

    // Clear cart on successful order
    cart = [];
    updateCartUI();
    saveCart();
});

function closeModal() {
    checkoutModal.classList.remove("active");
    overlay.classList.remove("active");
}

closeModalBtn.addEventListener("click", closeModal);
modalDoneBtn.addEventListener("click", closeModal);

// --- 8. Initial Execution ---
renderProducts(products);
updateCartUI();