// =========================
// Datos de materias (resumido aquí)
// =========================
const materias = [
  { id: '1', nombre: 'Cálculo I', anio: 1, cuatri: 1, correlativas: [] },
  { id: '2', nombre: 'Química General', anio: 1, cuatri: 1, correlativas: [] },
  { id: '3', nombre: 'Intro a la Ingeniería Química', anio: 1, cuatri: 1, correlativas: [] },
  { id: '4', nombre: 'Intro a la Física', anio: 1, cuatri: 1, correlativas: [] },
  { id: '5', nombre: 'Álgebra Lineal', anio: 1, cuatri: 2, correlativas: [] },
  { id: '6', nombre: 'Física', anio: 1, cuatri: 2, correlativas: ['4'] },
  { id: '7', nombre: 'Química Inorgánica', anio: 1, cuatri: 2, correlativas: ['2'] },
  // ... (completar con todas las materias restantes)
];

// =========================
// Variables de usuario
// =========================
let usuario = null;

function obtenerEstadoMaterias() {
  const datos = JSON.parse(localStorage.getItem('malla_usuario_' + usuario)) || {};
  return datos;
}

function guardarEstadoMaterias(estados) {
  localStorage.setItem('malla_usuario_' + usuario, JSON.stringify(estados));
}

function iniciarUsuario() {
  const input = document.getElementById('username');
  usuario = input.value.trim();
  if (!usuario) return alert('Por favor ingresa un nombre válido');
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('app-container').style.display = 'block';
  crearMalla();
}

function crearMalla() {
  const container = document.getElementById('malla-container');
  container.innerHTML = '';
  const estados = obtenerEstadoMaterias();

  const materiasPorAnio = {};
  for (const mat of materias) {
    if (!materiasPorAnio[mat.anio]) materiasPorAnio[mat.anio] = [];
    materiasPorAnio[mat.anio].push(mat);
  }

  for (const anio in materiasPorAnio) {
    const divAnio = document.createElement('div');
    divAnio.className = 'anio';
    divAnio.innerHTML = `<h2>Año ${anio}</h2>`;

    const cuatris = {};
    for (const mat of materiasPorAnio[anio]) {
      if (!cuatris[mat.cuatri]) cuatris[mat.cuatri] = [];
      cuatris[mat.cuatri].push(mat);
    }

    for (const cuatri in cuatris) {
      const divCuatri = document.createElement('div');
      divCuatri.className = 'cuatrimestre';

      for (const mat of cuatris[cuatri]) {
        const divMat = document.createElement('div');
        divMat.className = 'materia';
        divMat.id = `materia-${mat.id}`;
        divMat.innerHTML = `<div class="nombre">${mat.id}. ${mat.nombre}</div>`;

        // Mostrar correlativas (solo numéricas, no condiciones especiales)
        if (mat.correlativas.length > 0) {
          const correlativasText = mat.correlativas.map(c => {
            const ref = materias.find(m => m.id === c);
            return ref ? `${ref.id}. ${ref.nombre}` : '';
          }).join('<br>');
          divMat.innerHTML += `<div class="correlativas">Requiere:<br>${correlativasText}</div>`;
        }

        const estado = estados[mat.id] || null; // null, 'regularizada', 'aprobada'
        const habilitada = puedeCursarse(mat, estados);

        if (!habilitada && !estado) {
          divMat.classList.add('bloqueada');
        } else {
          divMat.addEventListener('click', () => cambiarEstado(mat.id));
          if (estado === 'aprobada') {
            divMat.classList.add('aprobada');
          } else if (estado === 'regularizada') {
            divMat.classList.add('regularizada');
          } else {
            divMat.classList.add('disponible');
          }
        }

        divCuatri.appendChild(divMat);
      }

      divAnio.appendChild(divCuatri);
    }
    container.appendChild(divAnio);
  }
}

function puedeCursarse(materia, estados) {
  let contadorAprobadas = Object.values(estados).filter(e => e).length;
  for (const req of materia.correlativas) {
    if (req.startsWith('ANY:')) {
      const cantidad = parseInt(req.split(':')[1]);
      if (contadorAprobadas < cantidad) return false;
    } else {
      const estado = estados[req];
      if (!estado) return false; // ni regularizada ni aprobada
    }
  }
  return true;
}

function cambiarEstado(id) {
  const estados = obtenerEstadoMaterias();
  const actual = estados[id];

  if (!actual) {
    estados[id] = 'regularizada';
  } else if (actual === 'regularizada') {
    estados[id] = 'aprobada';
  } else {
    delete estados[id];
  }

  guardarEstadoMaterias(estados);
  crearMalla();
}

// Si hay un usuario guardado, podrías usarlo automáticamente (opcional)
// usuario = localStorage.getItem('ultimo_usuario');
// if (usuario) iniciarUsuario();
