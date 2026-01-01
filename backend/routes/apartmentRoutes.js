const express = require('express');
const router = express.Router();
const { connectUserToApartment, getMyApartment, connectToGroup, getInviteCode } = require('../controllers/apartmentController');

router.get('/invite-code', getInviteCode);
router.get('/my', getMyApartment);
router.post('/connect-group', connectToGroup);

router.post('/:apartmentId', connectUserToApartment);



module.exports = router;