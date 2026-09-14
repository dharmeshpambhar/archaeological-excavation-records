const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUserRole, toggleUserActive, deleteUser, getResearchers } = require('../controllers/usersController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');

router.use(protect);

router.get('/researchers', getResearchers);
router.get('/', isAdmin, getUsers);
router.get('/:id', getUser);
router.put('/:id/role', isAdmin, updateUserRole);
router.put('/:id/toggle-active', isAdmin, toggleUserActive);
router.delete('/:id', isAdmin, deleteUser);

module.exports = router;
