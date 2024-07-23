<template>
  <div class="home">
    <div class="sidebar">
      <Sidebar />
    </div>

    <div class="home-content">
      <h1>Usuarios Nuevos</h1>
      <button @click="crearNuevoUsuario" class="leads-add-btn">Crear un nuevo usuario</button>
      <div class="leads-table">
        <table class="leads-table-container">
          <thead>
            <tr>
              <th>Teléfono</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(usuario, index) in usuariosNuevos" :key="index">
              <td>
                <router-link :to="`/posible-cliente/${usuario.user_id}`">{{ usuario.phone_number }}</router-link>
              </td>
              <td>{{ usuario.status }}</td>
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

const usuariosNuevos = ref([]);

const fetchNewUsers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/new-users');
    usuariosNuevos.value = response.data;
  } catch (error) {
    console.error('Error al obtener usuarios nuevos:', error.response ? error.response.data : error.message);
  }
};

onMounted(() => {
  fetchNewUsers();
});

const crearNuevoUsuario = () => {
  usuariosNuevos.value.push({
    phone_number: 'Nuevo Número',
    status: 'new'
  });
};
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

.leads-add-btn {
  background-color: #28a745; /* Color verde */
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin-bottom: 20px;
  margin-left: 80%;
  cursor: pointer;
  border-radius: 5px;
  margin-right: 20px; /* Margen derecho para separación */
}

.leads-add-btn:hover {
  background-color: #218838; /* Cambio de tono en hover */
}
</style>
