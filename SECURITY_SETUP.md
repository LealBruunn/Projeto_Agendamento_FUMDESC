# 🔒 Guia de Segurança - Sistema de Agendamento

## ✅ Proteções Implementadas

### 1. **Helmet.js** - Headers de Segurança HTTP
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security (HSTS)
Content-Security-Policy
```

### 2. **CORS Restritivo**
- ✅ Apenas origens autorizadas podem acessar
- ✅ Métodos restritos (GET, POST, DELETE)
- ✅ Headers customizados validados

### 3. **Rate Limiting**
- ✅ 100 requisições por IP em 15 minutos (geral)
- ✅ 5 requisições por IP em 15 minutos (rotas admin)
- ✅ Proteção contra força bruta e DoS

### 4. **Validação de Entrada**
- ✅ Tamanho limitado: máx 100 caracteres em nomes
- ✅ Apenas caracteres alfanuméricos, espaço, hífen e apóstrofo
- ✅ Formato de hora validado (HH:MM)
- ✅ Datas restritas a valores válidos

### 5. **Prevenção de XSS**
- ✅ Usando `textContent` em vez de `innerHTML`
- ✅ Criação segura de elementos DOM
- ✅ Escape automático de caracteres especiais

### 6. **Autenticação Admin**
- ✅ Rotas admin requerem token Bearer
- ✅ Token em variável de ambiente
- ✅ Rate limit adicional em rotas sensíveis

### 7. **SQL Injection Prevention**
- ✅ Prepared statements (parametrized queries)
- ✅ ORM-like approach com placeholders (?)

### 8. **Redação de Erros**
- ✅ Erros não expõem estrutura do sistema
- ✅ Mensagens genéricas ao usuário
- ✅ Logs detalhados apenas no servidor

---

## 🚀 Configuração para Produção

### 1. Crie arquivo `.env`
```bash
cp backend/.env.example backend/.env
```

### 2. Edite `backend/.env`
```env
# Mude TODOS estes valores!
PORT=3000
NODE_ENV=production
ADMIN_TOKEN=gerar_senha_aleatoria_forte_aqui
ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
FRONTEND_URL=https://seu-dominio.com
```

### 3. Gerar Token Seguro
Use um destes geradores:
- https://1password.com/password-generator/
- https://www.random.org/strings/
- Linux: `openssl rand -hex 32`

**Exemplo de token forte:**
```
a7f9c2e1d8b3a4f5e9c7d1a6b8f2e3c9
```

### 4. Instale Dependências
```bash
cd backend
npm install --only=production
```

### 5. Inicie em Produção
```bash
NODE_ENV=production npm start
```

---

## 🔐 Segurança Adicional (Recomendado)

### Reverse Proxy (Nginx)
Adicione rate limiting extra e HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name seu-dominio.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Rate limit
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
    
    location /api/ {
        limit_req zone=api burst=5;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker (Isolamento)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install --only=production
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
```

### Firewall
- Abra apenas portas 80 (HTTP) e 443 (HTTPS)
- Bloqueie acesso direto à porta 3000

### Backup do Banco
```bash
# Backup automático diário
0 2 * * * cp /app/backend/agendamentos.db /backups/agendamentos-$(date +\%Y\%m\%d).db
```

---

## 🧪 Teste de Segurança

### 1. Teste XSS
```javascript
// Tente no formulário:
"><script>alert('XSS')</script>

// Resultado esperado: ❌ BLOQUEADO (apenas textContent)
```

### 2. Teste Rate Limiting
```bash
for i in {1..120}; do
  curl http://localhost:3000/api/agendamentos/14-05
done

# Resultado esperado: ❌ Bloqueado após 100 requisições
```

### 3. Teste CORS
```bash
curl -H "Origin: https://evil.com" http://localhost:3000/api/agendamentos/14-05

# Resultado esperado: ❌ CORS error
```

### 4. Teste Admin
```bash
# Sem token
curl http://localhost:3000/api/admin/todos
# Resultado: ❌ 403 Forbidden

# Com token errado
curl -H "Authorization: Bearer wrong_token" http://localhost:3000/api/admin/todos
# Resultado: ❌ 403 Forbidden

# Com token correto
curl -H "Authorization: Bearer seu_token_aqui" http://localhost:3000/api/admin/todos
# Resultado: ✅ 200 OK
```

---

## 📋 Checklist de Segurança

- [ ] `.env` criado com valores únicos
- [ ] ADMIN_TOKEN alterado
- [ ] ALLOWED_ORIGINS atualizado
- [ ] NODE_ENV=production
- [ ] HTTPS ativado
- [ ] Firewall configurado
- [ ] Backups automáticos
- [ ] Logs monitorados
- [ ] Atualizações de dependências
- [ ] Rate limit testado
- [ ] CORS testado
- [ ] XSS testado

---

## 🚨 Resposta a Incidente

### Senha Comprometida
```bash
# 1. Gere nova senha
# 2. Atualize .env
# 3. Reinicie servidor
npm restart
```

### Ataque DoS
```bash
# 1. Aumentar rate limit (server.js)
# 2. Adicionar IP ao firewall
# 3. Usar CloudFlare/CDN
```

### Banco Corrompido
```bash
# 1. Restaurar backup
cp /backups/agendamentos-20260508.db backend/agendamentos.db
# 2. Reiniciar
npm restart
```

---

## 📚 Referências

- OWASP Top 10: https://owasp.org/Top10/
- Node.js Security Checklist: https://blog.risingstack.com/node-js-security-checklist/
- Express Security: https://expressjs.com/en/advanced/best-practice-security.html
- Helmet Documentation: https://helmetjs.github.io/

---

**Última atualização:** 08/05/2026
**Status:** ✅ Seguro para Produção
