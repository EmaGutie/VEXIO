const supabaseUrl = 'https://nuyeycoyoqlahlwudkpk.supabase.co';
const supabaseKey = 'sb_publishable_HNWXqeyC2Ka_dHncluOJtA_twH5yLeV';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function cargarPerfil() {
    const params = new URLSearchParams(window.location.search);
    const userSlug = params.get('user');

    if (!userSlug) return;

    const { data, error } = await _supabase
        .from('usuarios')
        .select('*')
        .eq('slug', userSlug)
        .single();

    if (data) {
        // 1. Carga de Textos en la Web
        if(document.getElementById('user-nombre')) document.getElementById('user-nombre').innerText = data.nombre;
        if(document.getElementById('user-profesion')) document.getElementById('user-profesion').innerText = data.profesion;
        if(document.getElementById('user-status')) document.getElementById('user-status').innerText = data.status;
        if(document.getElementById('user-sobremi')) document.getElementById('user-sobremi').innerText = data.sobre_mi;
        
        if(document.getElementById('user-ubicacion')) {
            if (data.ubicacion) {
                document.getElementById('user-ubicacion').innerHTML = `<i class="bi bi-geo-alt"></i> ${data.ubicacion}`;
                document.getElementById('user-ubicacion').style.display = 'block';
            } else {
                document.getElementById('user-ubicacion').style.display = 'none';
            }
        }

        if(document.getElementById('user-experiencia')) {
            document.getElementById('user-experiencia').innerText = data.experiencia || "Sin experiencia cargada";
        }
        if(document.getElementById('user-educacion')) {
            document.getElementById('user-educacion').innerText = data.educacion || "Sin educación cargada";
        }

        const fotoElement = document.getElementById('user-foto');
        if(fotoElement && data.foto) {
            fotoElement.src = data.foto;
        }
        
        document.documentElement.style.setProperty('--main-color', data.color || '#2563eb');

        const btnWs = document.getElementById('btn-ws');
        if(btnWs && data.telefono) {
            btnWs.href = `https://wa.me/${data.telefono.replace(/\s+/g, '')}`;
        }

        // 2. Procesamiento de Skills
        const container = document.getElementById('user-skills');
        let skillsTextoSimple = ""; // Para el PDF ATS
        if (container && data.skills) {
            container.innerHTML = ""; 
            let skillsArray = [];
            try {
                skillsArray = JSON.parse(data.skills);
            } catch(e) {
                skillsArray = data.skills.split(',').map(s => s.trim());
            }
            skillsTextoSimple = skillsArray.join(" • ");
            skillsArray.forEach(s => {
                if(s.length > 0) {
                    const span = document.createElement('span');
                    span.className = 'badge bg-primary-subtle text-primary border border-primary-subtle p-2 m-1';
                    span.innerText = s;
                    container.appendChild(span);
                }
            });
        }

        // 3. Lógica del PDF ATS (Versión limpia)
        const btnPdf = document.getElementById('btn-pdf');
        if (btnPdf) {
            btnPdf.addEventListener('click', function () {
                const atsContainer = document.getElementById('cv-ats-container');
                
                // Llenamos el contenedor invisible con los datos reales
                document.getElementById('pdf-nombre').innerText = data.nombre;
                document.getElementById('pdf-profesion').innerText = data.profesion;
                document.getElementById('pdf-contacto').innerText = `${data.ubicacion || ''} | WhatsApp: ${data.telefono || ''}`;
                document.getElementById('pdf-sobremi').innerText = data.sobre_mi;
                document.getElementById('pdf-experiencia').innerText = data.experiencia;
                document.getElementById('pdf-educacion').innerText = data.educacion;
                document.getElementById('pdf-skills').innerText = skillsTextoSimple;

                // Dentro de la función del click de btnPdf, actualizá estas opciones:
                const opciones = {
                    margin: 0.5, // Medio pulgada de margen en todos los lados
                    filename: `CV_${data.nombre.replace(/\s+/g, '_')}_ATS.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 3, 
                        useCORS: true, 
                        letterRendering: true,
                        scrollY: 0 // Importante para que no capture el scroll de la web
                    },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                };

                // Mostramos temporalmente el contenedor para que html2pdf lo vea
                atsContainer.style.display = 'block';

                html2pdf().set(opciones).from(atsContainer).save().then(() => {
                    // Lo ocultamos nuevamente
                    atsContainer.style.display = 'none';
                });
            });
        }

    } else if (error) {
        console.error("Error cargando perfil:", error.message);
    }
}

cargarPerfil();