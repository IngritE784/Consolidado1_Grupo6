const token = localStorage.getItem('token');

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function verificarAutenticacion() {
    if (!token) {
        window.location.href = 'login.html';
    }
}

function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Ejecutar verificación de inmediato en páginas protegidas
if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('index.html') && !window.location.pathname.includes('register.html')) {
    verificarAutenticacion();
}