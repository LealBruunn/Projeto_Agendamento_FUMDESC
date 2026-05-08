# 🗄️ Configuração do Supabase

## 1. Criar Tabela no Supabase

Acesse o dashboard do Supabase e execute este SQL no Editor de SQL:

```sql
-- Criar tabela agendamentos
CREATE TABLE agendamentos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  dia TEXT NOT NULL,
  horario TEXT NOT NULL,
  nome TEXT NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(dia, horario, nome)
);

-- Criar índice para performance
CREATE UNIQUE INDEX idx_dia_horario_nome ON agendamentos(dia, horario, nome);

-- Habilitar Row Level Security (RLS)
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (permitir leitura pública)
CREATE POLICY "Permitir SELECT público" 
  ON agendamentos FOR SELECT 
  USING (true);

-- Política para INSERT (permitir criação pública)
CREATE POLICY "Permitir INSERT público" 
  ON agendamentos FOR INSERT 
  WITH CHECK (true);

-- Política para DELETE (permitir deleção pública)
CREATE POLICY "Permitir DELETE público" 
  ON agendamentos FOR DELETE 
  USING (true);
```

---

## 2. Variáveis de Ambiente

Seu arquivo `.env` já deve ter:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xytlmjrrgdjwgtouwcfe.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_N9jj1By10EiTnEk6M7F01w_ZWFF5ule
```

---

## 3. Iniciar o Backend

```bash
cd backend
npm install
npm start
```

---

## 4. Testar Conexão

```bash
# Testar GET
curl http://localhost:3000/api/agendamentos/14-05

# Testar POST
curl -X POST http://localhost:3000/api/agendamentos \
  -H "Content-Type: application/json" \
  -d '{"dia":"14-05","horario":"10h00","nome":"João Silva"}'

# Testar DELETE
curl -X DELETE "http://localhost:3000/api/agendamentos/14-05/10h00/João%20Silva"
```

---

## ✅ Pronto!

O backend agora está conectado ao Supabase. 🎉
