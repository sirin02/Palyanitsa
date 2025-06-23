const mongoose = require('mongoose');

const connectToDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/palyanitsa', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Підключено до MongoDB');
  } catch (err) {
    console.error('❌ Помилка підключення до MongoDB:', err);
  }
};

// Схема для страв
const dishSchema = new mongoose.Schema({
  name: String,
  ingredients: String,
  category: String,
  price: Number,
  imageUrl: String,
});
const Dish = mongoose.model('Dish', dishSchema, 'products');

module.exports = {
  connectToDB,
  Dish,
};