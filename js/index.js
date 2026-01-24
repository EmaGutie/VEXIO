const supabaseUrl = 'https://nuyeycoyoqlahlwudkpk.supabase.co';
const supabaseKey = 'sb_publishable_HNWXqeyC2Ka_dHncluOJtA_twH5yLeV';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let todosLosUsuarios = []; 

async function cargarTalentos() {
    const contenedor = document.getElementById('contenedor-usuarios');
    if (!contenedor) return;

    try {
        // Se eliminó .order('created_at') porque la columna no existe en la tabla
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*');

        if (error) {
            console.error("Error detallado de Supabase:", error);
            throw error;
        }

        todosLosUsuarios = data || [];
        renderizarTarjetas(todosLosUsuarios);
        configurarFiltros(); 
    } catch (err) {
        console.error("Fallo la carga:", err.message);
        contenedor.innerHTML = `
            <div class="text-center py-5">
                <p class="text-danger">Error al conectar con la base de datos.</p>
                <small class="text-muted">Detalle: ${err.message}</small>
            </div>`;
    }
}

function renderizarTarjetas(usuarios) {
    const contenedor = document.getElementById('contenedor-usuarios');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';

    if (!usuarios || usuarios.length === 0) {
        contenedor.innerHTML = '<p class="text-center text-muted py-5">No se encontraron perfiles en esta categoría.</p>';
        return;
    }

    const categorias = [...new Set(usuarios.map(u => u.categoria))];

    categorias.forEach(cat => {
        const filtrados = usuarios.filter(u => u.categoria === cat);
        
        const seccion = document.createElement('div');
        seccion.className = 'col-12 mb-5';
        seccion.innerHTML = `
            <div class="categoria-header mb-4">
                <h3 class="fw-bold mb-0" style="color: #0f172a;">${cat}</h3>
                <small class="text-muted">${filtrados.length} profesional${filtrados.length > 1 ? 'es' : ''} disponible${filtrados.length > 1 ? 's' : ''}</small>
            </div>
            <div class="row g-4">
                ${filtrados.map(u => {
                    // Lógica para iniciales: usa las del nombre si no hay foto cargada
                    const iniciales = u.nombre ? u.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';
                    const fotoHtml = u.foto 
                        ? `<img src="${u.foto}" class="rounded-circle object-fit-cover" style="width: 80px; height: 80px; background: #f8f9fa;">`
                        : `<div class="rounded-circle d-flex align-items-center justify-content-center bg-light text-primary fw-bold" style="width: 80px; height: 80px; font-size: 1.5rem; border: 2px solid #e2e8f0;">${iniciales}</div>`;

                    return `
                    <div class="col-md-4 col-lg-3">
                        <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden" style="background: white;">
                            <div class="p-4 text-center">
                                <div class="mb-3 d-inline-block p-1 rounded-circle" style="border: 2px solid #00d2ff;">
                                    ${fotoHtml}
                                </div>
                                <h5 class="fw-bold mb-1">${u.nombre}</h5>
                                <p class="text-muted small mb-3" style="min-height: 40px;">${u.profesion}</p>
                                <a href="usuario.html?user=${u.slug}" class="btn btn-dark w-100 rounded-pill py-2 fw-bold">Ver Portfolio</a>
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        `;
        contenedor.appendChild(seccion);
    });
}

function configurarFiltros() {
    const buscador = document.getElementById('buscador');
    const chips = document.querySelectorAll('.filter-chip');

    if (buscador) {
        buscador.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase();
            const filtrados = todosLosUsuarios.filter(u => 
                u.nombre.toLowerCase().includes(termino) || 
                u.profesion.toLowerCase().includes(termino)
            );
            renderizarTarjetas(filtrados);
        });
    }

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const cat = chip.getAttribute('data-category');
            const filtrados = (cat === 'all') 
                ? todosLosUsuarios 
                : todosLosUsuarios.filter(u => u.categoria === cat);
            
            renderizarTarjetas(filtrados);
        });
    });
}



    function mostrarModal(tipo) {
        const modal = document.getElementById('modalLegal');
        const contenido = document.getElementById('contenidoLegal');
        
        const textos = {
            'privacidad': '<h3 style="color:#00d2ff">Política de Privacidad</h3><p>En VEXIO, protegemos tus datos personales. Tu información profesional solo se comparte con fines laborales dentro de la plataforma.</p>',
            'terminos': '<h3 style="color:#00d2ff">Términos y Condiciones</h3><p>Al utilizar VEXIO, aceptas que la veracidad de la información en tu perfil es tu responsabilidad. Nos reservamos el derecho de moderar perfiles.</p>'
        };

        contenido.innerHTML = textos[tipo];
        modal.style.display = 'flex';
    }

    function cerrarModal() {
        document.getElementById('modalLegal').style.display = 'none';
    }

    // Cerrar al hacer clic fuera
    window.onclick = function(event) {
        const modal = document.getElementById('modalLegal');
        if (event.target == modal) { cerrarModal(); }
    }


document.addEventListener('DOMContentLoaded', cargarTalentos);