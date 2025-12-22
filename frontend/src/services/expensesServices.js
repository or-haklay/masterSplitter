import httpServices from './httpServices'

async function getApartmentExpenses(apartmentId) {
    const response = await httpServices.get(`/expenses/${apartmentId}`)
    return response.data
}

export default {
    getApartmentExpenses
}