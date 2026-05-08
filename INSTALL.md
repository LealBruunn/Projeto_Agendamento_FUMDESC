## 🚀 Guia de Instalação Rápida

### Pré-requisitos
- Node.js 14+ (download em https://nodejs.org/)
- npm (vem com Node.js)

### Instalação e Execução

#### Windows (PowerShell)

1. Abra PowerShell na pasta do projeto

2. Instale as dependências:
```powershell
cd backend
npm install
```

3. Inicie o servidor:
```powershell
npm start
```

Você verá:
```
╔════════════════════════════════════════╗
║  Sistema de Agendamento FUMDESC 2026   ║
╠════════════════════════════════════════╣
║  ✓ Servidor rodando em:                ║
║    http://localhost:3000               ║
║                                        ║
║  ✓ API disponível em:                  ║
║    http://localhost:3000/api/health    ║
╚════════════════════════════════════════╝
```

4. Abra o navegador em: **http://localhost:3000**

---

#### Linux / macOS

1. Abra o terminal na pasta do projeto

2. Instale as dependências:
```bash
cd backend
npm install
```

3. Inicie o servidor:
```bash
npm start
```

4. Abra o navegador em: **http://localhost:3000**

---

### ✅ Verificar Instalação

Abra outro terminal e teste a API:

```bash
curl http://localhost:3000/api/health
```

Você deve receber:
```json
{"status":"ok","mensagem":"Servidor rodando!"}
```

---

### 🔄 Modo Desenvolvimento (hot-reload)

Instale o nodemon globalmente (opcional):
```bash
npm install -g nodemon
```

Depois use:
```bash
npm run dev
```

O servidor reiniciará automaticamente quando você salvar alterações!

---

### 🛑 Parar o Servidor

Pressione `Ctrl + C` no terminal

---

### 🆘 Problemas Comuns

**"npm: comando não encontrado"**
- Instale Node.js em https://nodejs.org/

**"EADDRINUSE: address already in use :::3000"**
- A porta 3000 está em uso. Use outra porta:
```bash
PORT=3001 npm start
```

**"Module not found"**
- Rode `npm install` novamente

**Banco de dados corrompido**
- Remova `agendamentos.db` e reinicie

---

### 📖 Próximos Passos

- Leia [backend/README.md](backend/README.md) para documentação completa da API
- Consulte [README.md](README.md) para estrutura geral do projeto

---

**Sucesso! 🎉 O sistema está rodando!**
