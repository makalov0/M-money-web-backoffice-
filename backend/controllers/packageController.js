import PackageModel from '../models/packageModel.js';

class PackageController {
  // Get all packages
  static async getAllPackages(req, res) {
    try {
      const filters = {
        type: req.query.type,
        status: req.query.status,
        search: req.query.search
      };

      const packages = await PackageModel.getAllPackages(filters);
      
      res.status(200).json({
        success: true,
        count: packages.length,
        data: packages
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching packages',
        error: error.message
      });
    }
  }

  // Get package by ID
  static async getPackageById(req, res) {
    try {
      const { id } = req.params;
      const pkg = await PackageModel.getPackageById(id);

      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      res.status(200).json({
        success: true,
        data: pkg
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching package',
        error: error.message
      });
    }
  }

  // Create new package
  static async createPackage(req, res) {
    try {
      const packageData = req.body;

      // Validation
      if (!packageData.name || !packageData.nameEn || !packageData.data || 
          !packageData.price || !packageData.validity) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }

      const newPackageId = await PackageModel.createPackage(packageData);
      const newPackage = await PackageModel.getPackageById(newPackageId);

      res.status(201).json({
        success: true,
        message: 'Package created successfully',
        data: newPackage
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating package',
        error: error.message
      });
    }
  }

  // Update package
  static async updatePackage(req, res) {
    try {
      const { id } = req.params;
      const packageData = req.body;

      const existingPackage = await PackageModel.getPackageById(id);
      if (!existingPackage) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      const affectedRows = await PackageModel.updatePackage(id, packageData);

      if (affectedRows === 0) {
        // This usually means the ID was valid, but no data was changed
        const updatedPackage = await PackageModel.getPackageById(id);
        return res.status(200).json({
            success: true,
            message: 'Package update successful (no changes detected)',
            data: updatedPackage
        });
      }

      const updatedPackage = await PackageModel.getPackageById(id);

      res.status(200).json({
        success: true,
        message: 'Package updated successfully',
        data: updatedPackage
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating package',
        error: error.message
      });
    }
  }

  // Delete package
  static async deletePackage(req, res) {
    try {
      const { id } = req.params;

      const existingPackage = await PackageModel.getPackageById(id);
      if (!existingPackage) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      const affectedRows = await PackageModel.deletePackage(id);

      if (affectedRows === 0) {
        // This case should theoretically not happen if existingPackage check passed
        return res.status(500).json({
          success: false,
          message: 'Package deletion failed unexpectedly'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Package deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting package',
        error: error.message
      });
    }
  }

  // Get statistics
  static async getStatistics(req, res) {
    try {
      const stats = await PackageModel.getStatistics();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics',
        error: error.message
      });
    }
  }
}

export default PackageController;