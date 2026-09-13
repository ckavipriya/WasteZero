const express = require('express');
const { protect } = require('../middleware/auth');
const {
  updateProfile,
  changePassword,
  getUserById,
  listUsers,
} = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.route('/').get(listUsers);
router.route('/profile').put(updateProfile);
router.route('/password').put(changePassword);
router.route('/:id').get(getUserById);

module.exports = router;
