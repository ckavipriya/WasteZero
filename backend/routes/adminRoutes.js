const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getStats,
  getAllUsers,
  toggleSuspendUser,
  deleteUser,
  getLogs,
  getReport,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', toggleSuspendUser);
router.delete('/users/:id', deleteUser);
router.get('/logs', getLogs);
router.get('/report', getReport);

module.exports = router;
