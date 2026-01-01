import httpServices from './httpServices'

async function getMyApartment() {
    const response = await httpServices.get('/apartments/my')
    return response
}

async function connectToGroup(groupCode) {
    const response = await httpServices.post('/apartments/connect-group', { groupCode: groupCode })
    return response
}

async function getInviteCode() {
    const response = await httpServices.get('/apartments/invite-code')
    return response
}


export default {
    getMyApartment,
    connectToGroup,
    getInviteCode,
}