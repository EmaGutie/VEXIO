const supabaseUrl = 'https://nuyeycoyoqlahlwudkpk.supabase.co';
const supabaseKey = 'sb_publishable_HNWXqeyC2Ka_dHncluOJtA_twH5yLeV';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const fotoInput = document.getElementById('foto');
const imgPreview = document.getElementById('img-preview');
const formPerfil = document.getElementById('form-perfil');
const authSection = document.getElementById('auth-section');
const btnLoginGoogle = document.getElementById('btn-login-google');

let fotoUrlActual = ""; 
let usuarioYaExiste = false;

async function verificarSesion() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        if (authSection) authSection.style.display = 'none';
        cargarDatosParaEditar(session.user);
    } else {
        if (authSection) authSection.style.display = 'block';
    }
}

if (btnLoginGoogle) {
    btnLoginGoogle.addEventListener('click', async () => {
        await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: 'https://vexio.com.ar/admin.html' }
        });
    });
}

async function cargarDatosParaEditar(userAuth) {
    const { data } = await supabaseClient.from('usuarios').select('*').eq('user_id', userAuth.id).maybeSingle();
    if (data) {
        usuarioYaExiste = true;
        fotoUrlActual = data.foto || "";
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
        if (data.foto) imgPreview.src = data.foto;
    }
}

// FUNCIÓN CORREGIDA PARA BUCKET: fotos_perfil
async function subirFoto(file, userId) {
    // 1. Limpieza total: sacamos espacios, símbolos y dejamos solo letras/números
    const fileExt = file.name.split('.').pop().toLowerCase();
    const timestamp = Date.now();
    // Creamos un nombre estandarizado: idUsuario-fecha.ext
    const fileName = `${userId}-${timestamp}.${fileExt}`;

    // 2. Subida con "upsert": si el archivo existiera (raro con timestamp), lo pisa.
    const { data, error } = await supabaseClient.storage
        .from('fotos_perfil') 
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (error) {
        console.error("Error detallado de subida:", error);
        throw new Error("No pudimos subir tu foto. Probá con otra imagen.");
    }

    // 3. Obtenemos la URL pública
    const { data: { publicUrl } } = supabaseClient.storage
        .from('fotos_perfil')
        .getPublicUrl(fileName);

    return publicUrl;
}

if (formPerfil) {
    formPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return Swal.fire("Atención", "Iniciá sesión primero.", "warning");

        Swal.fire({ title: 'Publicando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            let fotoFinal = fotoUrlActual;
            if (fotoInput.files && fotoInput.files[0]) {
                fotoFinal = await subirFoto(fotoInput.files[0], session.user.id);
            }

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
                foto: fotoFinal,
                slug: slugFinal
            };

            let res = usuarioYaExiste ? 
                await supabaseClient.from('usuarios').update(datos).eq('user_id', session.user.id) :
                await supabaseClient.from('usuarios').insert([datos]);

            if (res.error) throw res.error;

            Swal.fire("¡Éxito!", "Perfil y foto actualizados", "success").then(() => {
                window.location.href = `usuario.html?user=${slugFinal}`;
            });
        } catch (err) {
            Swal.fire("Error", err.message, "error");
        }
    });
}

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