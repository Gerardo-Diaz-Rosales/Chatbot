<template>
  <div class="home">
    <div class="sidebar">
      <Sidebar />
    </div>

    <div class="home-content">
      <h1>Clientes Potenciales</h1>
      <div class="leads-table">
        <table class="leads-table-container">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cliente, index) in clientesPotenciales" :key="index">
              <td>
                <router-link :to="{ name: 'posible-cliente', params: { id: cliente.id } }">
                  {{ cliente.name }}
                </router-link>
              </td>
              <td>{{ cliente.email }}</td>
              <td>{{ limpiarNumeroTelefono(cliente.phone_number) }}</td>
              <td>{{ cliente.is_cliente ? 'Cliente' : 'Potencial Cliente' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '../components/SideBar.vue';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const clientesPotenciales = ref([]);

const fetchPotentialClients = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/potential-clients');
    clientesPotenciales.value = response.data;
  } catch (error) {
    console.error('Error al obtener clientes potenciales:', error.response ? error.response.data : error.message);
  }
};

const limpiarNumeroTelefono = (numero) => {
  return numero.replace('@c.us', '');
};

onMounted(() => {
  fetchPotentialClients();
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
  overflow-x: auto; /* Habilita el desplazamiento horizontal si es necesario */
}

.home-content h1 {
  margin-bottom: 20px;
}

.leads-table {
  max-height: calc(100vh - 200px); /* Altura máxima de la tabla, ajusta según necesites */
  overflow-y: auto; /* Habilita el desplazamiento vertical */
}

.leads-table-container {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
}

.leads-table-container th,
.leads-table-container td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
  color: #333;
}

.leads-table-container th {
  background-color: #f2f2f2; /* Fondo gris claro para encabezados */
  color: #555; /* Color de texto gris medio */
  padding: 12px;
}
</style>
