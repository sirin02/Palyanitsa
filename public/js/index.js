let currentEditingId = null;

let currentPage = 1;
const limit = 6; // кількість страв на сторінку
let allDishes = [];

let searchQuery = '';

async function loadDishes(page = 1) {
  try {
    const res = await fetch(`/api/dishes?page=${page}&limit=${limit}`);
    const { data, totalPages, currentPage: returnedPage } = await res.json();

    allDishes = data; 
    renderDishes(allDishes);
    renderPagination(totalPages, returnedPage);
  } catch (err) {
    console.error('Помилка при завантаженні страв:', err);
  }
}


function renderPagination(totalPages, currentPage) {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;
    btn.className = (i === currentPage) ? 'active' : '';
    btn.addEventListener('click', () => loadDishes(i));
    pagination.appendChild(btn);
  }
}

loadDishes();

function renderDishes(data) {
  const dishList = document.getElementById('dishList');
  dishList.innerHTML = '';

  data.forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card dish-info';
    card.dataset.id = dish._id;

    const img = document.createElement('img');
    img.src = dish.imageUrl;
    img.alt = dish.name;

    const info = document.createElement('div');
    info.className = 'dish-info';

    info.innerHTML = `
      <h3>${dish.name}</h3>
      <p><strong class="text-italic">Категорія:</strong> ${dish.category}</p>
      <p><strong class="text-italic">Інгредієнти:</strong> ${dish.ingredients}</p>
      <strong class="text-price text-italic">${dish.price} грн</strong>
    `;

    // Кнопка "Редагувати"
    const editBtn = document.createElement('button');
    editBtn.className = 'btn';

    const editIcon = document.createElement('i');
    editIcon.className = 'fa fa-refresh';

    editBtn.appendChild(editIcon);
    editBtn.addEventListener('click', () => {
      openEditModal(dish);
    });

    // Кнопка "Видалити"
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn';

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fa fa-trash';

    deleteBtn.appendChild(deleteIcon);
    deleteBtn.addEventListener('click', async () => {
      if (confirm(`Ви впевнені, що хочете видалити "${dish.name}"?`)) {
        try {
          const res = await fetch(`/api/dishes/${dish._id}`, {
            method: 'DELETE',
          });

          if (res.ok) {
            alert('Страву видалено!');
            card.remove();
            allDishes = allDishes.filter(d => d._id !== dish._id);
          } else {
            const errData = await res.json();
            alert(errData.error || 'Помилка при видаленні');
          }
        } catch (err) {
          alert('Помилка з’єднання з сервером');
        }
      }
    });

    const cartBtn = document.createElement('button');
    cartBtn.className = 'btn';

    const cartIcon = document.createElement('i');
    cartIcon.className = 'fa fa-shopping-cart';

    cartBtn.appendChild(cartIcon);
    cartBtn.addEventListener('click', () => {
      addToCart(dish);
    });

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);
    btnGroup.appendChild(cartBtn);

    card.appendChild(img);
    card.appendChild(info);
    card.appendChild(btnGroup);
    dishList.appendChild(card);
  });
}

// Обробка пошуку
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();

  if (!query) {
    renderDishes(allDishes);
    return;
  }

  // Фільтруємо по назві, опису і навіть ціні (конвертуємо в рядок)
  const filtered = allDishes.filter(dish => {
    return (
      dish.name.toLowerCase().includes(query) ||
      dish.description.toLowerCase().includes(query)
    );
  });

  renderDishes(filtered);
});

const sortSelect = document.getElementById('sortSelect');

function applyFiltersAndSort() {
  let filtered = allDishes;

  // Фільтрація по пошуку
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  if (query) {
    filtered = filtered.filter(dish =>
      dish.name.toLowerCase().includes(query) ||
      dish.ingredients.toLowerCase().includes(query) ||
      dish.category.toLowerCase().includes(query)
    );
  }

  // Обробка сортування/фільтрації за вибором
  const sortType = sortSelect.value;

  if (sortType === 'noMeat') {
    filtered = filtered.filter(dish => !dish.ingredients.toLowerCase().includes('мясо') && !dish.ingredients.toLowerCase().includes("м'ясо"));
  } else {
    switch (sortType) {
      case 'priceDesc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'priceAsc':
        filtered.sort((a, b) => a.price - b.price);
        break;
    }
  }

  renderDishes(filtered);
}

// Викликаємо applyFiltersAndSort при зміні select і input
document.getElementById('searchInput').addEventListener('input', applyFiltersAndSort);
sortSelect.addEventListener('change', applyFiltersAndSort);

// Після завантаження страв
loadDishes().then(() => {
  sortSelect.value = 'priceAsc';
  applyFiltersAndSort();
});

