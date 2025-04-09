const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllTyres,
  getTyreById,
  createTyre,
  updateTyre,
  deleteTyre,
} = require('../controllers/tyreController');

router.get('/', getAllTyres);
router.get('/:id', getTyreById);
router.post('/', auth, createTyre);
router.put('/:id', auth, updateTyre);
router.delete('/:id', auth, deleteTyre);

module.exports = router;
