/* ── Configuração ────────────────────────────────────────────────── */
const DAYS = [
  { label: '14/05 (qui)', key: '14-05' },
  { label: '15/05 (sex)', key: '15-05' },
  { label: '18/05 (seg)', key: '18-05' },
];
const MORNING   = ['10h00','10h30','11h00','11h30','12h00','12h30'];
const AFTERNOON = ['15h00','15h30','16h00','16h30','17h00','17h30','18h00','18h30'];

// URL da API
const API_URL = 'http://localhost:3000/api';

// Flag para usar backend (true) ou localStorage (false)
const USE_BACKEND = true;

/* ── Estado ──────────────────────────────────────────────────────── */
let state = {
  activeDay: DAYS[0].key,
  selectedSlot: null,
};

/* ── Helpers ─────────────────────────────────────────────────────── */
function nextSlot(t) {
  const [h, m] = t.replace('h', ':').split(':').map(Number);
  const total = h * 60 + m + 30;
  return `${String(Math.floor(total / 60)).padStart(2,'0')}h${String(total % 60).padStart(2,'0')}`;
}

function escHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// Validação de entrada no frontend
function validateNome(nome) {
  if (!nome || typeof nome !== 'string') return false;
  if (nome.length > 100 || nome.length < 3) return false;
  return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(nome); // Apenas letras, espaço, hífen, apóstrofo
}

function sanitizeDia(dia) {
  const diasValidos = ['14-05', '15-05', '18-05'];
  return diasValidos.includes(dia) ? dia : null;
}

/* ── Persistência (API Backend ou localStorage) ────────────────────– */
async function loadDay(dayKey) {
  if (USE_BACKEND) {
    try {
      const response = await fetch(`${API_URL}/agendamentos/${dayKey}`);
      if (!response.ok) throw new Error('Erro ao carregar agendamentos');
      const data = await response.json();
      return data.agendamentos || {};
    } catch (error) {
      console.error('Erro ao carregar do backend:', error);
      showToast('Erro ao conectar ao servidor', 'danger');
      return getEmptyDay();
    }
  } else {
    // Fallback localStorage
    const STORAGE_PREFIX = 'fumdesc_';
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + dayKey);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return getEmptyDay();
  }
}

function getEmptyDay() {
  const obj = {};
  [...MORNING, ...AFTERNOON].forEach(t => { obj[t] = [null, null]; });
  return obj;
}

async function saveDay(dayKey, data) {
  if (!USE_BACKEND) {
    const STORAGE_PREFIX = 'fumdesc_';
    try {
      localStorage.setItem(STORAGE_PREFIX + dayKey, JSON.stringify(data));
    } catch(e) {}
  }
  // Com backend, não precisa fazer nada aqui (salva automaticamente na API)
}

/* ── Renderização ────────────────────────────────────────────────── */
async function renderSlots() {
  const data = await loadDay(state.activeDay);
  const container = document.getElementById('slots-container');
  container.innerHTML = '';

  function buildSection(label, times) {
    const lbl = document.createElement('p');
    lbl.className = 'section-label';
    lbl.textContent = label;
    container.appendChild(lbl);

    const grid = document.createElement('div');
    grid.className = 'slots-grid';

    times.forEach(t => {
      const end = nextSlot(t);
      const vacancies = data[t] || [null, null];
      const filled = vacancies.filter(v => v !== null).length;
      const isFull = filled === 2;
      const isSelected = state.selectedSlot === t;

      const btn = document.createElement('button');
      btn.className = 'slot-btn' + (isFull ? ' full' : '') + (isSelected ? ' selected' : '');

      // Criar cabeçalho com horário e badge
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.marginBottom = '4px';

      const timeSpan = document.createElement('span');
      timeSpan.style.fontWeight = '500';
      timeSpan.textContent = `${t} – ${end}`;
      header.appendChild(timeSpan);

      const badge = document.createElement('span');
      let badgeClass = 'badge-avail', badgeText = `${2 - filled} vaga${2 - filled > 1 ? 's' : ''}`;
      if (isFull) { badgeClass = 'badge-full'; badgeText = 'Lotado'; }
      else if (filled === 1) { badgeClass = 'badge-one'; badgeText = '1 vaga'; }
      badge.className = `badge ${badgeClass}`;
      badge.textContent = badgeText;
      header.appendChild(badge);

      btn.appendChild(header);

      // Criar lista de nomes (SEGURO - sem innerHTML)
      const namesDiv = document.createElement('div');
      namesDiv.style.minHeight = '16px';

      vacancies.forEach((name, idx) => {
        if (name) {
          const nameDiv = document.createElement('div');
          nameDiv.className = 'booked-name';
          
          const icon = document.createElement('i');
          icon.className = 'ti ti-user';
          icon.setAttribute('aria-hidden', 'true');
          icon.style.fontSize = '12px';
          nameDiv.appendChild(icon);

          const nameSpan = document.createElement('span');
          nameSpan.textContent = name; // SEGURO - textContent, não innerHTML
          nameDiv.appendChild(nameSpan);

          const removeBtn = document.createElement('button');
          removeBtn.className = 'cancel-x';
          removeBtn.title = 'Remover';
          removeBtn.textContent = '×';
          removeBtn.onclick = (e) => removeBooking(t, idx, e);
          nameDiv.appendChild(removeBtn);

          namesDiv.appendChild(nameDiv);
        }
      });

      btn.appendChild(namesDiv);

      if (!isFull) btn.onclick = () => selectSlot(t);
      grid.appendChild(btn);
    });

    container.appendChild(grid);
  }

  buildSection('Manhã', MORNING);
  buildSection('Tarde', AFTERNOON);
}

