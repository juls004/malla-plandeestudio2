// =========================
// Datos de materias (completo y simplificado para ejemplo)
// =========================
const materias = [
  { id: '1', nombre: 'Cálculo I', anio: 1, cuatri: 1, correlativas: [] },
  { id: '2', nombre: 'Química General', anio: 1, cuatri: 1, correlativas: [] },
  { id: '3', nombre: 'Intro a la Ingeniería Química', anio: 1, cuatri: 1, correlativas: [] },
  { id: '4', nombre: 'Intro a la Física', anio: 1, cuatri: 1, correlativas: [] },
  { id: '5', nombre: 'Álgebra Lineal', anio: 1, cuatri: 2, correlativas: [] },
  { id: '6', nombre: 'Física', anio: 1, cuatri: 2, correlativas: ['4'] },
  { id: '7', nombre: 'Química Inorgánica', anio: 1, cuatri: 2, correlativas: ['2'] },
  { id: '8', nombre: 'Cálculo II', anio: 2, cuatri: 3, correlativas: ['5'] },
  { id: '9', nombre: 'Electromagnetismo', anio: 2, cuatri: 3, correlativas: ['6'] },
  { id: '10', nombre: 'Informática', anio: 2, cuatri: 3, correlativas: ['5'] },
  { id: '11', nombre: 'Dibujo', anio: 2, cuatri: 3, correlativas: ['ANY:3'] },
  { id: '12', nombre: 'Ecuaciones Diferenciales', anio: 2, cuatri: 4, correlativas: ['8'] },
  { id: '13', nombre: 'Métodos Numéricos', anio: 2, cuatri: 4, correlativas: ['8', '10'] },
  { id: '14', nombre: 'Termodinámica', anio: 2, cuatri: 4, correlativas: ['8'] },
  { id: '15', nombre: 'Química Orgánica', anio: 2, cuatri: 4, correlativas: ['7'] },
  { id: '16', nombre: 'Probabilidad y Estadística', anio: 3, cuatri: 5, correlativas: ['5'] },
  { id: '17', nombre: 'Inglés Técnico I', anio: 3, cuatri: 5, correlativas: ['ANY:3'] },
  { id: '18', nombre: 'Elementos de Estabilidad', anio: 3, cuatri: 5, correlativas: ['5', '6'] },
  { id: '19', nombre: 'Balance de Masa y Energía', anio: 3, cuatri: 5, correlativas: ['10', '14'] },
  { id: '20', nombre: 'Fisicoquímica', anio: 3, cuatri: 5, correlativas: ['12', '13', '14'] },
  // más materias continuarían aquí
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

  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.gap = '30px';
  row.style.overflowX = 'auto';

  for (const anio in materiasPorAnio) {
    const divAnio = document.createElement('div');
    divAnio.className = 'anio';
    divAnio.style.minWidth = '300px';
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

        if (mat.correlativas.length > 0) {
          const correlativasText = mat.correlativas.map(c => {
            if (c.startsWith('ANY:')) return `Mín. ${c.split(':')[1]} materias`;
            const ref = materias.find(m => m.id === c);
            return ref ? `${ref.id}. ${ref.nombre}` : '';
          }).join('<br>');
          divMat.innerHTML += `<div class="correlativas">Requiere:<br>${correlativasText}</div>`;
        }

        const estado = estados[mat.id] || null;
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
    row.appendChild(divAnio);
  }

  container.appendChild(row);
}

function puedeCursarse(materia, estados) {
  let contadorAprobadas = Object.values(estados).filter(e => e).length;
  for (const req of materia.correlativas) {
    if (req.startsWith('ANY:')) {
      const cantidad = parseInt(req.split(':')[1]);
      if (contadorAprobadas < cantidad) return false;
    } else {
      const estado = estados[req];
      if (!estado) return false;
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
