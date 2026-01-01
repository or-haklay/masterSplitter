const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUser, getUserById, getMyOwnedUsers } = require('../controllers/UserController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', getUser);
router.get('/my-owned', getMyOwnedUsers);
router.get('/:userId', getUserById);

module.exports = router;