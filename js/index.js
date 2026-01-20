const supabaseUrl = 'https://nuyeycoyoqlahlwudkpk.supabase.co'; 
const supabaseKey = 'sb_publishable_HNWXqeyC2Ka_dHncluOJtA_twH5yLeV'; 
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let usuariosCache = [];

const usuariosSimulacro = [
    {
        nombre: "Lucía Fernández",
        profesion: "UX/UI Designer & Frontend",
        slug: "#",
        color: "#7c3aed",
        skills: "Figma, React, Tailwind",
        foto: "https://i.pravatar.cc/150?u=lucia"
    },
    {
        nombre: "Marcos Paz",
        profesion: "Data Analyst",
        slug: "#",
        color: "#10b981",
        skills: "SQL, Python, PowerBI",
        foto: "https://i.pravatar.cc/150?u=marcos"
    }
];

// --- FUNCIONES DE CARGA ---
async function cargarDirectorio() {
    try {
        const { data, error } = await _supabase
            .from('usuarios')
            .select('nombre, profesion, slug, foto, color, skills');

        const reales = (data && data.length > 0) ? data : [];
        usuariosCache = [...reales, ...usuariosSimulacro];
        renderizarUsuarios(usuariosCache);
    } catch (err) {
        console.warn("Usando datos de simulacro");
        usuariosCache = usuariosSimulacro;
        renderizarUsuarios(usuariosCache);
    }
}

function renderizarUsuarios(lista) {
    const contenedor = document.getElementById('contenedor-usuarios');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    lista.forEach(user => {
        const urlDestino = (user.slug && user.slug !== '#') ? `./usuario.html?user=${user.slug}` : './admin.html';
        const textoBoton = (user.slug && user.slug !== '#') ? 'Ver Portfolio' : '¡Crea el tuyo!';
        
        let skillsHTML = '';
        if (user.skills) {
            let skillsArray = [];
            try {
                skillsArray = user.skills.startsWith('[') ? JSON.parse(user.skills) : user.skills.split(',').map(s => s.trim());
            } catch (e) {
                skillsArray = user.skills.split(',').map(s => s.trim());
            }
            skillsHTML = skillsArray.slice(0, 3).map(s => `<span class="badge-skill">${s}</span>`).join('');
        }

        contenedor.innerHTML += `
            <div class="col-md-4 col-lg-3">
                <div class="card h-100 border-0 shadow-sm text-center p-4" style="border-top: 5px solid ${user.color || '#3b82f6'} !important; border-radius: 15px;">
                    <img src="${user.foto}" class="rounded-circle mx-auto mb-3 shadow-sm" style="width: 90px; height: 90px; object-fit: cover; border: 3px solid white;" onerror="this.src='https://ui-avatars.com/api/?name=${user.nombre}'">
                    <h5 class="fw-bold mb-1">${user.nombre}</h5>
                    <p class="text-muted small mb-3">${user.profesion}</p>
                    <div class="mb-3">${skillsHTML}</div>
                    <a href="${urlDestino}" class="btn btn-sm btn-primary rounded-pill px-4">${textoBoton}</a>
                </div>
            </div>`;
    });
}

// --- BUSCADOR ---
const inputBuscador = document.getElementById('buscador');
if (inputBuscador) {
    inputBuscador.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase();
        const filtrados = usuariosCache.filter(u => 
            u.nombre.toLowerCase().includes(termino) || 
            u.profesion.toLowerCase().includes(termino) ||
            (u.skills && u.skills.toLowerCase().includes(termino))
        );
        renderizarUsuarios(filtrados);
    });
}

// --- LÓGICA LEGAL ---
const textosLegales = {
    privacidad: `
        <h2 class="fw-bold mb-3">Política de Privacidad</h2>
        <p>En <strong>VEXIO</strong>, respetamos tu privacidad. Los datos recolectados (Nombre, Profesión, Skills y Contacto) se utilizan exclusivamente para la creación de tu perfil público.</p>
        <ul class="text-muted small">
            <li>No compartimos tus datos de contacto con empresas de marketing.</li>
            <li>Tienes derecho a solicitar la baja de tu perfil en cualquier momento.</li>
            <li>Usamos cifrado de extremo a extremo a través de Supabase para proteger tu información.</li>
        </ul>`,
    
    terminos: `
    <h2 class="fw-bold mb-3">Términos y Condiciones - VEXIO</h2>
    <p>Al utilizar nuestra plataforma, aceptas que la información profesional proporcionada sea pública para facilitar el contacto con reclutadores.</p>
    
    <div class="alert alert-info mt-4" style="background-color: #f0f9ff; border: 1px solid #00d2ff; padding: 15px; border-radius: 10px;">
        <i class="bi bi-info-circle-fill me-2"></i>
        <strong>Nota importante:</strong> Estamos trabajando en una nueva actualización. Muy pronto podrás editar y eliminar tu perfil tú mismo desde tu propio panel.
    </div>

    <p class="mt-4"><strong>¿Deseas dar de baja tu perfil ahora?</strong><br> 
    Envíanos un correo haciendo clic aquí: <br>
    <a href="mailto:vexiosoporte@gmail.com?subject=Solicitud de Baja de Perfil - VEXIO&body=Hola equipo de VEXIO, solicito la eliminación de mi perfil profesional. Mi nombre o URL es: " 
       class="text-primary fw-bold" 
       style="text-decoration: underline;">
       vexiosoporte@gmail.com
    </a></p>`,
    cookies: `
        <h2 class="fw-bold mb-3">Política de Cookies</h2>
        <p>VEXIO utiliza cookies para garantizar que la plataforma funcione correctamente.</p>
        <p><strong>¿Qué cookies usamos?</strong></p>
        <ul class="text-muted small">
            <li><strong>Técnicas:</strong> Para recordar que has iniciado sesión en el panel de administrador.</li>
            <li><strong>De Rendimiento:</strong> Para que el buscador de talentos sea más rápido en tu navegador.</li>
        </ul>
        <p>No rastreamos tu comportamiento fuera de nuestra plataforma.</p>`
};

window.mostrarModal = function(tipo, event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('modalLegal');
    const contenido = document.getElementById('contenidoLegal');
    if (modal && contenido) {
        contenido.innerHTML = textosLegales[tipo];
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

window.cerrarModal = function() {
    const modal = document.getElementById('modalLegal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

window.addEventListener('click', (e) => {
    const modal = document.getElementById('modalLegal');
    if (e.target === modal) cerrarModal();
});

// Iniciar
cargarDirectorio();