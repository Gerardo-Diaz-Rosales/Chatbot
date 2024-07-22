<template>
  <div class="container">
    <h1>Detalles del Cliente Potencial</h1>
    <div v-if="cliente" class="client-details">
      <p><strong>Nombre:</strong> {{ cliente.name }}</p>
      <p><strong>Estado:</strong> {{ cliente.status }}</p>
      <p><strong>Teléfono:</strong> {{ cliente.phone_number }}</p>
      <p><strong>Correo:</strong> {{ cliente.email }}</p>
      <p><strong>Departamento:</strong> {{ cliente.department }}</p>
      <p><strong>Fecha de Asignación:</strong> {{ cliente.assignment_date }}</p>
    </div>
    <div v-else>
      <p>No se encontró la información del cliente.</p>
    </div>

    <h2>Historial de Conversaciones</h2>
    <div v-if="historialConversaciones.length > 0">
      <div v-for="conversacion in historialConversaciones" :key="conversacion.conversation_id" class="conversation">
        <h3>Conversación ID: {{ conversacion.conversation_id }}</h3>
        <p><strong>Operador:</strong> {{ conversacion.operator_name }}</p>
        <p><strong>Inicio:</strong> {{ conversacion.start_time }}</p>
        <p><strong>Status:</strong> {{ conversacion.status }}</p>

        <h4>Mensajes:</h4>
        <ul>
          <li v-for="mensaje in conversacion.mensajes" :key="mensaje.message_id">
            <strong>{{ mensaje.sender_name }}:</strong> {{ mensaje.content }} ({{ mensaje.timestamp }})
          </li>
        </ul>

        <!-- Formulario para enviar un mensaje -->
        <form @submit.prevent="sendMessage(conversacion.conversation_id)">
          <textarea v-model="newMessage" placeholder="Escribe tu mensaje"></textarea>
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
    <div v-else>
      <p>No se encontraron conversaciones para este cliente.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const cliente = ref(null);
const historialConversaciones = ref([]);
const newMessage = ref('');
const userId = ref(2);  // ID del operador (esto debe ser dinámico según el usuario logueado)

const fetchClientDetails = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/potential-clients/${route.params.id}`);
    cliente.value = response.data;
  } catch (error) {
    console.error('Error al obtener detalles del cliente:', error.response ? error.response.data : error.message);
  }
};

const fetchConversations = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/conversations`, { params: { client_id: route.params.id } });
    const conversations = response.data;

    for (const conversation of conversations) {
      const messagesResponse = await axios.get(`http://localhost:3000/api/messages`, { params: { conversation_id: conversation.conversation_id } });
      conversation.mensajes = messagesResponse.data;
    }

    historialConversaciones.value = conversations;
  } catch (error) {
    console.error('Error al obtener historial de conversaciones:', error.response ? error.response.data : error.message);
  }
};

const sendMessage = async (conversationId) => {
  const messageData = {
    conversation_id: conversationId,
    sender_type: 'operador',
    user_id: userId.value,
    content: newMessage.value,
    content_type: 'texto'
  };

  try {
    await axios.post('http://localhost:3000/api/messages/send', messageData);
    newMessage.value = '';  // Limpiar el contenido del textarea
    
    // Redirigir a la misma página
    this.$router.push({ path: this.$route.path });  // Esto recargará la vista actual
  } catch (error) {
    console.error('Error al enviar el mensaje:', error.response ? error.response.data : error.message);
  }
};



onMounted(() => {
  fetchClientDetails();
  fetchConversations();
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.client-details p {
  margin: 8px 0;
}

.conversation {
  margin-top: 20px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.conversation h3 {
  margin-top: 0;
}

.conversation p {
  margin: 4px 0;
}

.conversation ul {
  list-style: none;
  padding: 0;
}

.conversation ul li {
  margin: 5px 0;
  padding: 10px;
  background-color: #f1f1f1;
  border-radius: 4px;
}

form {
  margin-top: 10px;
}

textarea {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  resize: vertical;
}

button {
  display: inline-block;
  padding: 10px 20px;
  margin-top: 10px;
  border: none;
  border-radius: 4px;
  background-color: #28a745;
  color: white;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background-color: #218838;
}
</style>
