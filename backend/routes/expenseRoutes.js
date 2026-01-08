const express = require('express');
const router = express.Router();
const { 
    createManualExpense, 
    getApartmentExpenses, 
    deleteExpense, 
    updateExpense,
    getMyApartmentExpenses,
    getExpense,
    createSettlement,
    updateSettlementStatus,
} = require('../controllers/expenseController');

router.get('/my-expenses', getMyApartmentExpenses);
router.post('/manual', createManualExpense);
router.get('/apartment/:apartmentId', getApartmentExpenses);

router.post('/settlement', createSettlement);
router.put('/settlement/:settlementId', updateSettlementStatus);

router.put('/:expenseId', updateExpense);
router.delete('/:expenseId', deleteExpense);
router.get('/:expenseId', getExpense);

module.exports = router;