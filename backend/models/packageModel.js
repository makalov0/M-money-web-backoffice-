import pool from '../config/dbConnect.js';

class PackageModel {
  // Get all packages
  static async getAllPackages(filters = {}) {
    try {
      let query = 'SELECT * FROM data_packages WHERE 1=1';
      const params = [];

      // Add filters
      if (filters.type && filters.type !== 'all') {
        query += ' AND type = ?';
        params.push(filters.type);
      }

      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.search) {
        query += ' AND (name LIKE ? OR name_en LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      query += ' ORDER BY id DESC';

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get package by ID
  static async getPackageById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM data_packages WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new package
  static async createPackage(packageData) {
    try {
      const [result] = await pool.query(
        `INSERT INTO data_packages (name, name_en, data, price, validity, speed, type, status, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          packageData.name,
          packageData.nameEn,
          packageData.data,
          packageData.price,
          packageData.validity,
          packageData.speed || null,
          packageData.type,
          packageData.status || 'active',
          packageData.description || null
        ]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Update package
  static async updatePackage(id, packageData) {
    try {
      const [result] = await pool.query(
        `UPDATE data_packages 
         SET name = ?, name_en = ?, data = ?, price = ?, validity = ?, 
             speed = ?, type = ?, status = ?, description = ?
         WHERE id = ?`,
        [
          packageData.name,
          packageData.nameEn,
          packageData.data,
          packageData.price,
          packageData.validity,
          packageData.speed || null,
          packageData.type,
          packageData.status || 'active',
          packageData.description || null,
          id
        ]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Delete package
  static async deletePackage(id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM data_packages WHERE id = ?',
        [id]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Get statistics
  static async getStatistics() {
    try {
      const [totalCount] = await pool.query(
        'SELECT COUNT(*) as total FROM data_packages'
      );

      const [typeCount] = await pool.query(
        'SELECT type, COUNT(*) as count FROM data_packages GROUP BY type'
      );

      const [avgPrice] = await pool.query(
        'SELECT AVG(price) as avg_price FROM data_packages'
      );

      return {
        total: totalCount[0].total,
        byType: typeCount,
        avgPrice: avgPrice[0].avg_price
      };
    } catch (error) {
      throw error;
    }
  }
}

export default PackageModel;