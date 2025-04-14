const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  getAllTyres,
  getTyreById,
  createTyre,
  updateTyre,
  renewTyre,
  deleteTyre,
} = require('../controllers/tyres/tyreController');

// 👉 Отримати всі шини
router.get('/', getAllTyres);

// 👉 Отримати шину за ID
router.get('/:id', getTyreById);

// 👉 Створити нову шину (потрібен токен)
router.post('/', auth, createTyre);

// 👉 Оновити оголошення (потрібен токен)
router.put('/:id', auth, updateTyre);

// 👉 Продовжити публікацію ще на 30 днів
router.patch('/:id/renew', auth, renewTyre);

// 👉 Видалити оголошення
router.delete('/:id', auth, deleteTyre);

module.exports = router;
