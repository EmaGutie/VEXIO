const supabaseUrl = 'https://nuyeycoyoqlahlwudkpk.supabase.co';
const supabaseKey = 'sb_publishable_HNWXqeyC2Ka_dHncluOJtA_twH5yLeV';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- CONFIGURACIÓN GLOBAL VEXIO ---
const CONFIG_BRAND = {
    nombre: "VEXIO",
    emailSoporte: "vexiosoporte@gmail.com"
};

const fotoInput = document.getElementById('foto');
const imgPreview = document.getElementById('img-preview');
let urlDisponible = true; 

// --- LÓGICA DE MODAL LEGAL ACTUALIZADA (VEXIO) ---
const textosLegales = {
    privacidad: `
        <h2 class="fw-bold mb-3">Política de Privacidad - ${CONFIG_BRAND.nombre}</h2>
        <p>En <strong>${CONFIG_BRAND.nombre}</strong>, la privacidad de nuestros talentos es prioridad. Los datos personales expuestos han sido proporcionados voluntariamente por los usuarios para su difusión profesional.</p>
        <p>No vendemos bases de datos a terceros. La información es utilizada únicamente para conectar reclutadores con candidatos.</p>`,
    
    terminos: `
        <h2 class="fw-bold mb-3">Términos y Condiciones</h2>
        <p>Al utilizar esta plataforma, el usuario acepta que la veracidad de la información en su perfil es de su entera responsabilidad.</p>
        <p><strong>¿Deseas eliminar tu perfil?</strong> Envíanos un correo desde tu dirección registrada a: <br>
        <a href="mailto:${CONFIG_BRAND.emailSoporte}?subject=Solicitud de Baja de Perfil&body=Hola, solicito la eliminación de mi perfil en ${CONFIG_BRAND.nombre}." class="fw-bold text-primary">${CONFIG_BRAND.emailSoporte}</a></p>`,
    
    cookies: `
        <h2 class="fw-bold mb-3">Política de Cookies</h2>
        <p>Utilizamos cookies técnicas para mantener la sesión de usuario y mejorar la velocidad de carga del directorio de talentos de ${CONFIG_BRAND.nombre}.</p>`
};

window.mostrarModal = function(tipo) {
    const modal = document.getElementById('modalLegal');
    const contenido = document.getElementById('contenidoLegal');
    if (modal && contenido && textosLegales[tipo]) {
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

window.onclick = function(event) {
    const modal = document.getElementById('modalLegal');
    if (event.target == modal) cerrarModal();
};

// --- VISTA PREVIA DE IMAGEN ---
if (fotoInput) {
    fotoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => imgPreview.src = e.target.result;
            reader.readAsDataURL(file);
        }
    });
}

// --- VALIDACIÓN DE URL EN TIEMPO REAL ---
const slugInput = document.getElementById('slug');
if (slugInput) {
    slugInput.addEventListener('blur', async (e) => {
        let slug = e.target.value.toLowerCase().trim().replace(/\s+/g, '-');
        e.target.value = slug; 

        const feedback = document.getElementById('slug-feedback');
        
        if (slug.length < 3) {
            feedback.textContent = "⚠️ El nombre debe ser más largo";
            feedback.style.color = "#ffc107";
            feedback.style.display = "block";
            urlDisponible = false;
            return;
        }

        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('slug')
            .eq('slug', slug)
            .maybeSingle();

        if (data) {
            feedback.textContent = "❌ Este nombre ya está ocupado. Elige otro.";
            feedback.style.color = "#ff6b6b";
            feedback.style.display = "block";
            urlDisponible = false;
        } else {
            feedback.textContent = "✅ ¡Nombre disponible!";
            feedback.style.color = "#51cf66";
            feedback.style.display = "block";
            urlDisponible = true;
        }
    });
}

// --- ENVÍO DEL FORMULARIO ---
const formPerfil = document.getElementById('form-perfil');
if (formPerfil) {
    formPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const checkbox = document.getElementById('checkConsentimiento');
        if (!checkbox || !checkbox.checked) {
            Swal.fire({ 
                icon: 'info', 
                title: 'Consentimiento necesario', 
                text: `Para que los reclutadores puedan encontrarte en ${CONFIG_BRAND.nombre}, debes aceptar compartir tus datos profesionales.` 
            });
            return;
        }

        if (!urlDisponible) {
            Swal.fire({ 
                icon: 'warning', 
                title: 'Nombre no disponible', 
                text: 'Por favor, elige una URL personalizada que no esté en uso.' 
            });
            return;
        }

        Swal.fire({
            title: 'Publicando en VEXIO...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const file = fotoInput.files[0];
            let fotoUrlFinal = "";

            if (file) {
                const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
                await supabaseClient.storage.from('fotos_perfiles').upload(fileName, file);
                const { data } = supabaseClient.storage.from('fotos_perfiles').getPublicUrl(fileName);
                fotoUrlFinal = data.publicUrl;
            }

            const slugUsuario = document.getElementById('slug').value.toLowerCase().trim();
            const skillsText = document.getElementById('skills')?.value || "";
            const skillsArray = skillsText.split(',').map(s => s.trim()).filter(s => s !== "");

            const { error: insertError } = await supabaseClient
                .from('usuarios')
                .insert([{
                    slug: slugUsuario,
                    nombre: document.getElementById('nombre')?.value || "",
                    profesion: document.getElementById('profesion')?.value || "",
                    telefono: document.getElementById('telefono')?.value || "",
                    email: document.getElementById('email')?.value || "",
                    sobre_mi: document.getElementById('sobre_mi')?.value || "",
                    experiencia: document.getElementById('experiencia')?.value || "",
                    educacion: document.getElementById('educacion')?.value || "",
                    skills: JSON.stringify(skillsArray),
                    foto: fotoUrlFinal,
                    status: "activo",
                    ubicacion: document.getElementById('ubicacion')?.value || "Argentina"
                }]);

            if (insertError) throw insertError;

            Swal.close();
            const baseUrl = window.location.href.split('admin.html')[0];
            const linkCompleto = `${baseUrl}usuario.html?user=${slugUsuario}`;

            document.getElementById('main-card').style.display = 'none';
            document.getElementById('success-box').style.display = 'block';
            document.getElementById('link-generado').value = linkCompleto;
            
            const btnVer = document.getElementById('btn-ver-perfil');
            if(btnVer) btnVer.href = linkCompleto;

        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        }
    });
}

window.copiarAlPortapapeles = function() {
    const input = document.getElementById('link-generado');
    if (!input) return;
    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
        Swal.fire({ 
            icon: 'success', 
            title: '¡Link Copiado!', 
            text: 'Tu perfil de VEXIO ya está listo para compartir.',
            confirmButtonColor: '#3b82f6'
        });
    });
};