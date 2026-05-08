# Sistema de Agendamento FUMDESC 2026.2

Um sistema de agendamento responsivo e moderno para documentação na FUMDESC com **backend em Node.js** e **banco de dados SQLite**.

## Estrutura do Projeto

```
Sistema_Agendamento/
├── index.html           # Arquivo HTML principal
├── css/
│   └── styles.css      # Estilos CSS
├── js/
│   └── script.js       # Lógica JavaScript (integração com API)
├── backend/            # 🆕 Servidor Node.js + Express
│   ├── server.js       # Servidor principal
│   ├── database.js     # Camada de banco de dados (SQLite)
│   ├── package.json    # Dependências Node
│   ├── agendamentos.db # Banco de dados (criado automaticamente)
│   └── README.md       # Documentação do backend
├── sistema.html        # Arquivo original (backup)
└── README.md           # Este arquivo
```

## 🚀 Como Usar

### Modo 1: Apenas Frontend (localStorage)
Abra `index.html` no navegador - não precisa de servidor!
- ✅ Rápido
- ✅ Sem dependências
- ❌ Dados só ficam locais (não sincroniza)

### Modo 2: Com Backend (recomendado)

#### 1. Instalar dependências
```bash
cd backend
npm install
```

#### 2. Iniciar o servidor
```bash
npm start
# ou para desenvolvimento com hot-reload:
npm run dev
```

O servidor rodará em: **http://localhost:3000**

#### 3. Abrir o sistema
Abra **http://localhost:3000** no navegador

## ✨ Recursos

✅ Design responsivo (Mobile, Tablet, Desktop)
✅ Tema claro e escuro
✅ **Banco de dados SQLite (novo!)**
✅ **API REST completa (novo!)**
✅ Sincronização entre dispositivos (com backend)
✅ Persistência local (localStorage como fallback)
✅ Validação de dados
✅ Mensagens de feedback
✅ Acessibilidade
✅ Animações suaves
✅ Icons (Tabler Icons)

## Navegadores Suportados

- Chrome/Chromium (recomendado)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Autor

Sistema desenvolvido para Auxiliar a secretária da minha faculdade com agendamento FUMDESC 2026.2
