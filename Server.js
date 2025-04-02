const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Conexión a MongoDB Atlas
const dbURI = "mongodb+srv://karen:kcenteno25@cluster0.7khhq.mongodb.net/dbHSO?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión', err));

// Esquema y modelo de Usuario
// Esquema del Usuario
const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  nombre_usuario: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  telefonos: { type: [String], default: [] },
  correo: { type: String, required: true, unique: true }
});

const Usuario = mongoose.model("Usuario", UsuarioSchema);

// Registrar usuario con contraseña hasheada
app.post("/usuarios", async (req, res) => {
  try {
    const { nombre, apellidos, nombre_usuario, contrasena, telefonos, correo } = req.body;
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      apellidos,
      nombre_usuario,
      contrasena: hashedPassword,
      telefonos,
      correo
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: "Usuario registrado con éxito" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Inicio de sesión
app.post("/iniciarsesion", async (req, res) => {
  const { nombre_usuario, contrasena } = req.body;
  if (!nombre_usuario || !contrasena) {
    return res.status(400).json({ mensaje: "Usuario y contraseña son requeridos" });
  }

  try {
    const usuario = await Usuario.findOne({ nombre_usuario });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    const usuarioSinContrasena = {
      _id: usuario._id,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      nombre_usuario: usuario.nombre_usuario,
      telefonos: usuario.telefonos,
      correo: usuario.correo
    };

    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      usuario: usuarioSinContrasena
    });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// Obtener usuario por ID
app.get("/usuarios/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select("-contrasena");
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(usuario);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// Actualizar usuario por ID
app.put("/usuarios/:id", async (req, res) => {
  try {
    const { nombre, apellidos, nombre_usuario, telefonos, correo } = req.body;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombre, apellidos, nombre_usuario, telefonos, correo },
      { new: true }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario actualizado", usuario: usuarioActualizado });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// Eliminar usuario por ID
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuarioEliminado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// Esquema y modelo de Válvula
const ValvulaSchema = new mongoose.Schema({
  ubicacion: { type: String, required: true },
  capacidad_tanque: { type: Number, required: true },
  capacidad_tanque_actual: { type: Number, required: true },
  descripcion: String,
  estado: { type: Boolean, required: true },
  tanque: {
    id_tanque: { type: Number, required: true },
    capacidad_total: { type: String, required: true },
    descripcion: String
  }
}, { timestamps: true });

const Valvula = mongoose.model('Valvula', ValvulaSchema, 'valvula');

// Obtener todas las válvulas
app.get('/valvulas', async (req, res) => {
  try {
    const valvulas = await Valvula.find();
    if (!valvulas.length) return res.status(404).json({ error: 'No se encontraron válvulas' });
    res.json(valvulas);
  } catch (error) {
    console.error('Error al obtener válvulas:', error);
    res.status(500).json({ error: 'Error al obtener válvulas' });
  }
});

// Obtener válvula por ID
app.get('/valvulas/:id', async (req, res) => {
  try {
    const valvula = await Valvula.findById(req.params.id);
    if (!valvula) return res.status(404).json({ error: 'Válvula no encontrada' });
    res.json(valvula);
  } catch (error) {
    console.error('Error al obtener válvula:', error);
    res.status(500).json({ error: 'Error al obtener válvula' });
  }
});

// Insertar nueva válvula
app.post('/valvulas', async (req, res) => {
  try {
    const nuevaValvula = new Valvula(req.body);
    const resultado = await nuevaValvula.save();
    console.log("Válvula insertada:", resultado);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error al insertar:", error.message);
    res.status(500).json({ error: error.message });
  }
});

//Ruta para modificar registro de valvula
app.put('/valvulas/:id', async (req, res) => {
    try {
        const valvulaModificada = await Valvula.findByIdAndUpdate(
            req.params.id,   
            req.body,        
            { new: true }    
        );

        if (!valvulaModificada) {
            return res.status(404).json({ error: 'Válvula no encontrada' });
        }

        res.json(valvulaModificada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Ruta para eliminar una válvula 
app.delete('/valvulas/:id', async (req, res) => {
    try {
        const valvulaEliminada = await Valvula.findByIdAndDelete(req.params.id);

        if (!valvulaEliminada) {
            return res.status(404).json({ error: 'Válvula no encontrada' });
        }

        res.json({ mensaje: 'Válvula eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const HorarioSchema = new mongoose.Schema({
  usuario_id: { type: Number, required: true },
  hora_encendido: { type: String, required: true },
  hora_apagado: { type: String, required: true },
  dias: { 
      type: [String], 
      required: true, 
      enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
  }
}, { timestamps: true });

const Horario = mongoose.model('Horario', HorarioSchema, 'horario');
  
// Ruta para insertar un nuevo horario
app.post('/horarios', async (req, res) => {
    try {
      const nuevoHorario = new Horario(req.body);
      await nuevoHorario.save();
      res.status(201).json(nuevoHorario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Obtener horario por ID
app.get('/horarios/:id', async (req, res) => {
    try {
      const horario = await Horario.findById(req.params.id);
      if (!horario) return res.status(404).json({ error: 'Horario no encontrado' });
      res.json(horario);
    } catch (error) {
      console.error('Error al obtener horario:', error);
      res.status(500).json({ error: 'Error al obtener horario' });
    }
});

// Obtener todos los horarios
app.get('/horarios', async (req, res) => {
    try {
      const horarios = await Horario.find();
      if (!horarios.length) return res.status(404).json({ error: 'No se encontraron horarios' });
      res.json(horarios);
    } catch (error) {
      console.error('Error al obtener horarios:', error);
      res.status(500).json({ error: 'Error al obtener horarios' });
    }
});

//Ruta para modificar un horario 
app.put('/horarios/:id', async (req, res) => {
    try {
        const horarioModificado = await Horario.findByIdAndUpdate(
            req.params.id,
            req.body,      
            { new: true } 
        );

        if (!horarioModificado) {
            return res.status(404).json({ error: 'Horario no encontrado' });
        }

        res.json(horarioModificado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Ruta para eliminar un horario
app.delete('/horarios/:id', async (req, res) => {
    try {
        const horarioEliminado = await Horario.findByIdAndDelete(req.params.id);

        if (!horarioEliminado) {
            return res.status(404).json({ error: 'Horario no encontrado' });
        }

        res.json({ mensaje: 'Horario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Esquema y modelo de historial
const HistorialSchema = new mongoose.Schema({
    valvula_id: { type: Number, required: true },
    usuario_id: { type: Number, required: true },
    accion: { type: Boolean, required: true },
    hora: { type: String, required: true },
    fecha: { type: Date, required: true },
    modo: { type: Boolean, required: true }
  }, { timestamps: true });
  
  const Historial = mongoose.model('Historial', HistorialSchema, 'historial');
  
// Ruta para insertar un nuevo historial
app.post('/historial', async (req, res) => {
    try {
      const nuevoHistorial = new Historial(req.body);
      const resultado = await nuevoHistorial.save();
      res.status(201).json(resultado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
  
// Ruta para obtener todos los historiales
app.get('/historial', async (req, res) => {
    try {
      const historiales = await Historial.find();
      res.json(historiales);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
  
// Ruta para obtener un historial por ID
  app.get('/historial/:id', async (req, res) => {
    try {
      const historial = await Historial.findById(req.params.id);
      if (!historial) return res.status(404).json({ error: 'Historial no encontrado' });
      res.json(historial);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Ruta para eliminar un historial por ID
app.delete('/historial/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await Historial.findByIdAndDelete(id);
        
        if (!resultado) {
            return res.status(404).json({ error: 'Historial no encontrado' });
        }

        res.json({ mensaje: 'Historial eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para modificar un historial por ID
app.put('/historial/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizados = req.body;

        const historialModificado = await Historial.findByIdAndUpdate(id, datosActualizados, { new: true });

        if (!historialModificado) {
            return res.status(404).json({ error: 'Historial no encontrado' });
        }

        res.json(historialModificado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));