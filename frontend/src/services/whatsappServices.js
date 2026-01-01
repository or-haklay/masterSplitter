import httpServices from './httpServices'

async function connectApartment(apartmentId = null) {
    // אם יש apartmentId, השתמש בו. אחרת, קרא בלי פרמטר (השרת יצור דירה חדשה)
    const url = apartmentId 
        ? `/whatsapp/connect/${apartmentId}` 
        : `/whatsapp/connect`;
    const response = await httpServices.post(url);
    return response.data;
}

async function getQRCode(apartmentId) {
    const response = await httpServices.get(`/whatsapp/qr/${apartmentId}`);
    return response.data;
}

async function getStatus(apartmentId) {
    const response = await httpServices.get(`/whatsapp/status/${apartmentId}`);
    return response.data;
}

export default {
    connectApartment,
    getQRCode,
    getStatus
}