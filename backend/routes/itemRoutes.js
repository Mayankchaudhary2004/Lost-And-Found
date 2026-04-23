const express = require('express');
const router = express.Router();
const {
  addItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  searchItems,
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

// All item routes are protected
router.use(protect);

// Search must come before /:id to avoid conflict
router.get('/search', searchItems);

router.post('/', addItem);
router.get('/', getAllItems);
router.get('/:id', getItemById);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
