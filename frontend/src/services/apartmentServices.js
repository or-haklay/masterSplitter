import httpServices from './httpServices'

async function getMyApartmentId() {
    const response = await httpServices.get('/apartments/my')
    return response.data.apartmentId
}

export default {
    getMyApartmentId,
}