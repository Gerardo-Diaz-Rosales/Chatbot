<template>
  <div class="home">
    <div class="sidebar">
      <Sidebar />
    </div>

    <div class="home-content">
      <h1>Detalles del Cliente</h1>
      <div v-if="cliente">
        <h2>{{ cliente.name }}</h2>
        <p>Email: {{ cliente.email }}</p>
        <p>Teléfono: {{ limpiarNumeroTelefono(cliente.phone_number) }}</p>
        <div v-if="conversaciones.length">
          <h3>Historial de Conversaciones</h3>
          <ul>
            <li v-for="(conversacion, index) in conversaciones" :key="index">
              Conversación #{{ conversacion.id }}
              <ul>
                <li v-for="(mensaje, idx) in mensajes[conversacion.id] || []" :key="idx">
                  <strong>{{ mensaje.sender }}:</strong> {{ mensaje.message }} <small>({{ mensaje.timestamp }})</small>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div>
          <h3>Enviar Mensaje</h3>
          <form @submit.prevent="enviarMensaje">
            <textarea v-model="mensaje" rows="4" placeholder="Escribe tu mensaje aquí"></textarea>
            <button type="submit">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '../components/SideBar.vue';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const route = useRoute();
const cliente = ref(null);
const conversaciones = ref([]);
const mensajes = ref({});
const mensaje = ref('');

const fetchClientDetails = async (clientId) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/client/${clientId}`);
    cliente.value = response.data;
    await fetchClientConversations(clientId);
  } catch (error) {
    console.error('Error al obtener detalles del cliente:', error.response ? error.response.data : error.message);
  }
};

const fetchClientConversations = async (clientId) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/client/${clientId}/conversations`);
    conversaciones.value = response.data;
    await Promise.all(response.data.map(async (conv) => {
      const res = await axios.get(`http://localhost:3000/api/conversation/${conv.id}/messages`);
      mensajes.value[conv.id] = res.data;
    }));
  } catch (error) {
    console.error('Error al obtener historial de conversaciones:', error.response ? error.response.data : error.message);
  }
};

const enviarMensaje = async () => {
    if (cliente.value && mensaje.value.trim()) {
        try {
            const formattedNumber = `${cliente.value.phone_number}@c.us`; // Asegúrate de que el número esté en el formato correcto
            await axios.post('http://localhost:3000/api/send-message', {
                number: formattedNumber,
                message: mensaje.value,
            });
            mensaje.value = '';
        } catch (error) {
            console.error('Error al enviar mensaje:', error.response ? error.response.data : error.message);
        }
    } else {
        console.error('Cliente no disponible o mensaje vacío.');
    }
};


const limpiarNumeroTelefono = (numero) => {
  return numero.replace('@c.us', '');
};

onMounted(() => {
  fetchClientDetails(route.params.id);
});
</script>

<style scoped>
.home {
  display: flex;
  height: 100vh;
  background-color: #f3f1f1;
}

.home-content {
  flex: 1;
  padding: 20px;
  overflow-x: auto;
}

.home-content h1 {
  margin-bottom: 20px;
}

textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
