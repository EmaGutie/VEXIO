const supabaseUrl = 'https://nuyeycoyoqlahlwudkpk.supabase.co';
const supabaseKey = 'sb_publishable_HNWXqeyC2Ka_dHncluOJtA_twH5yLeV';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let todosLosUsuarios = []; 
let usuariosFiltradosPorCat = []; 

async function cargarTalentos() {
    const contenedor = document.getElementById('contenedor-usuarios');
    if (!contenedor) return;

    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*');

        if (error) throw error;

        todosLosUsuarios = data || [];
        
        const urlParams = new URLSearchParams(window.location.search);
        const catDesdeUrl = urlParams.get('cat');

        if (catDesdeUrl) {
            ejecutarFiltroAutomatico(catDesdeUrl);
        } else {
            usuariosFiltradosPorCat = todosLosUsuarios;
            renderizarTarjetas(usuariosFiltradosPorCat);
        }

        configurarFiltros(); 

    } catch (err) {
        console.error("Fallo la carga:", err.message);
        contenedor.innerHTML = `<div class="text-center py-5"><p class="text-danger">Error de conexión.</p></div>`;
    }
}

function ejecutarFiltroAutomatico(categoria) {
    const titulo = document.getElementById('titulo-explorar');
    if (titulo) {
        titulo.innerText = `Talentos en ${categoria}`;
    }
    usuariosFiltradosPorCat = todosLosUsuarios.filter(u => u.categoria === categoria);
    renderizarTarjetas(usuariosFiltradosPorCat);
}

function renderizarTarjetas(usuarios) {
    const contenedor = document.getElementById('contenedor-usuarios');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';

    if (!usuarios || usuarios.length === 0) {
        contenedor.innerHTML = '<p class="text-center text-muted py-5">No se encontraron perfiles con esos criterios.</p>';
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
                <small class="text-muted">${filtrados.length} profesional${filtrados.length > 1 ? 'es' : ''}</small>
            </div>
            <div class="row g-4">
                ${filtrados.map(u => {
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
                                <p class="text-muted small mb-1" style="min-height: 40px;">${u.profesion}</p>
                                
                                <p class="small text-secondary mb-3">
                                    <i class="bi bi-geo-alt-fill text-info"></i> ${u.ubicacion || 'Ubicación no disponible'}
                                </p>

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

    if (buscador) {
        buscador.placeholder = "Filtrar por ubicación (ej: Mendoza, Buenos Aires)...";

        buscador.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase();
            
            const filtrados = usuariosFiltradosPorCat.filter(u => {
                const ubicacion = (u.ubicacion || "").toLowerCase();
                // Ahora filtra solo por ubicación como pediste
                return ubicacion.includes(termino);
            });
            
            renderizarTarjetas(filtrados);
        });
    }
}

// --- FUNCIONES LEGALES ---
function mostrarModal(tipo) {
    const modal = document.getElementById('modalLegal');
    const contenido = document.getElementById('contenidoLegal');
    
    if(!modal || !contenido) return;

    const textos = {
        'privacidad': `
            <h2 style="color: #00d2ff; font-weight: 800; margin-bottom: 15px;">Política de Privacidad</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 1.1rem;">
                En <strong>VEXIO</strong>, valoramos tu privacidad. Tus datos personales y profesionales están protegidos.
            </p>`,
        'terminos': `
            <h2 style="color: #00d2ff; font-weight: 800; margin-bottom: 15px;">Términos y Condiciones</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 1.1rem;">
                Al utilizar nuestra plataforma, te comprometes a brindar información verídica en tu perfil.
            </p>`
    };

    contenido.innerHTML = textos[tipo];
    modal.style.display = 'flex';
}

function cerrarModal() {
    const modal = document.getElementById('modalLegal');
    if(modal) modal.style.display = 'none';
}

window.addEventListener('click', (event) => {
    const modal = document.getElementById('modalLegal');
    if (event.target === modal) cerrarModal();
});

document.addEventListener('DOMContentLoaded', cargarTalentos);