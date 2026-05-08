# Backend - Sistema de Agendamento FUMDESC

Backend Node.js + Express + SQLite para o sistema de agendamento.

## 🚀 Instalação

### Pré-requisitos
- Node.js 14+ instalado
- npm ou yarn

### Instalação de Dependências

```bash
cd backend
npm install
```

## ▶️ Iniciar o Servidor

### Modo Desenvolvimento (com hot-reload)
```bash
npm run dev
```

### Modo Produção
```bash
npm start
```

O servidor rodará em: **http://localhost:3000**

## 📡 API Endpoints

### GET /api/agendamentos/:dia
Obter todos os agendamentos de um dia

**Exemplo:**
```bash
curl http://localhost:3000/api/agendamentos/14-05
```

**Resposta:**
```json
{
  "dia": "14-05",
  "agendamentos": {
    "10h00": ["João Silva", null],
    "10h30": [null, null],
    "15h00": ["Maria Santos", "Pedro Costa"]
  }
}
```

---

### POST /api/agendamentos
Adicionar novo agendamento

**Corpo da Requisição:**
```json
{
  "dia": "14-05",
  "horario": "10h00",
  "nome": "João Silva"
}
```

**Resposta (201):**
```json
{
  "mensagem": "Agendamento confirmado!",
  "id": 1,
  "dia": "14-05",
  "horario": "10h00",
  "nome": "João Silva"
}
```

---

### DELETE /api/agendamentos/:dia/:horario/:nome
Remover um agendamento

**Exemplo:**
```bash
curl -X DELETE http://localhost:3000/api/agendamentos/14-05/10h00/João%20Silva
```

**Resposta:**
```json
{
  "mensagem": "Agendamento removido com sucesso",
  "dia": "14-05",
  "horario": "10h00",
  "nome": "João Silva"
}
```

---

### GET /api/admin/todos
Listar TODOS os agendamentos (admin)

**Resposta:**
```json
{
  "total": 5,
  "agendamentos": [
    {
      "id": 1,
      "dia": "14-05",
      "horario": "10h00",
      "nome": "João Silva",
      "data_criacao": "2026-05-08 17:30:00"
    }
  ]
}
```

---

### DELETE /api/admin/limpar/:dia
Limpar TODOS agendamentos de um dia (admin)

**Exemplo:**
```bash
curl -X DELETE http://localhost:3000/api/admin/limpar/14-05
```

---

### GET /api/health
Health check do servidor

**Resposta:**
```json
{
  "status": "ok",
  "mensagem": "Servidor rodando!"
}
```

## 🗄️ Banco de Dados

O banco de dados SQLite é criado automaticamente em `agendamentos.db`.

### Schema da Tabela

```sql
CREATE TABLE agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dia TEXT NOT NULL,
  horario TEXT NOT NULL,
  nome TEXT NOT NULL,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(dia, horario, nome)
);
```

## 🔧 Configuração

### Variáveis de Ambiente

Criar arquivo `.env` na raiz de `backend/`:

```env
PORT=3000
NODE_ENV=development
```

## 📝 Estrutura de Arquivos

```
backend/
├── server.js          # Servidor Express
├── database.js        # Camada de banco de dados
├── package.json       # Dependências
├── agendamentos.db    # Banco de dados (criado automaticamente)
├── .gitignore         # Arquivos a ignorar no git
└── README.md          # Este arquivo
```

## 🧪 Testes com cURL

### Listar agendamentos
```bash
curl http://localhost:3000/api/agendamentos/14-05
```

### Criar agendamento
```bash
curl -X POST http://localhost:3000/api/agendamentos \
  -H "Content-Type: application/json" \
  -d '{"dia":"14-05","horario":"10h00","nome":"João Silva"}'
```

### Remover agendamento
```bash
curl -X DELETE http://localhost:3000/api/agendamentos/14-05/10h00/João%20Silva
```

### Health check
```bash
curl http://localhost:3000/api/health
```

## 🚨 Troubleshooting

### "EADDRINUSE: address already in use :::3000"
A porta 3000 já está em uso. Use outra porta:
```bash
PORT=3001 npm start
```

### "Module not found: express"
Rode `npm install` novamente:
```bash
npm install
```

### Banco de dados corrompido
Remova o arquivo `agendamentos.db` e reinicie:
```bash
rm agendamentos.db
npm start
```

## 📦 Dependências

- **express** - Framework web
- **cors** - Habilitar CORS
- **sqlite3** - Banco de dados
- **body-parser** - Parse JSON
- **nodemon** (dev) - Hot reload

## 🎯 Próximos Passos

1. ✅ Frontend já está configurado para usar a API
2. Implementar autenticação de usuário
3. Adicionar validação de email
4. Criar dashboard admin
5. Hospedar em produção (Heroku, Railway, Render)

## 📄 Licença

MIT

---

**Precisa de ajuda?** Verifique a documentação do Express: https://expressjs.com/
