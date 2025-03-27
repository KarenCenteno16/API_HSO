// Importar los módulos necesarios
const express = require('express'); // Framework para crear servidores web
const mongoose = require('mongoose'); // Biblioteca para interactuar con MongoDB
const bcrypt = require('bcrypt');
const cors = require('cors');

// Crear una instancia de la aplicación Express
const app = express();
const port = 3000; // Puerto en el que correrá el servidor

// Middleware
app.use(express.json()); // Configura el middleware para parsear JSON en las solicitudes
app.use(cors());

// Conexión a MongoDB Atlas
const dbURI = "mongodb+srv://karen:kcenteno25@cluster0.7khhq.mongodb.net/dbHSO?retryWrites=true&w=majority&appName=Cluster0";

// Conectar a MongoDB (usando Atlas en lugar de localhost)
mongoose.connect(dbURI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión', err));

// Definir esquema de usuario
const UsuarioSchema = new mongoose.Schema({
  nombre: String,
  apellido_p: String,
  apellido_m: String,
  nombre_usuario: String,
  contrasena: String,
  telefonos: [String],
  cargo: String
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Ruta para registrar un usuario con contraseña hasheada
app.post('/usuarios', async (req, res) => {
  try {
    const { nombre, apellido_p, apellido_m, nombre_usuario, contrasena, telefonos, cargo } = req.body;
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = new Usuario({ 
      nombre, apellido_p, apellido_m, nombre_usuario, 
      contrasena: hashedPassword, telefonos, cargo 
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error al registrar usuario:', error); // Muestra el error en consola
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Ruta para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, '-contrasena');
    if (!usuarios.length) {
      return res.status(404).json({ error: 'No se encontraron usuarios' });
    }
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error); // Muestra el error en consola
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Ruta para obtener un usuario por ID
app.get('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id, '-contrasena');
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error); // Muestra el error en consola
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Ruta para actualizar un usuario
app.put('/usuarios/:id', async (req, res) => {
  try {
    const { nombre, apellido_p, apellido_m, nombre_usuario, telefonos, cargo } = req.body;
    await Usuario.findByIdAndUpdate(req.params.id, { nombre, apellido_p, apellido_m, nombre_usuario, telefonos, cargo });
    res.json({ mensaje: 'Usuario actualizado' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error); // Muestra el error en consola
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Ruta para eliminar un usuario
app.delete('/usuarios/:id', async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error); // Muestra el error en consola
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Ruta para autenticación (login)
app.post('/login', async (req, res) => {
  try {
    const { nombre_usuario, contrasena } = req.body;
    const usuario = await Usuario.findOne({ nombre_usuario });

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) return res.status(401).json({ error: 'Contraseña incorrecta' });

    res.json({ mensaje: 'Inicio de sesión exitoso' });

  } catch (error) {
    console.error('Error en la autenticación:', error); // Muestra el error en consola
    res.status(500).json({ error: 'Error en la autenticación' });
  }
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));








"mongodb+srv://karen-centeno16:karen-centeno16@cluster0.4cina.mongodb.net/Sensor_DHT11?retryWrites=true&w=majority"