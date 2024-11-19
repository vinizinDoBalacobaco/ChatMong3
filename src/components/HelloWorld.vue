<template>
  <div id="a">
    <h1>Chat-Bot</h1>
    <input type="text" v-model="form.meuInput" @keyup.enter="sendMessage" placeholder="Digite sua mensagem...">
    <input type="button" value="Enviar" @click="sendMessage">
    <ul class="chat-messages">
      <li v-for="(message, index) in messages.slice().reverse()" :key="index"
        :class="['chat-message', message.role + '-message']">
        {{ message.text }}
      </li>
    </ul>
  </div>
  <h5>Desenvolvido por Vinícius Carraro</h5>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HelloWorld',
  data() {
    return {
      form: {
        meuInput: ""
      },
      messages: [],
      loading: false,
    };
  },
  methods: {
    async sendMessage() {
      if (!this.form.meuInput.trim()) return;

      const userInput = this.form.meuInput;
      this.messages.push({ role: "user", text: userInput });

      this.loading = true;
      this.messages.push({ role: "loading", text: "Carregando..." });
      this.form.meuInput = "";

      try {
        const responseText = await this.getBotResponse(userInput);
        this.messages.pop();
        this.messages.push({ role: "bot", text: responseText });
        await this.saveMessageToServer({ role: "user", text: userInput });
        await this.saveMessageToServer({ role: "bot", text: responseText });
      } catch (error) {
        console.error("Error fetching bot response:", error);
        this.messages.pop();
        this.messages.push({ role: "bot", text: "Desculpe, ocorreu um erro ao obter a resposta." });
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          const chatMessages = document.querySelector('.chat-messages');
          chatMessages.scrollTop = chatMessages.scrollHeight;
        });
      }
    },

    async getBotResponse(userInput) {
      try {
        const response = await axios.post(
          'https://render-chat-7e7w.onrender.com/api/chat',
          { input: userInput },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data.responseText;
      } catch (error) {
        console.error("Erro ao obter resposta do bot:", error);
        throw error;
      }
    },

    async saveMessageToServer(message) {
      try {
        const response = await axios.post(
          'https://render-chat-7e7w.onrender.com/api/chat',   
          message, 
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('Erro ao salvar mensagem no servidor:', error.message);
      }
    }
  }
}
</script>

<style scoped>
#a {
  font-family: 'Roboto', sans-serif;
  padding: 20px;
  background-color: #f0f4f8;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

h1 {
  color: #333;
  margin-bottom: 20px;
  font-size: 2rem;
  text-align: center;
}

input[type="text"],
input[type="button"] {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 16px;
  margin-top: 0px;
  margin-right: 5px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
}

input[type="button"] {
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

ul.chat-messages {
  margin-top: 20px;
  padding: 0;
  list-style-type: none;
  width: 100%;
  max-width: 500px;
  overflow-y: auto;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.chat-message {
  padding: 10px 15px;
  border-radius: 10px;
  margin-bottom: 10px;
  max-width: 70%;
  word-break: break-word;
}

.user-message {
  color: #fff;
  background-color: #007bff;
  align-self: flex-end;
  text-align: right;
}

.bot-message {
  background-color: #e0e0e0;
  color: #333;
  align-self: flex-start;
  text-align: left;
}

.loading-message {
  font-style: italic;
  color: #999;
  align-self: center;
}
</style>