const modal = document.getElementById("dishModal");
const btn = document.getElementById("addDishBtn");
const span = document.getElementById("closeModal");
const form = document.getElementById("addDishForm");
const resultMessage = document.getElementById("resultMessage");

btn.onclick = function () {
  modal.style.display = "block";
}

span.onclick = function () {
  modal.style.display = "none";
  form.reset();
  resultMessage.textContent = '';
}

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
    form.reset();
    resultMessage.textContent = '';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const ingredients = form.ingredients.value.trim();
  const category = form.category.value.trim();
  const price = parseFloat(form.price.value);
  const image = form.image.files[0];

  if (!name || !ingredients || !category || isNaN(price) || price <= 0 || !image) {
    resultMessage.textContent = '❌ Заповніть усі поля коректно';
    return;
  }

  const formData = new FormData(form);

  try {
    const response = await fetch('/api/dishes', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      resultMessage.textContent = '✅ Страву додано!';
      loadDishes();
      modal.style.display = "none";
      form.reset();
    } else {
      resultMessage.textContent = '❌ Помилка: ' + (data.error || 'Невідома помилка');
    }
  } catch (err) {
    resultMessage.textContent = '❌ Сервер недоступний';
  }
});


const editModal = document.getElementById('editModal');
const closeEditModalBtn = document.getElementById('closeEditModal');
const editDishForm = document.getElementById('editDishForm');

let currentEditingDishId = null;

function openEditModal(dish) {
  currentEditingDishId = dish._id;

  // Заповнюємо поля форми
  editDishForm.name.value = dish.name;
  editDishForm.ingredients.value = dish.ingredients;
  editDishForm.category.value = dish.category;
  editDishForm.price.value = dish.price;
  editDishForm.image.value = ''; // Очистити вибір файлу

  // Відкрити модалку
  editModal.style.display = 'flex';
}

// Закриття модалки по кліку на "х"
closeEditModalBtn.addEventListener('click', () => {
  editModal.style.display = 'none';
});

// Закриття модалки, якщо клікнули поза контентом
window.addEventListener('click', (e) => {
  if (e.target === editModal) {
    editModal.style.display = 'none';
  }
});

// Обробка сабміту форми редагування
editDishForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('name', editDishForm.name.value);
  formData.append('ingredients', editDishForm.ingredients.value);
  formData.append('category', editDishForm.category.value);
  formData.append('price', parseFloat(editDishForm.price.value));

  if (editDishForm.image.files.length > 0) {
    formData.append('image', editDishForm.image.files[0]);
  }

  try {
    const res = await fetch(`/api/dishes/${currentEditingDishId}`, {
      method: 'PUT',
      body: formData,
    });

    if (res.ok) {
      alert('Страву успішно оновлено!');
      editModal.style.display = 'none';
      loadDishes(); // Функція для повторного завантаження списку страв (треба її викликати або оновити сторінку)
    } else {
      const err = await res.json();
      alert(err.error || 'Помилка оновлення страви');
    }
  } catch (error) {
    alert('Помилка з’єднання з сервером');
  }
});

// Відкриття/закриття модального вікна
document.getElementById('openCartBtn').addEventListener('click', showCart);
document.getElementById('closeCart').addEventListener('click', () => {
  document.getElementById('cartModal').style.display = 'none';
});

document.getElementById('clearCartBtn').addEventListener('click', () => {
  if (confirm('Очистити кошик?')) {
    localStorage.removeItem('cart');
    showCart();
  }
});

function addToCart(dish) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item => item._id === dish._id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...dish, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`Страву "${dish.name}" додано до кошика`);
}

function showCart() {
  const modal = document.getElementById('cartModal');
  const cartItemsContainer = document.getElementById('cartItems');
  const totalPriceEl = document.getElementById('totalPrice');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Кошик порожній</p>';
    totalPriceEl.textContent = '0 грн';
    modal.style.display = 'block';
    return;
  }

  let total = 0;

  cart.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <strong>${item.name}</strong> — ${item.price} грн × 
      <input type="number" min="1" value="${item.quantity}" style="width: 70px;"> 
      = <span>${item.price * item.quantity} грн</span>
      <button class="remove-item">✖</button>
    `;

    // Зміна кількості
    const input = itemDiv.querySelector('input');
    input.addEventListener('change', () => {
      item.quantity = parseInt(input.value) || 1;
      localStorage.setItem('cart', JSON.stringify(cart));
      showCart();
    });

    // Видалення товару з кошика
    itemDiv.querySelector('.remove-item').addEventListener('click', () => {
      const updated = cart.filter(i => i._id !== item._id);
      localStorage.setItem('cart', JSON.stringify(updated));
      showCart();
    });

    total += item.price * item.quantity;
    cartItemsContainer.appendChild(itemDiv);
  });

  totalPriceEl.textContent = `${total} грн`;
  modal.style.display = 'block';
}
