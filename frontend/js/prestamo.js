// ── Al cargar la página ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();

    const payload = getPayload();

    // Mostrar panel admin si corresponde
    if (payload && payload.rol === 'admin') {
        document.getElementById('tituloPrestamos').textContent = 'Todos los Préstamos';
        document.getElementById('panelAdmin').style.display = 'block';
    }

    // Fijar fecha mínima de devolución (hoy + 1 día)
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    document.getElementById('fechaDevolucion').min = manana.toISOString().split('T')[0];

    // Fecha sugerida: hoy + 7 días
    const sugerida = new Date();
    sugerida.setDate(sugerida.getDate() + 7);
    document.getElementById('fechaDevolucion').value = sugerida.toISOString().split('T')[0];

    cargarLibrosDisponibles();
    cargarPrestamos();

    // Cerrar sesión
    document.getElementById('btnCerrarSesion').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });
});

// ── Cargar libros disponibles en el <select> ────────────────────────────
async function cargarLibrosDisponibles() {
    try {
        const res = await fetch('/api/libros', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Sin autorización');
        const libros = await res.json();

        const select = document.getElementById('libroSelect');
        select.innerHTML = '<option value="">-- Elige un libro disponible --</option>';

        libros.forEach(l => {
            if (l.cantidad > 0) {
                const opt = document.createElement('option');
                opt.value = l.id;
                opt.textContent = `${l.titulo} — ${l.autor} (Disponibles: ${l.cantidad})`;
                select.appendChild(opt);
            }
        });

        if (select.options.length === 1) {
            select.innerHTML = '<option value="">No hay libros disponibles</option>';
        }
    } catch (err) {
        console.error('Error cargando libros:', err);
    }
}

// ── Cargar tabla de préstamos con filtro opcional ───────────────────────
async function cargarPrestamos() {
    try {
        const res = await fetch('/api/prestamos', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Error al obtener préstamos');
        const prestamos = await res.json();

        const filtro = document.getElementById('filtroEstado').value;
        const datos = filtro ? prestamos.filter(p => p.estado === filtro) : prestamos;

        const tbody = document.getElementById('bodyPrestamos');
        tbody.innerHTML = '';

        if (datos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No hay préstamos que mostrar.</td></tr>';
            return;
        }

        datos.forEach(p => {
            const esDueno = getPayload()?.id === p.usuario_id;
            const esAdmin = getPayload()?.rol === 'admin';
            const puedeDevolver = (esDueno || esAdmin) && p.estado === 'prestado';

            tbody.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.Usuario?.nombre || '—'}</td>
                    <td>${p.Libro?.titulo || '—'}</td>
                    <td>${p.fecha_prestamo || '—'}</td>
                    <td>${p.fecha_devolucion || '—'}</td>
                    <td><strong>${p.estado}</strong></td>
                    <td>
                        ${puedeDevolver
                            ? `<button onclick="devolver(${p.id})">Devolver</button>`
                            : '—'}
                    </td>
                </tr>`;
        });
    } catch (err) {
        console.error('Error cargando préstamos:', err);
        document.getElementById('bodyPrestamos').innerHTML =
            '<tr><td colspan="7">Error al cargar los datos.</td></tr>';
    }
}

// ── Solicitar préstamo ──────────────────────────────────────────────────
document.getElementById('formSolicitar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const libro_id = document.getElementById('libroSelect').value;
    const fecha_devolucion = document.getElementById('fechaDevolucion').value;
    const msg = document.getElementById('mensajeSolicitar');

    if (!libro_id) {
        msg.textContent = 'Selecciona un libro.';
        return;
    }

    try {
        const res = await fetch('/api/prestamos', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ libro_id: parseInt(libro_id), fecha_devolucion })
        });

        const data = await res.json();
        if (res.ok) {
            msg.textContent = '✔ ' + data.mensaje;
            document.getElementById('formSolicitar').reset();
            cargarLibrosDisponibles();
            cargarPrestamos();
        } else {
            msg.textContent = '✖ ' + (data.error || 'Error al solicitar.');
        }
    } catch (err) {
        msg.textContent = '✖ Error de conexión.';
    }
});

// ── Devolver libro ──────────────────────────────────────────────────────
async function devolver(id) {
    if (!confirm(`¿Confirmas la devolución del préstamo #${id}?`)) return;

    try {
        const res = await fetch(`/api/prestamos/${id}/devolver`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });

        const data = await res.json();
        if (res.ok) {
            alert('✔ ' + data.mensaje);
            cargarLibrosDisponibles();
            cargarPrestamos();
        } else {
            alert('✖ ' + (data.error || 'Error al devolver.'));
        }
    } catch (err) {
        alert('✖ Error de conexión.');
    }
}

// ── Cambiar estado (solo admin) ─────────────────────────────────────────
document.getElementById('formCambiarEstado')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prestamoId').value;
    const estado = document.getElementById('nuevoEstado').value;
    const msg = document.getElementById('mensajeAdmin');

    try {
        const res = await fetch(`/api/prestamos/${id}/estado`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ estado })
        });

        const data = await res.json();
        msg.textContent = res.ok
            ? '✔ ' + data.mensaje
            : '✖ ' + (data.error || 'Error.');

        if (res.ok) cargarPrestamos();
    } catch (err) {
        msg.textContent = '✖ Error de conexión.';
    }
});
