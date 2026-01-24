const supabaseUrl = 'https://nuyeycoyoqlahlwudkpk.supabase.co';
const supabaseKey = 'sb_publishable_HNWXqeyC2Ka_dHncluOJtA_twH5yLeV';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function cargarPerfil() {
    // 1. Obtener slug de la URL
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('user'); 
    if (!slug) { window.location.href = 'index.html'; return; }

    // 2. Cargar datos desde Supabase
    const { data: perfil, error } = await supabaseClient
        .from('usuarios').select('*').eq('slug', slug).maybeSingle();

    if (error || !perfil) { window.location.href = 'index.html'; return; }

    // 3. Guardar mail en ventana global para el botón (Fix infalible)
    window.emailUsuario = perfil.email ? perfil.email.trim() : null;

    // 4. Lógica para mostrar panel de gestión (Dueño)
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user.email === perfil.email) {
            const panelDueno = document.getElementById('gestion-dueno');
            if (panelDueno) panelDueno.style.display = 'block';
        }
    } catch (e) { console.log("Modo visitante"); }

    // 5. Inyectar Datos en el HTML
    const setTexto = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.innerText = valor || '';
    };

    setTexto('user-nombre', perfil.nombre);
    setTexto('user-profesion', perfil.profesion);
    setTexto('user-ubicacion', perfil.ubicacion);
    setTexto('user-sobre-mi', perfil.sobre_mi);
    setTexto('user-experiencia', perfil.experiencia);
    setTexto('user-educacion', perfil.educacion);
    setTexto('user-status', perfil.disponibilidad || 'Activo');

    // 6. Foto de perfil
    const userFoto = document.getElementById('user-foto');
    if (userFoto) {
        userFoto.src = (perfil.foto && perfil.foto.trim() !== "") 
            ? perfil.foto 
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(perfil.nombre)}&background=00D2FF&color=fff&size=200`;
    }

    // 7. Renderizar Skills
    const skillsContainer = document.getElementById('user-skills');
    if (skillsContainer && perfil.skills) {
        skillsContainer.innerHTML = ""; 
        perfil.skills.split(',').forEach(s => {
            if (s.trim() !== "") {
                const span = document.createElement('span');
                span.className = 'badge-skill'; 
                span.innerText = s.trim();
                skillsContainer.appendChild(span);
            }
        });
    }

    // 8. Configurar WhatsApp
    const linkWA = document.getElementById('link-whatsapp');
    if (linkWA && perfil.telefono) {
        const numLimpio = perfil.telefono.replace(/\D/g, '');
        linkWA.href = `https://wa.me/${numLimpio}?text=Hola%20${encodeURIComponent(perfil.nombre)}`;
    }

    // 9. Configurar Email (Lógica reforzada)
    const linkEmail = document.getElementById('link-email');
    if (linkEmail && window.emailUsuario) {
        const emailDestino = window.emailUsuario;
        const asunto = encodeURIComponent("Contacto desde VEXIO");
        
        // Detectamos si es un dispositivo móvil
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // En Celular: Usamos mailto (abre la App nativa)
            linkEmail.href = `mailto:${emailDestino}?subject=${asunto}`;
            linkEmail.target = "_self"; 
        } else {
            // En PC: Abrimos Gmail en el navegador
            linkEmail.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailDestino}&su=${asunto}`;
            linkEmail.target = "_blank";
        }

        linkEmail.onclick = (e) => {
            console.log(isMobile ? "Abriendo App de correo..." : "Abriendo Gmail Web...");
        };
    }
} // <--- CIERRE CORRECTO

// --- FUNCIONES GLOBALES ---

function compartirPerfil() {
    const urlPerfil = window.location.href;
    Swal.fire({
        title: '¡Comparte tu perfil!',
        html: `<div class="input-group mb-3">
                <input type="text" id="link-input" class="form-control" value="${urlPerfil}" readonly>
                <button class="btn btn-primary" onclick="copiarLinkAlPortapapeles()">Copiar</button>
                </div>`,
        icon: 'info', showConfirmButton: false, showCloseButton: true, borderRadius: '15px'
    });
}

function copiarLinkAlPortapapeles() {
    const copyText = document.getElementById("link-input");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '¡Copiado!', showConfirmButton: false, timer: 1500 });
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
    // 1. Buscamos todas las tarjetas de contenido
    const tarjetas = document.querySelectorAll('.bento-card');

    tarjetas.forEach(tarjeta => {
        // Buscamos el párrafo o el área de texto dentro de la tarjeta
        const contenido = tarjeta.querySelector('p, pre, .badge-skill');
        
        // Si no hay contenido o el texto está vacío (solo espacios)
        if (!contenido || contenido.innerText.trim() === "") {
            tarjeta.classList.add('hidden-print'); // Marcamos para ocultar
        } else {
            tarjeta.classList.remove('hidden-print');
        }
    });
    window.print();
}


function abrirCorreo() {
    const emailElement = document.getElementById('user-nombre'); // Solo para verificar que cargó datos
    if (!emailElement) return;
    
    // Sacamos el mail directamente del objeto perfil si lo tenés global, 
    // o mejor lo buscamos de un atributo que guardaremos antes.
    const mail = window.emailUsuario; 
    if (mail) {
        window.location.href = `mailto:${mail}?subject=Contacto desde VEXIO`;
    } else {
        alert("Todavía cargando datos o mail no encontrado");
    }
}

document.addEventListener('DOMContentLoaded', cargarPerfil);