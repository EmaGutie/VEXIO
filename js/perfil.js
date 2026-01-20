// Configuración de Supabase (usando la variable global cargada desde el HTML)
const supabaseUrl = 'https://nuyeycoyoqlahlwudkpk.supabase.co';
const supabaseKey = 'sb_publishable_HNWXqeyC2Ka_dHncluOJtA_twH5yLeV';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function cargarPerfil() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('user');
    if (!slug) return;

    try {
        const { data: usuario, error } = await supabaseClient
            .from('usuarios').select('*').eq('slug', slug).single();

        if (error || !usuario) return;

        // Carga de textos básicos
        document.getElementById('user-nombre').textContent = usuario.nombre;
        document.getElementById('user-profesion').textContent = usuario.profesion;
        document.getElementById('user-sobre-mi').textContent = usuario.sobre_mi;
        document.getElementById('user-experiencia').textContent = usuario.experiencia;
        document.getElementById('user-educacion').textContent = usuario.educacion;
        document.getElementById('user-ubicacion').textContent = usuario.ubicacion || "Argentina";
        
        // --- MANEJO DE DISPONIBILIDAD DINÁMICA ---
        const statusPill = document.getElementById('user-status');
        if (statusPill) {
            const disp = usuario.disponibilidad ? usuario.disponibilidad.toLowerCase() : 'full-time';
            statusPill.className = "badge rounded-pill px-3 py-2"; 
            
            if (disp === 'full-time') {
                statusPill.textContent = 'Disponible Full Time';
                statusPill.classList.add('bg-dispo-full');
            } else if (disp === 'part-time') {
                statusPill.textContent = 'Disponible Part Time';
                statusPill.classList.add('bg-dispo-part');
            } else if (disp === 'freelance') {
                statusPill.textContent = 'Proyectos Freelance';
                statusPill.classList.add('bg-dispo-free');
            } else {
                statusPill.textContent = 'Disponible';
                statusPill.classList.add('bg-dispo-full');
            }
        }

        // --- SOLUCIÓN PARA LA FOTO/INICIALES (EL FIX QUE BUSCAMOS) ---
        const img = document.getElementById('user-foto');
        if (img) {
            const nombreCodificado = encodeURIComponent(usuario.nombre || "Usuario");
            const avatarUrl = `https://ui-avatars.com/api/?name=${nombreCodificado}&background=00d2ff&color=fff&size=200&bold=true`;

            if (usuario.foto && usuario.foto.trim() !== "" && usuario.foto !== "null") {
                img.src = usuario.foto;
                img.onerror = () => { img.src = avatarUrl; };
            } else {
                img.src = avatarUrl;
            }
        }

        // Manejo de Skills
        const skillsContainer = document.getElementById('user-skills');
        if (skillsContainer) {
            skillsContainer.innerHTML = "";
            let skillsArray = [];
            try { 
                skillsArray = typeof usuario.skills === 'string' ? JSON.parse(usuario.skills) : usuario.skills; 
            } catch (e) { 
                skillsArray = usuario.skills ? usuario.skills.split(',') : []; 
            }
            
            skillsArray.forEach(skill => {
                const s = skill.trim().replace(/[\[\]" ]/g, '');
                if (s) {
                    const badge = document.createElement('span');
                    badge.className = 'badge-skill'; 
                    badge.textContent = s;
                    skillsContainer.appendChild(badge);
                }
            });
        }

        // WhatsApp y Email
        if (usuario.telefono) {
            const numLimpio = usuario.telefono.replace(/\+/g, '').replace(/\s/g, '');
            const msjWA = encodeURIComponent(`Hola ${usuario.nombre}, vi tu perfil en VEXIO...`);
            document.getElementById('link-whatsapp').href = `https://wa.me/${numLimpio}?text=${msjWA}`;
        }
        
        if (usuario.email) {
            const btnMail = document.getElementById('link-email');
            btnMail.href = `mailto:${usuario.email}`;
        }

    } catch (err) { console.error("Error cargando Perfil VEXIO:", err); }
}

// Función global para que el botón del HTML la vea
window.descargarPDF = function() {
    const elemento = document.getElementById("area-cv");
    const nombre = document.getElementById('user-nombre').textContent || 'Perfil';
    elemento.classList.add('modo-pdf-ats');

    const opt = {
        margin: [10, 10, 10, 10],
        filename: `CV_${nombre.replace(/\s+/g, '_')}_VEXIO.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(elemento).save().then(() => {
        elemento.classList.remove('modo-pdf-ats');
    });
}

document.addEventListener('DOMContentLoaded', cargarPerfil);