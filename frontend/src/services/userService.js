import httpService from './httpService'

function getUser() {
    return httpService.get('/users/')
}

function createUser(user) {
    return httpService.post('/users/', user)
}

function updateUser(user) {
    return httpService.put('/users/', user)
}

function deleteUser(user) {
    return httpService.delete('/users/', user)
}

function login(user) {
    return httpService.post('/auth/login/', user)
}

function register(user) {
    return httpService.post('/auth/register/', user)
}

export default {
    getUser,
    createUser,
    updateUser,
    deleteUser,
    login,
    register,
}