require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

const app = express();

// Usa /tmp na Vercel (único diretório gravável) ou local para desenvolvimento
// Na Vercel, detecta automaticamente via vercel.json
const LEADS_FILE = process.env.VERCEL_ENV || process.env.NOW_REGION
    ? path.join('/tmp', 'leads.json')
    : path.join(__dirname, '..', 'leads.json');

app.use(cors());
app.use(express.json());

// Função auxiliar para ler leads do arquivo
async function readLeads() {
    try {
        const data = await fs.readFile(LEADS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Se o arquivo não existe, retorna array vazio
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Função auxiliar para salvar leads no arquivo
async function saveLeads(leads) {
    // Garante que o diretório existe
    const dir = path.dirname(LEADS_FILE);
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (error) {
        // Ignora erro se o diretório já existir
    }
    await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
}

// Função para descriptografar lead
async function descriptografarLead(leadCriptografado) {
    try {
        const API_URL = process.env.DECRYPT_API_URL;

        console.log('🔓 [DECRYPT] Descriptografando lead criptografado...');

        const response = await axios.post(API_URL, {
            texto_encriptado: leadCriptografado
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        const decryptedLead = response.data.texto_decriptado;

        console.log('✅ Lead descriptografado com sucesso');
        return decryptedLead;

    } catch (error) {
        throw new Error(`Erro ao descriptografar lead: ${error.message}`);
    }
}

// CREATE - Criar um novo lead
app.post('/api/leads', async (req, res) => {
    try {
        let { lead } = req.body

        // Valida se o lead não é vazio
        if (!lead) {
            return res.status(400).json({
                error: 'Lead não pode ser vazio'
            });
        }

        console.log('📥 Recebendo novo lead (criptografado):', lead);

        const leads = await readLeads();

        // Descriptografa o lead
        const decryptedLead = await descriptografarLead(lead);

        console.log('📝 Lead descriptografado:', decryptedLead);

        // Cria o novo lead
        const newLead = {
            id: Date.now().toString(),
            lead: decryptedLead, // Salva a versão descriptografada
            dataCadastro: new Date().toISOString()
        };

        leads.push(newLead);
        await saveLeads(leads);

        console.log('✅ [CREATE] Lead salvo com ID:', newLead.id);

        res.status(201).json({
            message: 'Lead cadastrado com sucesso!',
            lead: newLead
        });
    } catch (error) {
        console.error('❌ [CREATE] Erro ao salvar lead:', error);
        res.status(500).json({ error: 'Erro ao processar requisição' });
    }
});

// READ - Listar todos osleads
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await readLeads();
        console.log('📖 Total de leads:', leads.length);
        res.json(leads);
    } catch (error) {
        console.error('❌ [READ] Erro ao ler leads:', error);
        res.status(500).json({ error: 'Erro ao processar requisição' });
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API funcionando!' });
});

// Exporta o app para a Vercel
module.exports = app;

