// ------DAC -----
let total = 0;
// Khai báo biến toàn cục để lưu trữ cartItems
updateShoppingBagIcon();
document.addEventListener('DOMContentLoaded', function() {
    fetchCartItemsFromDatabase();
});

const user1 = JSON.parse(sessionStorage.getItem('user'));
const allowedUsername = user1.user.Mail;

async function fetchCartItemsFromDatabase() {
    try {
        const response = await fetch('http://localhost:3001/cart-items');
        if (!response.ok) {
            throw new Error('Failed to fetch cart items');
        }

        const data = await response.json();
        const cartItems = data.cartItems;
        
        cartItems.forEach(item => {
            if (item.username === allowedUsername) {
                addCart(item);
            }
        });
    } catch (error) {
        console.error('Error fetching cart items:', error);
    }
}

function addCart(item) {
    const { PID, Price, Image, Name, Weight, Material, Size, Quantity } = item;
    const cartBody = document.querySelector(".cart__checkout");

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart__checkoutBody");

    cartItem.innerHTML = `
    <div class="cart__Body-item">
        <div class="cart__Body-item__info">
            <div class="cart__Body-item__image">
                <img src="${Image}" alt="${Name}">
            </div>
            <div class="product-info">
                <div class="product-info__pricename">
                    <span class="product__atrribute-name">${Name}</span>
                    <span class="product__atrribute-price">VND${Price.toLocaleString()}</span>
                </div>
                <span class="product__atrribute-ID">${PID}</span>
                <span class="product__atrribute-weight">Weight: ${Weight}</span>
                <span class="product__atrribute-material">Material: ${Material}</span>
                <span class="product__atrribute-size">Size: ${Size}</span>
                <span class="product__atrribute-size">Quantity:
                    <span class="product__atrribute-size__quantity">${Quantity}</span>
                </span>

                <div class="cart__function">
                    <div class="cart__Body-item__btn">
                        <button class="cart__Body-item__btn addup">
                            <a href="../sale_page/index.html">Add Another Item</a>
                        </button>
                        <button class="cart__Body-item__btn wishlist">Add To Wishlist</button>
                        <button class="cart__Body-item__btn message">Add Gift Message</button>
                    </div>

                    <div class="cart__select">
                        <label class="label-cart" for="Wrapping-${PID}">
                            <input type="checkbox" id="Wrapping-${PID}">
                            <span class="custom-checkbox-label">Add Gift Wrapping</span>
                            <div class="custom-message">A complementary Bijou shopping bag is included with every item. Boutique pickup orders will not be gift-wrapped so you can verify your order; however, you may request it from the boutique team upon arrival.</div>
                        </label>
                    </div>

                    <div class="message-box">
                        <textarea class="message-box-input"></textarea>
                        <div class="message-box__btn">
                            <button class="message-box-confirm">Confirm</button>
                            <button class="message-box-cancel">Cancel</button>
                        </div>
                    </div>
                    <div class="overlay"></div>
                </div>
                </div>
                    <i class="delete-cart fa-solid fa-xmark"></i>
                </div>
            </div>
        </div>
    </div>
        </div>
    `;
    
     // Wrapping caret
     const checkboxLabel = cartItem.querySelector('.custom-checkbox-label');
     const caret = document.createElement('span');
     caret.classList.add('caret');
     const message = checkboxLabel.nextElementSibling;
 
     checkboxLabel.addEventListener('click', () => {
         message.style.display = message.style.display === 'block' ? 'none' : 'block';
         if (message.style.display === 'block') {
             checkboxLabel.insertBefore(caret,checkboxLabel.firstChild);
         } else {
             caret.remove();
         }
     });
     // Add event listener to delete button
     const deleteButton = cartItem.querySelector('.delete-cart');
     if (deleteButton) {
         deleteButton.addEventListener('click', (event) => {
             console.log('Deleting PID:', PID);
             if (PID) {
                 cartItem.remove();
                 deleteCartItemFromDatabase(PID);
                 calculateTotal();
             } else {
                 console.error('Failed to get product ID for deletion');
             }
         });
     } else {
         console.error('Delete button not found in cart item');
     }
     
    cartBody.appendChild(cartItem);
    calculateTotal();
}

