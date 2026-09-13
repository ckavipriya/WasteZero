const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  applyToOpportunity,
  getApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getApplications)
  .post(applyToOpportunity);

router.route('/:id')
  .put(authorize('ngo', 'admin'), updateApplicationStatus);

module.exports = router;
