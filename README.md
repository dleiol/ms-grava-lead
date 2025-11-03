# API de Captura de Leads

API para capturar e armazenar leads usando arquivo JSON.

## 🚀 Como usar

### Instalar dependências
```bash
npm install
```

### Rodar a API
```bash
npm start
```
A API estará rodando em https://ms-grava-lead.vercel.app

Local: http://localhost:1126

## 📋 Endpoints

### POST `/api/leads`
Salva um novo lead.

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "lead": "2106ef67a45f63a65e717d951a0b5c1b:f6f29cb26907c124cacde57cbfddb2178a0709b715b275880c2cd79bbb4a996fce0b8825faed696b903cc5e9b4039cd8"
  }'
```

### GET `/api/leads`
Lista todos os leads salvos.

### GET `/health`
Verifica se a API está funcionando.

## 💾 Armazenamento

Os leads são salvos no arquivo `leads.json` na raiz do projeto.

