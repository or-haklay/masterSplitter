const express = require('express');
const router = express.Router();
const { connectApartment, getQRCode, getStatus } = require('../controllers/whatsappController');

router.post('/connect', connectApartment);
router.post('/connect/:apartmentId', connectApartment);
router.get('/qr/:apartmentId', getQRCode);
router.get('/status/:apartmentId', getStatus);

module.exports = router;