/* ── Interações ──────────────────────────────────────────────────── */
async function switchDay(key) {
  state.activeDay = key;
  state.selectedSlot = null;
  document.querySelectorAll('.day-tab').forEach((b, i) => {
    b.classList.toggle('active', DAYS[i].key === key);
  });
  document.getElementById('confirm-area').style.display = 'none';
  await renderSlots();
}

function selectSlot(time) {
  const name = document.getElementById('student-name').value.trim();
  state.selectedSlot = time;

  const day = DAYS.find(d => d.key === state.activeDay);
  const end = nextSlot(time);
  document.getElementById('confirm-summary').textContent =
    `📅 ${day.label}  ·  🕐 ${time} às ${end}`;

  const confirmArea = document.getElementById('confirm-area');
  confirmArea.style.display = 'block';
  document.getElementById('confirm-btn').disabled = !name;
  renderSlots();
  confirmArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function confirmBooking() {
  const name = document.getElementById('student-name').value.trim();
  if (!name || state.selectedSlot === null) return;

  // Validar nome no frontend
  if (!validateNome(name)) {
    showToast('Nome inválido. Use apenas letras, espaços, hífen e apóstrofo (3-100 caracteres)', 'danger');
    return;
  }

  if (USE_BACKEND) {
    // Usar API
    try {
      const response = await fetch(`${API_URL}/agendamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dia: state.activeDay,
          horario: state.selectedSlot,
          nome: name
        })
      });

      if (!response.ok) {
        const error = await response.json();
        showToast(error.error || 'Erro ao confirmar agendamento', 'danger');
        await renderSlots();
        return;
      }

      document.getElementById('confirm-area').style.display = 'none';
      document.getElementById('student-name').value = '';
      state.selectedSlot = null;
      showToast(`✓ ${name}, seu agendamento foi confirmado!`, 'success');
      await renderSlots();
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro ao conectar ao servidor', 'danger');
    }
  } else {
    // Fallback localStorage (código anterior)
    const data = await loadDay(state.activeDay);
    const vacancies = data[state.selectedSlot] || [null, null];

    if (vacancies[0] !== null && vacancies[1] !== null) {
      showToast('Este horário já foi preenchido. Escolha outro.', 'danger');
      await renderSlots();
      return;
    }

    vacancies[vacancies[0] === null ? 0 : 1] = name;
    data[state.selectedSlot] = vacancies;
    await saveDay(state.activeDay, data);

    document.getElementById('confirm-area').style.display = 'none';
    document.getElementById('student-name').value = '';
    state.selectedSlot = null;
    showToast(`✓ ${name}, seu agendamento foi confirmado!`, 'success');
    await renderSlots();
  }
}

async function removeBooking(time, idx, evt) {
  evt.stopPropagation();

  if (USE_BACKEND) {
    // Obter o nome do agendamento atual e remover pela API
    const data = await loadDay(state.activeDay);
    const names = data[time] || [null, null];
    const nameToRemove = names[idx];

    if (!nameToRemove) return;

    try {
      const response = await fetch(
        `${API_URL}/agendamentos/${state.activeDay}/${time}/${encodeURIComponent(nameToRemove)}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        showToast('Erro ao remover agendamento', 'danger');
        return;
      }

      if (state.selectedSlot === time) {
        state.selectedSlot = null;
        document.getElementById('confirm-area').style.display = 'none';
      }
      await renderSlots();
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro ao conectar ao servidor', 'danger');
    }
  } else {
    // Fallback localStorage
    const data = await loadDay(state.activeDay);
    if (data[time]) {
      data[time][idx] = null;
      await saveDay(state.activeDay, data);
      if (state.selectedSlot === time) {
        state.selectedSlot = null;
        document.getElementById('confirm-area').style.display = 'none';
      }
      await renderSlots();
    }
  }
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  t.style.background = `var(--color-bg-${type})`;
  t.style.color      = `var(--color-text-${type})`;
  t.style.border     = `0.5px solid var(--color-border-${type})`;
  setTimeout(() => { t.style.display = 'none'; }, 4000);
}

/* ── Init ────────────────────────────────────────────────────────── */
document.getElementById('student-name').addEventListener('input', (e) => {
  const btn = document.getElementById('confirm-btn');
  const value = e.target.value.trim();
  
  // Validar em tempo real
  if (value && !validateNome(value)) {
    e.target.style.borderColor = 'var(--color-border-danger)';
  } else {
    e.target.style.borderColor = '';
  }
  
  if (btn) btn.disabled = !value || !validateNome(value);
});

// Filtrar entrada em tempo real (apenas caracteres válidos)
document.getElementById('student-name').addEventListener('keypress', (e) => {
  const char = String.fromCharCode(e.which);
  // Permitir apenas: letras, espaço, hífen, apóstrofo, acentuação
  if (!/[a-zA-ZÀ-ÿ\s'-]/.test(char)) {
    e.preventDefault();
  }
});

const tabsContainer = document.getElementById('day-tabs');
DAYS.forEach(d => {
  const btn = document.createElement('button');
  btn.className = 'day-tab' + (d.key === state.activeDay ? ' active' : '');
  btn.textContent = d.label;
  btn.onclick = () => switchDay(d.key);
  tabsContainer.appendChild(btn);
});

// Inicializar renderização
(async () => {
  if (USE_BACKEND) {
    try {
      const healthResponse = await fetch(`${API_URL.replace('/api', '')}/api/health`);
      if (!healthResponse.ok) throw new Error('Servidor offline');
      console.log('✓ Conectado ao servidor backend (seguro)');
    } catch (error) {
      console.warn('Backend não está disponível. Usando localStorage.', error);
      window.USE_BACKEND = false;
    }
  }
  await renderSlots();
})();
