const { Dish } = require('./db');

async function addDish(req, res) {
  try {
    const { name, ingredients, category, price } = req.body;

    if (!name || !ingredients || !category || !price) {
      return res.status(400).json({ error: 'Всі поля є обов’язковими' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newDish = new Dish({
      name,
      ingredients,
      category,
      price: parseFloat(price),
      imageUrl,
    });

    await newDish.save();
    res.status(201).json(newDish);
  } catch (err) {
    console.error('❌ Помилка при додаванні страви:', err);
    res.status(500).json({ error: 'Не вдалося додати страву' });
  }
}


async function getDishes(req, res) {
  try {
    const dishes = await Dish.find();
    res.json(dishes);
  } catch (err) {
    console.error('Помилка при отриманні страв:', err);
    res.status(500).json({ error: 'Не вдалося отримати страви' });
  }
}

// Оновлення
async function updateDish(id, updates) {
  return await Dish.findByIdAndUpdate(id, updates, { new: true });
}

// Видалення
async function deleteDish(id) {
  return await Dish.findByIdAndDelete(id);
}

module.exports = {
  addDish,
  getDishes,
  updateDish,
  deleteDish
};
