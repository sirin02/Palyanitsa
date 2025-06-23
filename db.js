require('dotenv').config();

const mongoose = require('mongoose');

console.log('MONGODB_URI:', process.env.MONGODB_URI);

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
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