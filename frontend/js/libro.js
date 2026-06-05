document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    cargarLibros();
    verificarRolAdmin();

    // ── Agregar libro (solo admin) ──────────────────────────────
    document.getElementById('formLibro')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('mensajeLibro');

        const data = {
            codigo: document.getElementById('codigo').value.trim(),
            titulo: document.getElementById('titulo').value.trim(),
            autor: document.getElementById('autor').value.trim(),
            categoria: document.getElementById('categoria').value.trim(),
            cantidad: parseInt(document.getElementById('cantidad').value)
        };

        const res = await fetch('/api/libros', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        const json = await res.json();
        if (res.ok) {
            if (msg) msg.textContent = '✔ Libro creado correctamente.';
            document.getElementById('formLibro').reset();
            cargarLibros();
        } else {
            if (msg) msg.textContent = '✖ ' + (json.error || 'Error al crear el libro.');
        }
    });
});

async function cargarLibros() {
    const titulo = document.getElementById('buscarTitulo')?.value || '';
    const url = titulo ? `/api/libros?titulo=${encodeURIComponent(titulo)}` : '/api/libros';

    const res = await fetch(url, { headers: getAuthHeaders() });
    const libros = await res.json();
    const tbody = document.getElementById('tablaLibros');
    tbody.innerHTML = '';

    if (!libros.length) {
        tbody.innerHTML = '<tr><td colspan="7">No se encontraron libros.</td></tr>';
        return;
    }

    libros.forEach(l => {
        tbody.innerHTML += `
            <tr>
                <td>${l.id}</td>
                <td>${l.codigo}</td>
                <td>${l.titulo}</td>
                <td>${l.autor}</td>
                <td>${l.categoria}</td>
                <td>${l.cantidad}</td>
                <td><button onclick="solicitar(${l.id})" ${l.cantidad <= 0 ? 'disabled' : ''}>Solicitar Préstamo</button></td>
            </tr>`;
    });
}

async function solicitar(id) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 7);

    const res = await fetch('/api/prestamos', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ libro_id: id, fecha_devolucion: fecha.toISOString().split('T')[0] })
    });

    const json = await res.json();
    if (res.ok) {
        alert('✔ Préstamo solicitado correctamente.');
        cargarLibros();
    } else {
        alert('✖ ' + (json.error || 'Error al solicitar el préstamo.'));
    }
}

// Muestra el panel admin si el usuario tiene rol admin
function verificarRolAdmin() {
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.rol === 'admin') {
            document.getElementById('adminPanel').style.display = 'block';
        }
    }
}
