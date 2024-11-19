const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Importar axios corretamente
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Configuração do CORS e Body Parser
app.use(cors());
app.use(bodyParser.json());

// Conexão com MongoDB
const mongoURI = 'mongodb+srv://vinicarraro027:1234@cluster0.0af4udx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((error) => console.error('Erro ao conectar ao MongoDB:', error.message));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Conectado ao MongoDB');
});

// Definição do esquema e modelo para mensagens com IP
const messageSchema = new mongoose.Schema({
  role: { type: String, required: true },
  text: { type: String, required: true },
  ip: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Função para obter o IP público do cliente usando Ipify
async function getClientIp() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('Erro ao obter o IP público:', error.message);
    return 'unknown';
  }
}

// Endpoint para comunicação com a API externa
app.post('/api/chat', async (req, res) => {
  const { input } = req.body;
  const ip = await getClientIp(); // Obtém o IP público do cliente

  try {
    const apiKey = 'AIzaSyA7WmDaJakqNkJIkjBQ3gWxkG5mGGlBE4Y'; // Substitua pela sua chave de API
    const response = await axios.post('https://render-chat-7e7w.onrender.com', 
      { input },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseText = response.data.responseText; // Ajuste conforme a resposta da API

    // Salvar histórico de bate-papo no MongoDB com IP
    await saveChatHistory('user', input, ip);
    await saveChatHistory('bot', responseText, ip);

    res.json({ responseText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Função para salvar mensagens no MongoDB com IP
async function saveChatHistory(role, text, ip) {
  try {
    const newMessage = new Message({ role, text, ip });
    await newMessage.save();
  } catch (error) {
    console.error('Erro ao salvar mensagem no MongoDB:', error.message);
  }
}

// Endpoint para salvar mensagens manualmente no MongoDB
app.post('/api/save-message', async (req, res) => {
  const { role, text } = req.body;
  const ip = await getClientIp(); // Obtém o IP público do cliente

  if (!role || !text) {
    return res.status(400).json({ message: 'Campos "role" e "text" são obrigatórios' });
  }

  try {
    const newMessage = new Message({ role, text, ip });
    await newMessage.save();
    res.status(200).json(newMessage);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao salvar mensagem', error: error.message });
  }
});

// Exportar a função para ser utilizada pelo Vercel
module.exports = app;