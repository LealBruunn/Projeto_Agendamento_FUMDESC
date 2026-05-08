const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
require('dotenv').config();

const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123'; // ⚠️ Deve estar em .env em produção!
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5000'];
const DIAS_VALIDOS = ['14-05', '15-05', '18-05'];

// ========== SEGURANÇA ==========

// 1. Helmet - Headers de segurança
app.use(helmet());

// 2. CORS restritivo
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// 3. Rate limiting - Proteção contra força bruta e DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máx 100 requisições por IP
  message: 'Muitas requisições, tente novamente em alguns minutos',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Máx 5 por IP em 15 min
  message: 'Muitas tentativas. Aguarde antes de tentar novamente',
});

app.use(limiter); // Aplicar a todas as rotas
app.use('/api/admin/', strictLimiter); // Limiter mais rigoroso para admin

// 4. Body parser com limite
app.use(bodyParser.json({ limit: '1kb' })); // Limita tamanho de requisição

// 5. Middleware de autenticação admin
function authAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Acesso negado. Token inválido.' });
  }
  next();
}

// 6. Middleware de validação de dia
function validateDay(req, res, next) {
  const { dia } = req.params;
  if (!DIAS_VALIDOS.includes(dia)) {
    return res.status(400).json({ error: 'Data inválida' });
  }
  next();
}

// 7. Middleware de validação de input
function sanitizeInput(req, res, next) {
  const { dia, horario, nome } = req.body;
  
  if (nome) {
    // Validar tamanho
    if (nome.length > 100) {
      return res.status(400).json({ error: 'Nome muito longo (máx 100 caracteres)' });
    }
    // Validar apenas caracteres permitidos
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(nome)) {
      return res.status(400).json({ error: 'Nome contém caracteres inválidos' });
    }
  }
  
  if (horario) {
    // Validar formato HH:MM
    if (!/^\d{2}h\d{2}$/.test(horario)) {
      return res.status(400).json({ error: 'Formato de horário inválido' });
    }
  }
  
  next();
}

app.use(express.static(path.join(__dirname, '..')));

// ========== API ROUTES ==========

// GET /api/agendamentos/:dia - Obter agendamentos de um dia
app.get('/api/agendamentos/:dia', validateDay, async (req, res) => {
  try {
    const { dia } = req.params;
    const rows = await db.getAgendamentos(dia);

    const horarios = {};
    if (rows && Array.isArray(rows)) {
      rows.forEach(row => {
        if (!horarios[row.horario]) {
          horarios[row.horario] = [null, null];
        }
        const idx = horarios[row.horario].findIndex(v => v === null);
        if (idx !== -1) {
          horarios[row.horario][idx] = row.nome;
        }
      });
    }

    res.json({ dia, agendamentos: horarios });
  } catch (err) {
    console.error('Erro ao buscar agendamentos:', err);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

// POST /api/agendamentos - Adicionar novo agendamento
app.post('/api/agendamentos', sanitizeInput, async (req, res) => {
  try {
    const { dia, horario, nome } = req.body;

    if (!dia || !horario || !nome) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Validar dia
    if (!DIAS_VALIDOS.includes(dia)) {
      return res.status(400).json({ error: 'Data inválida' });
    }

    const rows = await db.getAgendamentos(dia);
    const horarioRows = rows ? rows.filter(r => r.horario === horario) : [];
    
    if (horarioRows.length >= 2) {
      return res.status(409).json({ error: 'Este horário está lotado' });
    }

    const result = await db.adicionarAgendamento(dia, horario, nome);

    res.status(201).json({
      mensagem: 'Agendamento confirmado!',
      id: result?.id,
      dia,
      horario,
      nome
    });
  } catch (err) {
    if (err.message && err.message.includes('duplicate')) {
      return res.status(409).json({ error: 'Agendamento já existe' });
    }
    console.error('Erro ao adicionar agendamento:', err);
    res.status(500).json({ error: 'Erro ao salvar agendamento' });
  }
});

// DELETE /api/agendamentos/:dia/:horario/:nome - Remover agendamento
app.delete('/api/agendamentos/:dia/:horario/:nome', validateDay, async (req, res) => {
  try {
    const { dia, horario, nome } = req.params;

    // Validar entrada
    if (!nome || nome.length > 100) {
      return res.status(400).json({ error: 'Nome inválido' });
    }

    await db.removerAgendamento(dia, horario, decodeURIComponent(nome));
    res.json({ mensagem: 'Agendamento removido' });
  } catch (err) {
    console.error('Erro ao remover agendamento:', err);
    res.status(500).json({ error: 'Erro ao remover agendamento' });
  }
});

// GET /api/admin/todos - Listar todos os agendamentos (PROTEGIDO)
app.get('/api/admin/todos', authAdmin, async (req, res) => {
  try {
    const rows = await db.todosAgendamentos();
    res.json({ total: rows ? rows.length : 0, agendamentos: rows || [] });
  } catch (err) {
    console.error('Erro ao buscar dados:', err);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// DELETE /api/admin/limpar/:dia - Limpar todos agendamentos de um dia (PROTEGIDO)
app.delete('/api/admin/limpar/:dia', authAdmin, validateDay, async (req, res) => {
  try {
    const { dia } = req.params;
    await db.limparAgendamentos(dia);
    res.json({ mensagem: `Agendamentos do dia ${dia} removidos` });
  } catch (err) {
    console.error('Erro ao limpar agendamentos:', err);
    res.status(500).json({ error: 'Erro ao limpar agendamentos' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Servir arquivo principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ========== INICIALIZAÇÃO ==========

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Sistema de Agendamento FUMDESC 2026   ║
║              🔒 SEGURO                 ║
╠════════════════════════════════════════╣
║  ✓ Servidor em: http://localhost:${PORT}      ║
║  ✓ Helmet ativado                      ║
║  ✓ CORS restritivo                     ║
║  ✓ Rate limiting ativo                 ║
║  ✓ Validação rigorosa                  ║
╚════════════════════════════════════════╝
  `);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason) => {
  console.error('Erro não tratado:', reason.message || reason);
  process.exit(1);
});

