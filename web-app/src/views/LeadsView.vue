<template>
  <div class="home">
    <div class="sidebar">
      <Sidebar />
    </div>

    <div class="home-content">
      <h1>Posibles clientes</h1>
      <button @click="crearNuevoCliente" class="leads-add-btn">Crear un posible cliente</button>
      <div class="leads-table">
        <table class="leads-table-container">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Usuario Asignado</th>
              <th>Fecha de Asignación</th>
              <th>Departamento</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cliente, index) in posiblesClientes" :key="index" @click="verDetalles(cliente.potential_client_id)">
              <td>{{ cliente.name }}</td>
              <td>{{ cliente.status }}</td>
              <td>{{ cliente.phone_number }}</td>
              <td>{{ cliente.email }}</td>
              <td>
                <select v-model="cliente.assigned_user_id" class="form-select">
                  <option v-for="usuario in usuarios" :key="usuario" :value="usuario">{{ usuario }}</option>
                </select>
              </td>
              <td>{{ cliente.assignment_date }}</td>
              <td>{{ cliente.department }}</td>
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
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter(); // Importar el enrutador

const posiblesClientes = ref([]);
const usuarios = ref(['Usuario 1', 'Usuario 2', 'Usuario 3']); // Actualiza esto según los datos reales

const verDetalles = (id) => {
  router.push(`/posible-cliente/${id}`);
};

const fetchPotentialClients = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/potential-clients');
    posiblesClientes.value = response.data; // No necesitas mapear aquí si los nombres son correctos
  } catch (error) {
    console.error('Error al obtener posibles clientes:', error.response ? error.response.data : error.message);
  }
};

onMounted(() => {
  fetchPotentialClients();
});

const crearNuevoCliente = () => {
  posiblesClientes.value.push({
    nombre: 'Nuevo Cliente',
    estado: 'Nuevo',
    telefono: '',
    correo: '',
    usuarioAsignado: 'Usuario 1',
    fechaAsignacion: new Date().toISOString().split('T')[0],
    departamento: 'Ventas'
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

.leads-table-container td select {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
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
