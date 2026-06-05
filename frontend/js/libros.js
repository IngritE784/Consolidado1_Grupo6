let isAdmin = false;

document.addEventListener('DOMContentLoaded', () => {
    verificarRolAdmin(); // Primero verificamos el rol
    cargarLibros();      // Luego cargamos los libros para dibujar los botones correctos
});

async function cargarLibros(busqueda = '') {
    // Si hay búsqueda, agregamos el parámetro a la URL
    const url = busqueda ? `/api/libros?titulo=${encodeURIComponent(busqueda)}` : '/api/libros';
    
    const res = await fetch(url, { headers: getAuthHeaders() });
    const libros = await res.json();
    const tbody = document.getElementById('tablaLibros');
    tbody.innerHTML = '';

    if (libros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No se encontraron libros.</td></tr>';
        return;
    }

    libros.forEach(l => {
        let botonesAccion = '';
        
        if (isAdmin) {
            // El admin no pide prestado, solo administra
            botonesAccion = `
                <button onclick="editarLibro(${l.id})" class="btn-warning">Editar</button>
                <button onclick="eliminarLibro(${l.id})" class="btn-danger">Eliminar</button>
            `;
        } else {
            // Usuario normal o sin sesión
            botonesAccion = `<button onclick="solicitar(${l.id})" ${l.cantidad <= 0 ? 'disabled' : ''}>Solicitar Préstamo</button>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>${l.id}</td>
                <td>${l.codigo}</td>
                <td>${l.titulo}</td>
                <td>${l.autor}</td>
                <td>${l.cantidad}</td>
                <td>${botonesAccion}</td>
            </tr>`;
    });
}

// Nueva función que lee la barra de búsqueda
function buscarLibros() {
    const texto = document.getElementById('inputBusqueda').value;
    cargarLibros(texto);
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
            isAdmin = true;
            document.getElementById('adminPanel').style.display = 'block';
            const linkUsuarios = document.getElementById('linkUsuarios');
            if (linkUsuarios) linkUsuarios.style.display = 'inline';
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

async function eliminarLibro(id) {
    if (!confirm('¿Estás seguro de eliminar este libro del catálogo?')) return;

    const res = await fetch(`/api/libros/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (res.ok) {
        alert('Libro eliminado correctamente');
        cargarLibros();
    } else {
        alert('Error al eliminar el libro');
    }
}

async function editarLibro(id) {
    // Obtenemos el libro actual primero para tener los datos por defecto
    const url = `/api/libros`;
    const resGet = await fetch(url, { headers: getAuthHeaders() });
    const libros = await resGet.json();
    const libroActual = libros.find(l => l.id === id);

    if (libroActual) {
        const nuevoTitulo = prompt('Editar Título:', libroActual.titulo);
        if (nuevoTitulo === null) return; // Canceló
        
        const nuevoAutor = prompt('Editar Autor:', libroActual.autor);
        if (nuevoAutor === null) return; 
        
        const nuevoStock = prompt('Editar Stock:', libroActual.cantidad);
        if (nuevoStock === null) return; 

        libroActual.titulo = nuevoTitulo.trim() || libroActual.titulo;
        libroActual.autor = nuevoAutor.trim() || libroActual.autor;
        libroActual.cantidad = parseInt(nuevoStock, 10);
        
        const resPut = await fetch(`/api/libros/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(libroActual)
        });

        if (resPut.ok) {
            alert('Libro actualizado correctamente');
            cargarLibros();
        } else {
            alert('Error al actualizar el libro');
        }
    }
}