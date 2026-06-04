// Token del localStorage
const token = localStorage.getItem('token');

// Genera las cabeceras con autorización JWT
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Redirige al login si no hay token
function requireAuth() {
    if (!token) {
        window.location.href = '/login.html';
    }
}

// Decodifica el payload del JWT sin librerías externas
function getPayload() {
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}
