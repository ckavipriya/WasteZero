const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
} = require('../controllers/opportunityController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getOpportunities)
  .post(authorize('ngo', 'admin'), createOpportunity);

router.route('/:id')
  .get(getOpportunityById)
  .put(authorize('ngo', 'admin'), updateOpportunity)
  .delete(authorize('ngo', 'admin'), deleteOpportunity);

module.exports = router;
