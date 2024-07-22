<script>
export default {
  name: 'Sidebar'
};
</script>

<template>
  <div class="sidebar">
    <img src="../assets/Logo.png" class="sidebar-logo" alt="Logo-generico">
    <nav>
      <section class="sidebar-section">
        <h2>CRM</h2>
        <ul>
          <li><router-link to="/cuentas">Cuentas</router-link></li>
          <li><router-link to="/contactos">Contactos</router-link></li>
          <li><router-link to="/posibles-clientes">Posibles clientes</router-link></li>
          <li><router-link to="/oportunidades">Oportunidades</router-link></li>
        </ul>
      </section>
      <section class="sidebar-section">
        <h2>ACTIVIDADES</h2>
        <ul>
          <li><router-link to="/correo">Correo</router-link></li>
          <li><router-link to="/calendario">Calendario</router-link></li>
          <li><router-link to="/reuniones">Reuniones</router-link></li>
          <li><router-link to="/llamadas">Llamadas</router-link></li>
          <li><router-link to="/tareas">Tareas</router-link></li>
        </ul>
      </section>
      <section class="sidebar-section">
        <h2>SOPORTE</h2>
        <ul>
          <li><router-link to="/tickets">Tickets</router-link></li>
          <li><router-link to="/base-de-conocimiento">Base de conocimiento</router-link></li>
        </ul>
      </section>
    </nav>
  </div>
</template>

<style scoped>
.sidebar {
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  padding: 18px;
  width: 250px;
  transition: width 0.3s ease;
  /* Animación de ancho */
}

.sidebar:hover {
  width: 280px;
  /* Ancho ampliado al pasar el mouse */
}

.sidebar-logo {
  width: 100%;
  margin-bottom: 20px;
}

.sidebar-section h2 {
  text-align: center;
  margin-bottom: 10px;
}

.sidebar-section ul {
  list-style: none;
  padding: 0;
}

.sidebar-section ul li {
  margin-bottom: 10px;
  
}

.sidebar-section ul li a {
  color: rgb(0, 0, 0);
  text-decoration: none;
  display: block;
  padding: 5px;
}

.sidebar-section ul li a:hover {
  background-color: #bababa;
  border-radius: 5px;
}
</style>