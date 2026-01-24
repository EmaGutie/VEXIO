const supabaseUrl = 'https://nuyeycoyoqlahlwudkpk.supabase.co';
const supabaseKey = 'sb_publishable_HNWXqeyC2Ka_dHncluOJtA_twH5yLeV';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function cargarDirectorio() {
    const contenedor = document.getElementById('usuarios-lista');
    if (!contenedor) return;

    try {
        const { data: usuarios, error } = await supabaseClient
            .from('usuarios').select('*').order('created_at', { ascending: false });

        if (error) throw error;
        contenedor.innerHTML = "";

        usuarios.forEach(user => {
            const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=00d2ff&color=fff&size=200&bold=true`;
            const fotoUrl = (user.foto && user.foto.startsWith('http')) ? user.foto : fallback;

            const col = document.createElement('div');
            col.className = "col-md-4 mb-4";
            
            // Creamos el contenido
            col.innerHTML = `
                <div class="card-talento text-center p-4">
                    <div class="mb-3">
                        <img src="${fotoUrl}" 
                            class="rounded-circle border border-3 border-info img-estilo-fijo" 
                            style="width:100px; height:100px; object-fit:cover;">
                    </div>
                    <h5 class="fw-bold mb-1">${user.nombre}</h5>
                    <p class="text-muted small">${user.profesion}</p>
                    <a href="usuario.html?user=${user.slug}" class="btn-premium-sm">Ver Portfolio</a>
                </div>
            `;

            // Agregamos el manejador de errores manualmente para evitar el titileo del atributo HTML
            const imgElement = col.querySelector('img');
            imgElement.onerror = function() {
                this.src = fallback;
                this.onerror = null; // Detiene cualquier bucle de error
            };

            contenedor.appendChild(col);
        });
    } catch (err) { console.error("Error Directorio:", err); }
}
document.addEventListener('DOMContentLoaded', cargarDirectorio);