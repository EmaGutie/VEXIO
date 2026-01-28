const supabaseUrl = 'https://nuyeycoyoqlahlwudkpk.supabase.co';
const supabaseKey = 'sb_publishable_HNWXqeyC2Ka_dHncluOJtA_twH5yLeV';

// Inicialización correcta
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const fotoInput = document.getElementById('foto');
const imgPreview = document.getElementById('img-preview');
const formPerfil = document.getElementById('form-perfil');
let fotoActual = ""; 
let usuarioYaExiste = false;

// Función para verificar sesión al cargar
async function verificarSesion() {
    console.log("Verificando sesión...");
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error) {
        console.error("Error obteniendo sesión:", error.message);
        return;
    }

    if (session) {
        console.log("Sesión activa detectada para:", session.user.email);
        cargarDatosParaEditar(session.user);
    } else {
        console.warn("No hay sesión activa. El usuario debe iniciar sesión con Google.");
    }
}

async function cargarDatosParaEditar(userAuth) {
    const { data, error } = await supabaseClient
        .from('usuarios')
        .select('*')
        .eq('user_id', userAuth.id)
        .maybeSingle();

    if (error) console.error("Error al cargar datos:", error.message);

    if (data) {
        usuarioYaExiste = true;
        fotoActual = data.foto || "";
        
        document.getElementById('nombre').value = data.nombre || "";
        document.getElementById('profesion').value = data.profesion || "";
        document.getElementById('slug').value = data.slug || "";
        document.getElementById('slug').readOnly = true; 
        document.getElementById('categoria').value = data.categoria || "";
        document.getElementById('ubicacion').value = data.ubicacion || "";
        document.getElementById('telefono').value = data.telefono || "";
        document.getElementById('email').value = data.email || "";
        document.getElementById('disponibilidad').value = data.disponibilidad || "jornada completa";
        document.getElementById('skills').value = data.skills || ""; 
        document.getElementById('sobre_mi').value = data.sobre_mi || "";
        document.getElementById('experiencia').value = data.experiencia || "";
        document.getElementById('educacion').value = data.educacion || "";
        
        if (data.foto && data.foto.startsWith('http')) {
            imgPreview.src = data.foto;
        }
    }
}

if (formPerfil) {
    formPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Obtenemos la sesión justo antes de guardar
        const { data: { session }, error: sessionErr } = await supabaseClient.auth.getSession();

        if (!session) {
            return Swal.fire({
                icon: "error",
                title: "Sesión no iniciada",
                text: "Debes iniciar sesión con Google antes de publicar.",
                footer: '<a href="login.html">Ir al login</a>'
            });
        }

        Swal.fire({ title: 'Guardando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            let fotoUrlFinal = fotoActual;
            const slugFinal = document.getElementById('slug').value.toLowerCase().trim();

            const datos = {
                user_id: session.user.id,
                nombre: document.getElementById('nombre').value,
                profesion: document.getElementById('profesion').value,
                categoria: document.getElementById('categoria').value,
                telefono: document.getElementById('telefono').value,
                email: document.getElementById('email').value,
                sobre_mi: document.getElementById('sobre_mi').value,
                experiencia: document.getElementById('experiencia').value,
                educacion: document.getElementById('educacion').value,
                skills: document.getElementById('skills').value, 
                disponibilidad: document.getElementById('disponibilidad').value,
                ubicacion: document.getElementById('ubicacion').value,
                foto: fotoUrlFinal,
                slug: slugFinal
            };

            let resultado;
            if (usuarioYaExiste) {
                resultado = await supabaseClient
                    .from('usuarios')
                    .update(datos)
                    .eq('user_id', session.user.id);
            } else {
                resultado = await supabaseClient
                    .from('usuarios')
                    .insert([datos]);
            }

            if (resultado.error) throw resultado.error;

            Swal.fire({ 
                icon: 'success', 
                title: '¡Perfil Guardado!', 
                text: 'Te estamos redirigiendo a tu portfolio.',
                confirmButtonColor: '#00d2ff'
            }).then(() => {
                window.location.href = `usuario.html?user=${slugFinal}`;
            });

        } catch (err) {
            console.error("Error en el guardado:", err);
            Swal.fire({ icon: 'error', title: 'Error al guardar', text: err.message });
        }
    });
}

// Lógica de preview de imagen
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

document.addEventListener('DOMContentLoaded', verificarSesion);