document.addEventListener('DOMContentLoaded', () => {
    cargarLibros();
    verificarRolAdmin();
});

async function cargarLibros() {
    const res = await fetch('/api/libros', { headers: getAuthHeaders() });
    const libros = await res.json();
    const tbody = document.getElementById('tablaLibros');
    tbody.innerHTML = '';

    libros.forEach(l => {
        tbody.innerHTML += `
            <tr>
                <td>${l.id}</td>
                <td>${l.codigo}</td>
                <td>${l.titulo}</td>
                <td>${l.autor}</td>
                <td>${l.cantidad}</td>
                <td><button onclick="solicitar(${l.id})" ${l.cantidad <= 0 ? 'disabled' : ''}>Solicitar Préstamo</button></td>
            </tr>`;
    });
}

async function solicitar(id) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 7); // Devolución en 7 días

    const res = await fetch('/api/prestamos', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ libro_id: id, fecha_devolucion: fecha.toISOString().split('T')[0] })
    });

    if (res.ok) {
        alert('Préstamo solicitado');
        cargarLibros();
    } else {
        alert('Error al solicitar');
    }
}

// Lógica para el Admin (Mostrar formulario)
function verificarRolAdmin() {
    // Decodificar payload del token JWT de forma sencilla
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.rol === 'admin') {
            document.getElementById('adminPanel').style.display = 'block';
        }
    }
}

document.getElementById('formLibro')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        codigo: document.getElementById('codigo').value,
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        categoria: document.getElementById('categoria').value,
        cantidad: document.getElementById('cantidad').value
    };

    const res = await fetch('/api/libros', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert('Libro creado');
        document.getElementById('formLibro').reset();
        cargarLibros();
    }
});