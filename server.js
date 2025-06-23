const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { connectToDB, Dish } = require('./db');
const { addDish, getDishes, updateDish, deleteDish } = require('./dishesController');

const app = express();
const PORT = 3000;


// Підключення до БД
connectToDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Перевірка наявності папки для зображень
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Маршрути
app.post('/api/dishes', upload.single('image'), addDish);

// Обробка оновлення страви
app.put('/api/dishes/:id', upload.single('image'), async (req, res) => {
  try {
    const updated = await updateDish(req.params.id, req.body, req.file);
    res.json(updated);
  } catch (err) {
    console.error('Помилка оновлення страви:', err);
    res.status(500).json({ error: 'Помилка оновлення' });
  }
});

// Обробка видалення
app.delete('/api/dishes/:id', async (req, res) => {
  try {
    await deleteDish(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Помилка при видаленні' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

app.get('/api/dishes', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const skip = (page - 1) * limit;

  const total = await Dish.countDocuments();
  const dishes = await Dish.find().skip(skip).limit(limit);

  res.json({
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: dishes
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});