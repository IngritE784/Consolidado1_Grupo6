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
                <td>
                    <button onclick="editarUsuario(${u.id})" class="btn-warning">Editar</button>
                    <button onclick="eliminarUsuario(${u.id})" class="btn-danger">Eliminar</button>
                </td>
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

async function editarUsuario(id) {
    // Obtenemos todos los usuarios para sacar la data actual del usuario
    const resGet = await fetch('/api/usuarios', { headers: getAuthHeaders() });
    const usuarios = await resGet.json();
    const usuarioActual = usuarios.find(u => u.id === id);

    if (usuarioActual) {
        const nuevoNombre = prompt('Editar Nombre:', usuarioActual.nombre);
        if (nuevoNombre === null) return;

        const nuevoEmail = prompt('Editar Email:', usuarioActual.email);
        if (nuevoEmail === null) return;

        const nuevoRol = prompt('Editar Rol (admin o usuario):', usuarioActual.rol);
        if (nuevoRol === null) return;

        // Validar rol
        if (nuevoRol !== 'admin' && nuevoRol !== 'usuario') {
            alert('El rol debe ser "admin" o "usuario"');
            return;
        }

        usuarioActual.nombre = nuevoNombre.trim() || usuarioActual.nombre;
        usuarioActual.email = nuevoEmail.trim() || usuarioActual.email;
        usuarioActual.rol = nuevoRol.trim() || usuarioActual.rol;

        const resPut = await fetch(`/api/usuarios/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(usuarioActual)
        });

        if (resPut.ok) {
            alert('Usuario actualizado correctamente');
            cargarUsuarios();
        } else {
            const err = await resPut.json();
            alert('Error al actualizar: ' + err.error);
        }
    }
}