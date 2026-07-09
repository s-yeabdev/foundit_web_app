const pool = require('../config/database');

class ItemModel {
  
  static async create(itemData) {
    const { title, description, category, location, date, type, image, user_id } = itemData;
    const result = await pool.query(
      `INSERT INTO items (title, description, category, location, date, type, image, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [title, description, category, location, date, type, image, user_id]
    );
    return result.rows[0];
  }

  
  static async getAll(limit = 100, offset = 0) {
    const result = await pool.query(
      `SELECT i.*, u.username as posted_by 
       FROM items i
       LEFT JOIN users u ON i.user_id = u.id
       ORDER BY i.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  
  static async getByType(type, limit = 100, offset = 0) {
    const result = await pool.query(
      `SELECT i.*, u.username as posted_by 
       FROM items i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.type = $1
       ORDER BY i.created_at DESC
       LIMIT $2 OFFSET $3`,
      [type, limit, offset]
    );
    return result.rows;
  }

  
  static async searchByTitle(searchTerm, limit = 100, offset = 0) {
    const result = await pool.query(
      `SELECT i.*, u.username as posted_by 
       FROM items i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE LOWER(i.title) LIKE LOWER($1)
       ORDER BY i.created_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${searchTerm}%`, limit, offset]
    );
    return result.rows;
  }

  
  static async findById(id) {
    const result = await pool.query(
      `SELECT i.*, u.username as posted_by 
       FROM items i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  
  static async findByUserId(userId) {
    const result = await pool.query(
      `SELECT i.id, i.title, i.description, i.category, i.location, i.type, i.image, i.user_id, i.created_at,
              TO_CHAR(i.date, 'YYYY-MM-DD') as date,
              u.username as posted_by 
       FROM items i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.user_id = $1
       ORDER BY i.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  
  static async update(id, itemData) {
    const { title, description, category, location, date, type, image } = itemData;
    let query = `
      UPDATE items 
      SET title = $1, description = $2, category = $3, location = $4, date = $5, type = $6
    `;
    let params = [title, description, category, location, date, type];
    
    if (image) {
      query += `, image = $7`;
      params.push(image);
    }
    
    
    const idPlaceholderPosition = params.length + 1;
    query += ` WHERE id = $${idPlaceholderPosition} RETURNING *`;
    params.push(id);
    
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM items WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  
  static async belongsToUser(itemId, userId) {
    const result = await pool.query(
      'SELECT id FROM items WHERE id = $1 AND user_id = $2',
      [itemId, userId]
    );
    return result.rows.length > 0;
  }
}

module.exports = ItemModel;