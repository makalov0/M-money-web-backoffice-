import express from 'express';
import PackageController from '../controllers/packageController.js'; // Note: Check case sensitivity

const router = express.Router();

// Get all packages (with optional filters)
// GET /api/packages?type=data&status=active&search=unlimited
router.get('/', PackageController.getAllPackages);

// Get statistics (MUST be before /:id route)
// GET /api/packages/statistics
router.get('/statistics', PackageController.getStatistics);

// Get single package by ID
// GET /api/packages/:id
router.get('/:id', PackageController.getPackageById);

// Create new package
// POST /api/packages
router.post('/', PackageController.createPackage);

// Update package
// PUT /api/packages/:id
router.put('/:id', PackageController.updatePackage);

// Delete package
// DELETE /api/packages/:id
router.delete('/:id', PackageController.deletePackage);

export default router;