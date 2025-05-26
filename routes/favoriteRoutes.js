const express = require('express');
const router = express.Router();
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} = require('../controllers/favorite/favoriteController');
const auth = require('../middleware/auth');

router.post('/', auth, addToFavorites);
router.delete('/:tyreId', auth, removeFromFavorites);
router.get('/ids', auth, getFavorites);

module.exports = router;
