const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createPickup,
  getPickups,
  getPickupById,
  updatePickupStatus,
  cancelPickup,
} = require('../controllers/pickupController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPickups)
  .post(createPickup);

router.route('/:id')
  .get(getPickupById)
  .delete(cancelPickup);

router.route('/:id/status')
  .put(authorize('agent', 'admin'), updatePickupStatus);

module.exports = router;
