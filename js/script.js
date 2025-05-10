const productContainer = document.querySelector(".product-list");
const isProductDetailPage = document.querySelector(".product-detail");
const isCartPage = document.querySelector(".cart");

if (productContainer) {
    displayProducts();
}
if (isProductDetailPage) {
    displayProductDetail();
}
if (isCartPage) {
    displayCart();
}

function displayProducts() {
    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
            <div class="img-box">
                <img src="${product.colors[0].mainImage}">
            </div>
            <h2 class="title">${product.title}</h2>
            <span class="price">${product.price}</span>
        `;
        productContainer.appendChild(productCard);

        const imgBox = productCard.querySelector(".img-box");
        imgBox.addEventListener("click", () => {
            sessionStorage.setItem("selectedProduct", JSON.stringify(product));
            window.location.href = "product-detail.html";
        });
    });
}

function displayProductDetail() {
    const productData = JSON.parse(sessionStorage.getItem("selectedProduct"));

    const titleE1 = document.querySelector(".title");
    const priceE1 = document.querySelector(".price");
    const descriptionE1 = document.querySelector(".description");
    const mainImageContainer = document.querySelector(".main-img");
    const thumbnailContainer = document.querySelector(".thumbnail-list");
    const colorContainer = document.querySelector(".color-options");
    const sizeContainer = document.querySelector(".size-options");
    const addToCartBtn = document.querySelector("#add-cart-btn");

    let selectedColor = productData.colors[0];
    let selectedSize = selectedColor.sizes[0];

    function updateProductDisplay(colorData) {
        if (!colorData.sizes.includes(selectedSize)) {
            selectedSize = colorData.sizes[0];
        }

        // Main Image
        mainImageContainer.innerHTML = `<img src="${colorData.mainImage}">`;

        // Thumbnails
        thumbnailContainer.innerHTML = "";
        const allThumbnails = [colorData.mainImage, ...colorData.thumbnails.slice(0, 3)];
        allThumbnails.forEach(thumb => {
            const img = document.createElement("img");
            img.src = thumb;
            thumbnailContainer.appendChild(img);

            img.addEventListener("click", () => {
                mainImageContainer.innerHTML = `<img src="${thumb}">`;
            });
        });

        // Color Options
        colorContainer.innerHTML = "";
        productData.colors.forEach(color => {
            const img = document.createElement("img");
            img.src = color.mainImage;
            if (color.name === colorData.name) img.classList.add("selected");
            colorContainer.appendChild(img);

            img.addEventListener("click", () => {
                selectedColor = color;
                updateProductDisplay(color);
            });
        });

        // Size Options
        sizeContainer.innerHTML = "";
        colorData.sizes.forEach(size => {
            const btn = document.createElement("button");
            btn.textContent = size;
            if (size === selectedSize) btn.classList.add("selected");
            sizeContainer.appendChild(btn);

            btn.addEventListener("click", () => {
                document.querySelectorAll(".size-options button").forEach(el => el.classList.remove("selected"));
                btn.classList.add("selected");
                selectedSize = size;
            });
        });

        // Product Info
        titleE1.textContent = productData.title;
        priceE1.textContent = productData.price;
        descriptionE1.textContent = productData.description;
    }

    // Initial render
    updateProductDisplay(selectedColor);

    // Add to cart functionality
    addToCartBtn.addEventListener("click", () => {
        console.log("Add to Cart Button Clicked"); // Debugging log
        addToCart(productData, selectedColor, selectedSize);
        alert("Added to cart!");
        updateCartCount();  // Update the cart item count
        updateCartBadge();  // Trigger the bounce animation on cart icon
    });
    
}

function addToCart(product, color, size) {
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    console.log("Cart before add:", cart); // Debugging log to see cart before adding

    const existingItem = cart.find(item => item.id === product.id && item.color === color.name && item.size === size);
    console.log("Existing item:", existingItem); // Debugging log to check if the item exists

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: color.mainImage,
            color: color.name,
            size: size,
            quantity: 1
        });
    }

    sessionStorage.setItem("cart", JSON.stringify(cart));
    console.log("Cart after add:", cart); // Debugging log to see cart after adding
}

function displayCart() {
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];

    const cartItemsContainer = document.querySelector(".cart-items");
    const subtotalE1 = document.querySelector(".subtotal");
    const grandTotalE1 = document.querySelector(".grand-total");

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
        subtotalE1.textContent = "$0";
        grandTotalE1.textContent = "$0";
        return;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = parseFloat(item.price.replace("$", "")) * item.quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <div class="product">
                <img src="${item.image}">
                <div class="item-detail">
                    <p>${item.title}</p>
                    <div class="size-color-box">
                        <span class="size">${item.size}</span>
                        <span class="color">${item.color}</span>
                    </div>
                </div>
            </div>
            <span class="price">${item.price}</span>
            <div class="quantity"><input type="number" value="${item.quantity}" min="1" data-index="${index}"></div>
            <span class="total-price">$${itemTotal}</span>
            <button class="remove" data-index="${index}"><i class="ri-close-line"></i></button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    subtotalE1.textContent = `$${subtotal.toFixed(2)}`;
    grandTotalE1.textContent = `$${subtotal.toFixed(2)}`;
    updateCartCount();  // Update cart item count after displaying the cart

    // Add event listeners to remove buttons
    const removeButtons = document.querySelectorAll(".remove");
    removeButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const index = e.target.dataset.index;
            removeCartItem(index);
        });
    });

    // Add event listeners to quantity inputs
    const quantityInputs = document.querySelectorAll(".quantity input");
    quantityInputs.forEach(input => {
        input.addEventListener("change", (e) => {
            const index = e.target.dataset.index;
            const newQuantity = parseInt(e.target.value, 10);
            if (newQuantity > 0) {
                updateCartQuantity(index, newQuantity);
            }
        });
    });
}

function removeCartItem(index) {
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    cart.splice(index, 1); // Remove the item at the specified index
    sessionStorage.setItem("cart", JSON.stringify(cart));
    displayCart(); // Re-render the cart after removal
    updateCartCount(); // Update the cart count after removing an item
    updateCartBadge(); // Trigger bounce animation after removal
}

function updateCartQuantity(index, newQuantity) {
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    if (newQuantity > 0) {
        cart[index].quantity = newQuantity; // Update the quantity of the item
        sessionStorage.setItem("cart", JSON.stringify(cart));
        displayCart(); // Re-render the cart after updating quantity
        updateCartCount(); // Update the cart count after changing the quantity
        updateCartBadge(); // Trigger bounce animation after updating quantity
    }
}

// Update the cart count in the header
function updateCartCount() {
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    const countEl = document.querySelector(".cart-item-count");
    if (countEl) countEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.querySelector(".cart-item-count");
    const cartIcon = document.querySelector(".cart-icon");

    // Update badge count and visibility
    if (badge) {
        if (cartCount > 0) {
            badge.textContent = cartCount;
            badge.style.display = "block";
        } else {
            badge.style.display = "none";
        }
    }

    // Add bounce animation to the cart icon
    if (cartIcon) {
        cartIcon.classList.add("animate"); // Add bounce animation class
        setTimeout(() => {
            cartIcon.classList.remove("animate"); // Remove it after the animation ends
        }, 400); // Match this duration with the one set in the animation
    }
}

updateCartBadge(); // Initial call to update cart icon and badge
