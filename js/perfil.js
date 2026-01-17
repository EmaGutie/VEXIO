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
        
        // Manejo del Status
        const statusPill = document.getElementById('user-status');
        if (statusPill) {
            statusPill.textContent = usuario.status === 'activo' ? 'Disponible full time' : 'Consultar disponibilidad';
            statusPill.className = `badge rounded-pill px-3 py-2 ${usuario.status === 'activo' ? 'bg-success' : 'bg-warning text-dark'}`;
        }

        // --- SOLUCIÓN PARA LA FOTO/INICIALES ---
        const img = document.getElementById('user-foto');
        if (img) {
            if (usuario.foto && usuario.foto.trim() !== "") {
                img.src = usuario.foto;
                img.crossOrigin = "anonymous"; 
            } else {
                const nombreCodificado = encodeURIComponent(usuario.nombre);
                img.src = `https://ui-avatars.com/api/?name=${nombreCodificado}&background=00d2ff&color=fff&size=200&bold=true`;
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

        // --- CONTACTO PERSONALIZADO NEXU ---
        
        // WhatsApp con mensaje predeterminado
        if (usuario.telefono) {
            const numLimpio = usuario.telefono.replace(/\+/g, '').replace(/\s/g, '');
            const msjWA = encodeURIComponent(`Hola ${usuario.nombre}, vi tu perfil profesional en NEXUZ y me gustaría contactarte.`);
            document.getElementById('link-whatsapp').href = `https://wa.me/${numLimpio}?text=${msjWA}`;
        }
        
        // Email personalizado (Gmail Web) con marca NEXU
        if (usuario.email) {
            const asunto = encodeURIComponent(`Contacto desde NEXUZ | Oportunidad para ${usuario.nombre}`);
            const cuerpo = encodeURIComponent(`Hola ${usuario.nombre},\n\nHe visto tu perfil en la plataforma NEXUZ y me interesa tu experiencia como ${usuario.profesion}.\n\n¿Podríamos coordinar una breve charla?\n\nSaludos.`);
            
            const btnMail = document.getElementById('link-email');
            btnMail.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${usuario.email}&su=${asunto}&body=${cuerpo}`;
        }

    } catch (err) { console.error("Error cargando NEXUZ Profile:", err); }
}

// ... (carga de perfil y supabase igual) ...

// ... (carga de perfil y supabase igual) ...

function descargarPDF() {
    const elemento = document.getElementById("area-cv");
    const nombre = document.getElementById('user-nombre').textContent || 'Perfil';

    // 1. Encendemos la marca de agua
    elemento.classList.add('modo-pdf-ats');

    // 2. Esperamos 100ms para que el CSS se aplique bien antes de la captura
    setTimeout(() => {
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `CV_${nombre.replace(/\s+/g, '_')}_NEXUZ.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, // Bajamos a 2 para mayor compatibilidad de renderizado
                useCORS: true,
                allowTaint: true 
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(elemento).save().then(() => {
            elemento.classList.remove('modo-pdf-ats');
        });
    }, 100); 
}

document.addEventListener('DOMContentLoaded', cargarPerfil);