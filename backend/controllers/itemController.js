const ItemModel = require('../models/ItemModel');
const fs = require('fs');
const path = require('path');

class ItemController {
  
  static async create(req, res) {
    try {
      const { title, description, category, location, date, type } = req.body;
      const userId = req.user.id;
      
      const image = req.file ? req.file.filename : null;

      const itemData = {
        title,
        description,
        category,
        location,
        date,
        type,
        image,
        user_id: userId
      };

      const item = await ItemModel.create(itemData);

      res.status(201).json({
        success: true,
        message: 'Item posted successfully.',
        data: item
      });
    } catch (error) {
      console.error('Create item error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating item.',
        error: error.message
      });
    }
  }

  
  static async getAll(req, res) {
    try {
      const { type, search, limit = 100, offset = 0 } = req.query;
      
      let items;
      if (search) {
        items = await ItemModel.searchByTitle(search, limit, offset);
      } else if (type && ['Lost', 'Found'].includes(type)) {
        items = await ItemModel.getByType(type, limit, offset);
      } else {
        items = await ItemModel.getAll(limit, offset);
      }

      res.status(200).json({
        success: true,
        data: items,
        count: items.length
      });
    } catch (error) {
      console.error('Get items error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching items.',
        error: error.message
      });
    }
  }

  
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      const item = await ItemModel.findById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found.'
        });
      }

      const isOwner = req.user ? req.user.id === item.user_id : false;
      
      const isAdmin = req.user ? req.user.is_admin === true : false;

      res.status(200).json({
        success: true,
        data: {
          ...item,
          isOwner: isOwner || isAdmin 
        }
      });
    } catch (error) {
      console.error('Get item error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching item.',
        error: error.message
      });
    }
  }

  
  static async getUserItems(req, res) {
    try {
      const userId = req.user.id;
      const items = await ItemModel.findByUserId(userId);

      res.status(200).json({
        success: true,
        data: items,
        count: items.length
      });
    } catch (error) {
      console.error('Get user items error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user items.',
        error: error.message
      });
    }
  }

  
  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { title, description, category, location, date, type } = req.body;

      const existingItem = await ItemModel.findById(id);
      if (!existingItem) {
        return res.status(404).json({
          success: false,
          message: 'Item not found.'
        });
      }

      if (existingItem.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to edit this item.'
        });
      }

      const updateData = { title, description, category, location, date, type };

      if (req.file) {
        if (existingItem.image) {
          const oldImagePath = path.join(__dirname, '../uploads', existingItem.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        updateData.image = req.file.filename;
      }

      const updatedItem = await ItemModel.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Item updated successfully.',
        data: updatedItem
      });
    } catch (error) {
      console.error('Update item error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating item.',
        error: error.message
      });
    }
  }

  
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const isAdmin = req.user.is_admin === true; 

      const existingItem = await ItemModel.findById(id);
      if (!existingItem) {
        return res.status(404).json({
          success: false,
          message: 'Item not found.'
        });
      }

      
      if (existingItem.user_id !== userId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this item.'
        });
      }

      if (existingItem.image) {
        const imagePath = path.join(__dirname, '../uploads', existingItem.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await ItemModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Item deleted successfully.'
      });
    } catch (error) {
      console.error('Delete item error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting item.',
        error: error.message
      });
    }
  }
}

module.exports = ItemController;