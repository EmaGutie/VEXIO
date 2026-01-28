const supabaseUrl = 'https://nuyeycoyoqlahlwudkpk.supabase.co';
const supabaseKey = 'sb_publishable_HNWXqeyC2Ka_dHncluOJtA_twH5yLeV';

// Inicialización de Supabase
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const fotoInput = document.getElementById('foto');
const imgPreview = document.getElementById('img-preview');
const formPerfil = document.getElementById('form-perfil');
const authSection = document.getElementById('auth-section');
const btnLoginGoogle = document.getElementById('btn-login-google');

let fotoActual = ""; 
let usuarioYaExiste = false;

// 1. Verificar sesión al cargar la página
async function verificarSesion() {
    console.log("Verificando sesión...");
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error) {
        console.error("Error obteniendo sesión:", error.message);
        return;
    }

    if (session) {
        console.log("Sesión activa detectada:", session.user.email);
        // Ocultar sección de login si ya está autenticado
        if (authSection) authSection.style.display = 'none';
        cargarDatosParaEditar(session.user);
    } else {
        console.warn("No hay sesión. Mostrando botón de login.");
        if (authSection) authSection.style.display = 'block';
    }
}

// 2. Lógica del botón de Login con Google
if (btnLoginGoogle) {
    btnLoginGoogle.addEventListener('click', async () => {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'https://vexio.com.ar/admin.html'
            }
        });
        if (error) {
            Swal.fire("Error", "Error al conectar con Google: " + error.message, "error");
        }
    });
}

// 3. Cargar datos si el usuario ya tiene perfil
async function cargarDatosParaEditar(userAuth) {
    const { data, error } = await supabaseClient
        .from('usuarios')
        .select('*')
        .eq('user_id', userAuth.id)
        .maybeSingle();

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

// 4. Lógica de Guardado (Submit)
if (formPerfil) {
    formPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (!session) {
            return Swal.fire({
                icon: "warning",
                title: "Inicia sesión",
                text: "Por favor, hacé clic en el botón de Google arriba antes de publicar.",
                confirmButtonColor: '#00d2ff'
            });
        }

        Swal.fire({ title: 'Guardando perfil...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

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
                resultado = await supabaseClient.from('usuarios').update(datos).eq('user_id', session.user.id);
            } else {
                resultado = await supabaseClient.from('usuarios').insert([datos]);
            }

            if (resultado.error) throw resultado.error;

            Swal.fire({ 
                icon: 'success', 
                title: '¡Perfil Publicado!', 
                text: 'Tu portfolio ya está online.',
                confirmButtonColor: '#00d2ff'
            }).then(() => {
                window.location.href = `usuario.html?user=${slugFinal}`;
            });

        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error al guardar', text: err.message });
        }
    });
}

// Lógica de preview de foto
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