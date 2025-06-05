const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

const {
  getAllTyres,
  getMyTyres,
  getTyreById,
  createTyre,
  updateTyre,
  activateTyre,
  renewTyre,
  deleteTyre,
  removeFromActiveTyres,
  getTyresByIds,
  slugRedirect,
} = require('../controllers/tyres/tyreController');

// 👉 Отримати всі шини
router.get('/', getAllTyres);

// 👉 Отримати мої шини
router.get('/my', auth, getMyTyres);

// 👉 Отримати шину за ID
router.get('/:id', optionalAuth, getTyreById);

// 👉 Створити нову шину (потрібен токен)
router.post('/', auth, createTyre);

// 👉 Оновити оголошення (потрібен токен)
router.patch('/:id', auth, updateTyre);

// 👉 Продовжити публікацію ще на 30 днів
router.patch('/:id/renew', auth, renewTyre);

router.patch('/:id/activate', auth, activateTyre);

// 👉 Видалити оголошення
router.delete('/:id', auth, deleteTyre);

// 👉 Деактивація оголошення
router.put('/:id', auth, removeFromActiveTyres);

router.post('/by-ids', auth, getTyresByIds);

router.get('/tyres/:id/:slug', slugRedirect)

module.exports = router;
