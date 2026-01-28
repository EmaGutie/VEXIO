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

// 1. Verificar sesión
async function verificarSesion() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (session) {
        if (authSection) authSection.style.display = 'none';
        cargarDatosParaEditar(session.user);
    } else {
        if (authSection) authSection.style.display = 'block';
    }
}

// 2. Login
if (btnLoginGoogle) {
    btnLoginGoogle.addEventListener('click', async () => {
        await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: 'https://vexio.com.ar/admin.html' }
        });
    });
}

// 3. Cargar datos
async function cargarDatosParaEditar(userAuth) {
    const { data, error } = await supabaseClient
        .from('usuarios')
        .select('*')
        .eq('user_id', userAuth.id)
        .maybeSingle();

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

// 4. FUNCIÓN PARA SUBIR FOTO (Corregida con el nombre FOTOS_PERFILES)
async function subirFoto(file, userId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    // Usamos el nombre del bucket que tenés en Supabase
    const { data, error } = await supabaseClient.storage
        .from('FOTOS_PERFILES') 
        .upload(fileName, file);

    if (error) throw error;

    // Obtenemos la URL pública del mismo bucket
    const { data: { publicUrl } } = supabaseClient.storage
        .from('FOTOS_PERFILES')
        .getPublicUrl(fileName);

    return publicUrl;
}

// 5. Submit del formulario
if (formPerfil) {
    formPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (!session) {
            return Swal.fire("Atención", "Iniciá sesión con Google para publicar.", "warning");
        }

        Swal.fire({ title: 'Publicando perfil...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

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

            let res;
            if (usuarioYaExiste) {
                res = await supabaseClient.from('usuarios').update(datos).eq('user_id', session.user.id);
            } else {
                res = await supabaseClient.from('usuarios').insert([datos]);
            }

            if (res.error) throw res.error;

            Swal.fire({
                icon: 'success',
                title: '¡Vexio Actualizado!',
                text: 'Tu perfil y foto están listos.',
                confirmButtonColor: '#00d2ff'
            }).then(() => {
                window.location.href = `usuario.html?user=${slugFinal}`;
            });

        } catch (err) {
            console.error(err);
            Swal.fire("Error", "No pudimos guardar: " + err.message, "error");
        }
    });
}

// Preview de imagen
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