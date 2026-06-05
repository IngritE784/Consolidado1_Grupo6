document.addEventListener('DOMContentLoaded', () => {
    // Proteger la ruta: solo admin puede ver esto
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.rol !== 'admin') {
            alert('Acceso denegado');
            window.location.href = 'libros.html';
        }
    }
    cargarUsuarios();
});

async function cargarUsuarios() {
    const res = await fetch('/api/usuarios', { headers: getAuthHeaders() });
    const usuarios = await res.json();
    const tbody = document.getElementById('tablaUsuarios');
    tbody.innerHTML = '';

    usuarios.forEach(u => {
        tbody.innerHTML += `
            <tr>
                <td>${u.id}</td>
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td>${u.rol}</td>
                <td><button onclick="eliminarUsuario(${u.id})">Eliminar</button></td>
            </tr>`;
    });
}

document.getElementById('formUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        rol: document.getElementById('rol').value
    };

    const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert('Usuario creado');
        document.getElementById('formUsuario').reset();
        cargarUsuarios();
    } else {
        const err = await res.json();
        alert('Error: ' + err.error);
    }
});

async function eliminarUsuario(id) {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
        const res = await fetch(`/api/usuarios/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (res.ok) {
            alert('Usuario eliminado');
            cargarUsuarios();
        }
    }
}