async function deleteCartItemFromDatabase(pid) {
    try {
        const response = await fetch(`http://localhost:3001/cart-items/${pid}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete cart item');
        }

        console.log('Cart item deleted successfully');
        
        // Loại bỏ phần tử khỏi giao diện
        const cartItem = document.querySelector(`.cart__checkoutBody[data-pid="${pid}"]`);
        if (cartItem) {
            cartItem.remove();
        } else {
            console.error('Failed to find cart item with PID:', pid);
        }
        
        // Tính toán lại tổng số tiền
        const deletedItem = cartItems.find(item => item.PID === pid);
        cupdateTotal();
        
        // Cập nhật biểu tượng giỏ hàng
        updateShoppingBagIcon();
        
    } catch (error) {
        console.error('Error deleting cart item:', error);
    }
}




function calculateTotal() {
    let total = 0;

    // Lặp qua từng sản phẩm trong giỏ hàng và tính tổng số tiền
    const cartItemsElements = document.querySelectorAll('.cart__checkoutBody');
    cartItemsElements.forEach(cartItemElement => {
        const priceElement = cartItemElement.querySelector('.product__atrribute-price');
        const quantityElement = cartItemElement.querySelector('.product__atrribute-size__quantity');

        // Kiểm tra nếu priceElement và quantityElement không null
        if (priceElement && quantityElement) {
            // Lấy giá và số lượng từ các phần tử HTML
            const price = parseFloat(priceElement.textContent.replace('VND', '').replace(/,/g, '')); // Chuyển đổi giá từ chuỗi sang số và loại bỏ ký tự 'VND'
            const quantity = parseInt(quantityElement.textContent);
            console.log("Price", price);
            console.log("quantity", quantity);
            // Tính tổng số tiền
            total += price * quantity;
        }
    });

    // Hiển thị tổng giá trị vào phần tổng cộng của giỏ hàng
    const totalSubtotalElement = document.querySelector(".cart__checkout-total");
    if (totalSubtotalElement) {
        totalSubtotalElement.textContent = "SUBTOTAL: VND " + total.toLocaleString();
    }
}





// function updateTotal() {
//     // Reset total
//     total = 0;
    
//     // Tính lại tổng số tiền từ cartItems mới
//     cartItems.forEach(item => {
//         const { Price, Quantity } = item;
//         total += Price * Quantity;
//     });

//     // Hiển thị tổng giá trị vào phần tổng cộng của giỏ hàng
//     const totalSubtotalElement = document.querySelector(".cart__checkout-total");
//     totalSubtotalElement.textContent = "SUBTOTAL: VND" + total.toLocaleString();
// }


// ------DAC -----

// wrapping caret
// const checkboxLabel = document.querySelector('.custom-checkbox-label');
// const caret = document.createElement('span');
// caret.classList.add('caret');
// const message = checkboxLabel.nextElementSibling;

// checkboxLabel.addEventListener('click', () => {
//   message.style.display = message.style.display === 'block' ? 'none' : 'block';
//   if (message.style.display === 'block') {
//     checkboxLabel.insertBefore(caret,checkboxLabel.firstChild);
//   } else {
//     caret.remove();
//   }
// });

// fit position cho cai content box
const adjustMessagePosition = () => {
  const messageWidth = message.offsetWidth;
  const messageHeight = message.offsetHeight;
  const labelWidth = checkboxLabel.offsetWidth;
  const labelHeight = checkboxLabel.offsetHeight;
  const caretWidth = caret.offsetWidth;

  message.style.left = '0';
  message.style.top = `${labelHeight}px`;

  if (messageWidth > labelWidth) {
    message.style.width = '400px';
  } else {
    message.style.width = 'auto';
  }
};

window.addEventListener('load', adjustMessagePosition);
window.addEventListener('resize', adjustMessagePosition);
checkboxLabel.addEventListener('click', adjustMessagePosition);

//gift message 
const messageBoxes = document.querySelectorAll('.message-box');
const messageBoxInputs = document.querySelectorAll('.message-box-input');
const messageBoxConfirms = document.querySelectorAll('.message-box-confirm');
const messageBoxCancels= document.querySelectorAll('.message-box-cancel');
const messageButtons = document.querySelectorAll('.cart__Body-item__btn.message');
const overlay = document.querySelector('.overllay');

messageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    messageBoxes.forEach((box) => {
      box.style.display = 'block';
    });
    messageBoxInputs.forEach((input) => {
      input.focus();
    });
    overlay.style.display = 'block';
  });
});

//confirm this tat
messageBoxConfirms.forEach((confirm) => {
    confirm.addEventListener('click', () => {
      messageBoxes.forEach((box) => {
        box.style.display = 'none';
      });
      overlay.style.display = 'none';
    });
  });


  messageBoxCancels.forEach((cancel) => {
    cancel.addEventListener('click', () => {
      messageBoxes.forEach((box) => {
        box.style.display = 'none';
      });
      overlay.style.display = 'none';
    });
  });
  
document.addEventListener('click', (event) => {
  if (event.target === overlay) {
    messageBoxes.forEach((box) => {
      box.style.display = 'none';
    });
    // overlay.style.display = 'none';
    overlay.style.display = 'block';
  }
});

//add wishlist
const wishlistButtons = document.querySelectorAll('.cart__Body-item__btn.wishlist');
const headerWishlist = document.querySelector('.quanityheart');

wishlistButtons.forEach(wishlistButton => {
  wishlistButton.addEventListener('click', () => {
    let currentQuantity = parseInt(headerWishlist.textContent);
    if (currentQuantity < 9) {
      headerWishlist.textContent = currentQuantity + 1;
    } else {
      headerWishlist.textContent = '9+';
    }
  });
});


// ---- DAC ------

async function updateShoppingBagIcon() {
    const user1 = JSON.parse(sessionStorage.getItem('user'));
    const userMail = user1.user.Mail;
    console.log('user mail:', userMail);
      try {
          const response = await fetch('http://localhost:3001/cart-items');
          const data = await response.json();
          
          // Debugging step to inspect data structure
          console.log('Fetched data:', data);
  
          // Access the cartItems array within the fetched data
          const items = data.cartItems;
  
          if (Array.isArray(items)) {
              // Filter the items based on the allowed username
              const userItems = items.filter(item => item.username === userMail);
  
              // Calculate the total quantity of the filtered items
              let totalQuantity = 0;
              for (const item of userItems) {
                  totalQuantity += item.Quantity;
              }
  
              // Debugging step to check total quantity
              console.log('Total quantity for user:', totalQuantity);
  
              // Update the shopping bag icon with the total quantity
              const headerShoppingBag = document.querySelector('.quanity');
              if (headerShoppingBag) {
                  headerShoppingBag.textContent = totalQuantity;
              }
          } else {
            showAlert('Failed to add product to cart');
            console.log('Failed to add product to cart:', productName);
          }
        } catch (error) {
          console.error('Error adding product to cart:', error);
          showAlert('Error adding product to cart');
        }
  }
// ---- DAC -----