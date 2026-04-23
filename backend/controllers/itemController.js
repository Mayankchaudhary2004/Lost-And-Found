const Item = require('../models/Item');

// @desc    Add a new item
// @route   POST /api/items
// @access  Private
const addItem = async (req, res) => {
  const { itemName, description, type, category, location, date, contactInfo } = req.body;

  try {
    if (!itemName || !description || !type || !location || !contactInfo) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const item = await Item.create({
      itemName,
      description,
      type,
      category: category || 'Other',
      location,
      date: date || new Date(),
      contactInfo,
      reportedBy: req.user._id,
      reporterName: req.user.name,
    });

    res.status(201).json({ message: 'Item reported successfully', item });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error adding item' });
  }
};

// @desc    Get all items
// @route   GET /api/items
// @access  Private
const getAllItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching items' });
  }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Private
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching item' });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (only item owner)
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized. You can only update your own items.' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Item updated successfully', item: updatedItem });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error updating item' });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (only item owner)
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized. You can only delete your own items.' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error deleting item' });
  }
};

// @desc    Search items by name or category
// @route   GET /api/items/search?name=xyz&category=xyz&type=Lost
// @access  Private
const searchItems = async (req, res) => {
  try {
    const { name, category, type } = req.query;
    const query = {};

    if (name) {
      query.itemName = { $regex: name, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (type) {
      query.type = type;
    }

    const items = await Item.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error searching items' });
  }
};

module.exports = { addItem, getAllItems, getItemById, updateItem, deleteItem, searchItems };
