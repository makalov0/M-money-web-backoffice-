import pool from '../config/dbConnect.js';

class PackageModel {
  // Get all packages
  static async getAllPackages(filters = {}) {
    try {
      let query = 'SELECT * FROM data_packages WHERE 1=1';
      const params = [];
      let paramCount = 1;

      // Add filters
      if (filters.type && filters.type !== 'all') {
        query += ` AND type = $${paramCount}`;
        params.push(filters.type);
        paramCount++;
      }

      if (filters.status) {
        query += ` AND status = $${paramCount}`;
        params.push(filters.status);
        paramCount++;
      }

      if (filters.search) {
        query += ` AND (name ILIKE $${paramCount} OR name_en ILIKE $${paramCount + 1})`;
        params.push(`%${filters.search}%`, `%${filters.search}%`);
        paramCount += 2;
      }

      query += ' ORDER BY id DESC';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get package by ID
  static async getPackageById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM data_packages WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new package
  static async createPackage(packageData) {
    try {
      const result = await pool.query(
        `INSERT INTO data_packages (name, name_en, data, price, validity, speed, type, status, description) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          packageData.name,
          packageData.nameEn,
          packageData.data,
          packageData.price,
          packageData.validity,
          packageData.speed || '4G/5G',
          packageData.type,
          packageData.status || 'active',
          packageData.description || ''
        ]
      );
      return result.rows[0].id;
    } catch (error) {
      throw error;
    }
  }

  // Update package
  static async updatePackage(id, packageData) {
    try {
      const result = await pool.query(
        `UPDATE data_packages 
         SET name = $1, name_en = $2, data = $3, price = $4, validity = $5, 
             speed = $6, type = $7, status = $8, description = $9
         WHERE id = $10`,
        [
          packageData.name,
          packageData.nameEn,
          packageData.data,
          packageData.price,
          packageData.validity,
          packageData.speed || '4G/5G',
          packageData.type,
          packageData.status || 'active',
          packageData.description || '',
          id
        ]
      );
      return result.rowCount;
    } catch (error) {
      throw error;
    }
  }

  // Delete package
  static async deletePackage(id) {
    try {
      const result = await pool.query(
        'DELETE FROM data_packages WHERE id = $1',
        [id]
      );
      return result.rowCount;
    } catch (error) {
      throw error;
    }
  }

  // Get statistics
  static async getStatistics() {
    try {
      const totalResult = await pool.query(
        'SELECT COUNT(*) as total FROM data_packages'
      );

      const typeResult = await pool.query(
        'SELECT type, COUNT(*) as count FROM data_packages GROUP BY type'
      );

      const avgResult = await pool.query(
        'SELECT AVG(price) as avg_price FROM data_packages'
      );

      return {
        total: parseInt(totalResult.rows[0].total),
        byType: typeResult.rows,
        avgPrice: parseFloat(avgResult.rows[0].avg_price) || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

export default PackageModel;