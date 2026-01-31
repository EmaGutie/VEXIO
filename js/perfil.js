const supabaseUrl = 'https://nuyeycoyoqlahlwudkpk.supabase.co';
const supabaseKey = 'sb_publishable_HNWXqeyC2Ka_dHncluOJtA_twH5yLeV';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function cargarPerfil() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('user'); 
    if (!slug) { window.location.href = 'index.html'; return; }

    const { data: perfil, error } = await supabaseClient
        .from('usuarios').select('*').eq('slug', slug).maybeSingle();

    if (error || !perfil) { window.location.href = 'index.html'; return; }

    window.emailUsuario = perfil.email ? perfil.email.trim() : null;

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user.email === perfil.email) {
            const panelDueno = document.getElementById('gestion-dueno');
            if (panelDueno) panelDueno.style.display = 'block';
        }
    } catch (e) { console.log("Modo visitante"); }

    const setTexto = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.innerText = valor || '';
    };

    setTexto('user-nombre', perfil.nombre);
    setTexto('user-profesion', perfil.profesion);
    setTexto('user-ubicacion', perfil.ubicacion);
    setTexto('user-sobre-mi', perfil.sobre_mi);
    setTexto('user-status', perfil.disponibilidad || 'Activo');

    // --- LÓGICA DE RENDERIZADO "CUADROS GRISELDA" REFORZADA ---
    
    const renderizarListaOrdenada = (contenedorId, texto) => {
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor) return;
        contenedor.innerHTML = "";

        if (!texto || texto.trim() === "") {
            contenedor.innerHTML = '<p class="text-muted small">No hay información registrada.</p>';
            return;
        }

        // Dividimos por líneas
        const lineas = texto.split('\n').filter(linea => linea.trim() !== "");

        lineas.forEach(linea => {
            const item = document.createElement('div');
            // Estilo de "casilla" blanca con sombra y borde lateral
            item.className = 'mb-3 p-3 rounded-4 shadow-sm border-0';
            item.style.background = "#ffffff";
            item.style.borderLeft = "5px solid #00d2ff";
            
            // Lógica de detección: si tiene ":" o "-" asumimos que es Título/Periodo : Descripción
            if (linea.includes(':') || (linea.includes('-') && linea.length < 100)) {
                const separador = linea.includes(':') ? ':' : '-';
                const partes = linea.split(separador);
                const titulo = partes[0].trim();
                const desc = partes.slice(1).join(separador).trim();

                item.innerHTML = `
                    <div class="d-flex align-items-center mb-1">
                        <span class="badge bg-info-subtle text-info rounded-pill px-2 py-1 mb-1" style="font-size: 0.7rem; letter-spacing: 0.5px;">
                            <i class="bi bi-calendar3 me-1"></i> ${titulo.toUpperCase()}
                        </span>
                    </div>
                    <div class="fw-bold text-dark" style="font-size: 1rem; line-height: 1.2;">${desc}</div>
                `;
            } else {
                // Si es una descripción larga o una tarea con viñeta
                item.innerHTML = `
                    <div class="text-secondary small d-flex gap-2">
                        <i class="bi bi-chevron-right text-info"></i>
                        <span>${linea.trim()}</span>
                    </div>
                `;
            }
            contenedor.appendChild(item);
        });
    };

    renderizarListaOrdenada('container-experiencia', perfil.experiencia);
    renderizarListaOrdenada('container-educacion', perfil.educacion);

    // --- FIN LÓGICA GRISELDA ---

    const userFoto = document.getElementById('user-foto');
    if (userFoto) {
        userFoto.src = (perfil.foto && perfil.foto.trim() !== "") 
            ? perfil.foto 
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(perfil.nombre)}&background=00D2FF&color=fff&size=200`;
    }

    const skillsContainer = document.getElementById('user-skills');
    if (skillsContainer && perfil.skills) {
        skillsContainer.innerHTML = ""; 
        perfil.skills.split(',').forEach(s => {
            if (s.trim() !== "") {
                const span = document.createElement('span');
                span.className = 'badge rounded-pill bg-light text-dark border me-2 mb-2 p-2 px-3 fw-medium'; 
                span.innerText = s.trim();
                skillsContainer.appendChild(span);
            }
        });
    }

    const linkWA = document.getElementById('link-whatsapp');
    if (linkWA && perfil.telefono) {
        const numLimpio = perfil.telefono.replace(/\D/g, '');
        linkWA.href = `https://wa.me/${numLimpio}?text=Hola%20${encodeURIComponent(perfil.nombre)}`;
    }

    const linkEmail = document.getElementById('link-email');
    if (linkEmail && window.emailUsuario) {
        const emailDestino = window.emailUsuario;
        const asunto = encodeURIComponent("Contacto desde VEXIO");
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            linkEmail.href = `mailto:${emailDestino}?subject=${asunto}`;
            linkEmail.target = "_self"; 
        } else {
            linkEmail.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailDestino}&su=${asunto}`;
            linkEmail.target = "_blank";
        }
    }
}

// --- FUNCIONES GLOBALES ---

function compartirPerfil() {
    const urlPerfil = window.location.href;
    Swal.fire({
        title: '¡Enlace Copiado!',
        text: 'Ya podés compartir este perfil profesional.',
        icon: 'success',
        background: '#1a1a1a',
        color: '#ffffff',
        confirmButtonColor: '#00d2ff',
        timer: 2000,
        showConfirmButton: false
    });
    navigator.clipboard.writeText(urlPerfil);
}

async function eliminarPerfilDefinitivo() {
    const result = await Swal.fire({
        title: '¿Borrar perfil?', text: "No podrás deshacer esto.", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, borrar'
    });
    if (result.isConfirmed) {
        const slug = new URLSearchParams(window.location.search).get('user');
        await supabaseClient.from('usuarios').delete().eq('slug', slug); 
        window.location.href = 'index.html';
    }
}

function descargarPDF() {
    window.print();
}

document.addEventListener('DOMContentLoaded', cargarPerfil);