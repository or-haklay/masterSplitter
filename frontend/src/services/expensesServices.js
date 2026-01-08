import httpServices from './httpServices'

async function getApartmentExpenses(apartmentId) {
    const response = await httpServices.get(`/expenses/apartment/${apartmentId}`)
    return response.data
}

async function getMyApartmentExpenses() {
    const response = await httpServices.get(`/expenses/my-expenses`)
    return response.data
}

async function createManualExpense(expense) {
    const newExpense = {
        apartmentId: expense.apartment,
        title: expense.title,
        amount: expense.amount,
        payer: expense.payer,
        payerName: expense.payerName,
        rawMessage: "Manual entry via website",
        date: expense.date || new Date(),
        splitAmong: expense.splitAmong || null,
    }
    
    const response = await httpServices.post('/expenses/manual', newExpense)
    return response.data
}

async function updateExpense(expense) {
    const response = await httpServices.put(`/expenses/${expense._id}`, expense)
    return response.data
}

async function deleteExpense(expenseId) {
    const response = await httpServices.delete(`/expenses/${expenseId}`)
    return response.data
}

async function getMyOwnedUsers() {
    const response = await httpServices.get('/users/my-owned')
    return response.data
}

async function getExpense(expenseId) {
    const response = await httpServices.get(`/expenses/${expenseId}`)
    return response.data
}

async function createSettlement(settlement) {
    const newSettlement = {
        apartmentId: settlement.apartment,
        recipient: settlement.recipient,
        amount: settlement.amount,
    }
    const response = await httpServices.post('/expenses/settlement', newSettlement)
    return response.data
}

async function updateSettlementStatus(settlementId, status) {
    const response = await httpServices.put(`/expenses/settlement/${settlementId}`, { status })
    return response.data
}

export default {
    getApartmentExpenses,
    getMyApartmentExpenses,
    createManualExpense,
    updateExpense,
    deleteExpense,
    getMyOwnedUsers,
    getExpense,
    createSettlement,
    updateSettlementStatus,
} 
