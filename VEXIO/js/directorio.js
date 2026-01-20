const supabaseUrl = 'https://nuyeycoyoqlahlwudkpk.supabase.co';
const supabaseKey = 'sb_publishable_HNWXqeyC2Ka_dHncluOJtA_twH5yLeV';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function cargarDirectorio() {
    const contenedor = document.getElementById('contenedor-talentos');

    // 1. Pedimos todos los usuarios a Supabase
    const { data: usuarios, error } = await _supabase
        .from('usuarios')
        .select('nombre, profesion, foto, slug, color');

    if (error) {
        contenedor.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        return;
    }

    contenedor.innerHTML = ""; // Limpiamos el spinner

    // 2. Creamos la tarjeta para cada usuario
    usuarios.forEach(user => {
        const card = document.title = `
            <div class="col-md-4 mb-4">
                <div class="card card-perfil h-100 shadow-sm">
                    <img src="${user.foto || 'img/default.jpg'}" class="card-img-top img-directorio" alt="${user.nombre}">
                    <div class="card-body text-center">
                        <h5 class="card-title fw-bold">${user.nombre}</h5>
                        <p class="card-text text-secondary">${user.profesion}</p>
                        <a href="usuario.html?user=${user.slug}" class="btn btn-primary w-100" style="background-color: ${user.color}">
                            Ver Perfil Completo
                        </a>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += card;
    });
}

cargarDirectorio();