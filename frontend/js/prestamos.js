document.addEventListener('DOMContentLoaded', cargarPrestamos);

let esAdmin = false;
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    esAdmin = payload.rol === 'admin';
    if (esAdmin) {
        const linkUsuarios = document.getElementById('linkUsuarios');
        if (linkUsuarios) linkUsuarios.style.display = 'inline';
    }
}

async function cargarPrestamos() {
    const res = await fetch('/api/prestamos', { headers: getAuthHeaders() });
    const prestamos = await res.json();
    const tbody = document.getElementById('tablaPrestamos');
    tbody.innerHTML = '';

    prestamos.forEach(p => {
        let botonAccion = '-';
        if (esAdmin) {
            if (p.estado === 'pendiente') {
                botonAccion = `<button onclick="aprobar(${p.id})">Aprobar Préstamo</button>`;
            } else if (p.estado === 'prestado') {
                botonAccion = `<button onclick="devolver(${p.id})">Registrar Devolución</button>`;
            }
        }
        tbody.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.Usuario ? p.Usuario.nombre : 'ID: ' + p.usuario_id}</td>
                <td>${p.Libro ? p.Libro.titulo : 'ID: ' + p.libro_id}</td>
                <td>${p.fecha_devolucion}</td>
                <td>${p.estado}</td>
                <td>${botonAccion}</td>
            </tr>`;
    });
}

async function aprobar(id) {
    const res = await fetch(`/api/prestamos/${id}/aprobar`, {
        method: 'PUT',
        headers: getAuthHeaders()
    });
    if (res.ok) {
        alert('Préstamo aprobado');
        cargarPrestamos();
    }
}

async function devolver(id) {
    const res = await fetch(`/api/prestamos/${id}/devolver`, {
        method: 'PUT',
        headers: getAuthHeaders()
    });

    if (res.ok) {
        alert('Devolución registrada');
        cargarPrestamos();
    } else {
        alert('Error al devolver');
    }
}