const CARACTERES = {
  mayusculas: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  minusculas: 'abcdefghijklmnopqrstuvwxyz',
  numeros: '0123456789',
  simbolos: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

let historialContrasenas = [];

function generarContrasena(opciones) {
  const {
    longitud = 12,
    incluirMayusculas = false,
    incluirMinusculas = true,
    incluirNumeros = false,
    incluirSimbolos = false
  } = opciones;

  if (!incluirMayusculas && !incluirMinusculas && !incluirNumeros && !incluirSimbolos) {
    return { error: 'Debes seleccionar al menos un tipo de carácter.' };
  }

  let pool = '';
  if (incluirMayusculas) pool += CARACTERES.mayusculas;
  if (incluirMinusculas) pool += CARACTERES.minusculas;
  if (incluirNumeros) pool += CARACTERES.numeros;
  if (incluirSimbolos) pool += CARACTERES.simbolos;

  let contrasena = '';
  for (let i = 0; i < longitud; i++) {
    const indiceAleatorio = Math.floor(Math.random() * pool.length);
    contrasena += pool[indiceAleatorio];
  }

  const fortaleza = calcularFortaleza(contrasena, opciones);
  guardarEnHistorial(contrasena);

  return {
    contrasena: contrasena,
    fortaleza: fortaleza,
    error: null
  };
}

function calcularFortaleza(contrasena, opciones) {
  let puntos = 0;

  // Puntos por longitud
  if (contrasena.length >= 8) puntos += 1;
  if (contrasena.length >= 12) puntos += 1;
  if (contrasena.length >= 16) puntos += 1;

  let tiposSeleccionados = 0;
  if (opciones.incluirMayusculas) tiposSeleccionados++;
  if (opciones.incluirMinusculas) tiposSeleccionados++;
  if (opciones.incluirNumeros) tiposSeleccionados++;
  if (opciones.incluirSimbolos) tiposSeleccionados++;

  if (tiposSeleccionados >= 3) puntos += 1;
  if (tiposSeleccionados === 4) puntos += 1;

  if (puntos <= 2) {
    return { nivel: 'Débil', barras: 1, clase: 'weak' };
  } else if (puntos <= 3) {
    return { nivel: 'Aceptable', barras: 2, clase: 'medium' };
  } else if (puntos <= 4) {
    return { nivel: 'Buena', barras: 3, clase: 'good' };
  } else {
    return { nivel: 'Fuerte', barras: 4, clase: 'strong' };
  }
}

function guardarEnHistorial(nuevaContrasena) {
  historialContrasenas.unshift(nuevaContrasena);
  if (historialContrasenas.length > 5) {
    historialContrasenas.pop();
  }
}

async function copiarAlPortapapeles(texto) {
  if (!texto || texto === 'Haz clic en generar') return false;
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (err) {
    console.error('Error al copiar: ', err);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('passwordInput');
  const copyBtn = document.getElementById('copyBtn');
  
  const strengthText = document.getElementById('strengthText');
  const bars = [
    document.getElementById('bar1'),
    document.getElementById('bar2'),
    document.getElementById('bar3'),
    document.getElementById('bar4')
  ];

  const lengthRange = document.getElementById('lengthRange');
  const lengthValue = document.getElementById('lengthValue');

  const uppercase = document.getElementById('uppercase');
  const lowercase = document.getElementById('lowercase');
  const numbers = document.getElementById('numbers');
  const symbols = document.getElementById('symbols');

  const generateBtn = document.getElementById('generateBtn');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const toast = document.getElementById('toast');

  if (lengthRange && lengthValue) {
    lengthRange.addEventListener('input', (e) => {
      lengthValue.textContent = e.target.value;
    });
  }

  generateBtn.addEventListener('click', () => {
    const opciones = {
      longitud: parseInt(lengthRange.value, 10),
      incluirMayusculas: uppercase.checked,
      incluirMinusculas: lowercase.checked,
      incluirNumeros: numbers.checked,
      incluirSimbolos: symbols.checked
    };

    const resultado = generarContrasena(opciones);

    if (resultado.error) {
      alert(resultado.error);
      return;
    }

    passwordInput.textContent = resultado.contrasena;

    actualizarFortalezaUI(resultado.fortaleza, strengthText, bars);

    renderizarHistorial(historyList);
  });

  copyBtn.addEventListener('click', async () => {
    const exito = await copiarAlPortapapeles(passwordInput.textContent);
    if (exito) {
      mostrarToast(toast);
    }
  });

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      historialContrasenas = [];
      renderizarHistorial(historyList);
    });
  }
});

function actualizarFortalezaUI(fortaleza, elementoTexto, barras) {
  elementoTexto.textContent = fortaleza.nivel;

  barras.forEach((bar, index) => {
    // Resetear clases previas
    bar.className = 'bar';
    
    if (index < fortaleza.barras) {
      bar.classList.add('active', fortaleza.clase);
    }
  });
}

function mostrarToast(elementoToast) {
  if (!elementoToast) return;
  elementoToast.classList.add('show');
  setTimeout(() => {
    elementoToast.classList.remove('show');
  }, 2000);
}

function renderizarHistorial(elementoLista) {
  if (!elementoLista) return;

  if (historialContrasenas.length === 0) {
    elementoLista.innerHTML = '<li class="empty-history">No hay contraseñas generadas</li>';
    return;
  }

  elementoLista.innerHTML = historialContrasenas
    .map(pass => `<li>${pass}</li>`)
    .join('');
}