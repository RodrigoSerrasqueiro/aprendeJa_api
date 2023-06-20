import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import studentsRoutes from './routes/students.routes.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rotas
app.use('/students', studentsRoutes);

// Conexão com o banco de dados e inicialização do servidor
mongoose.connect(process.env.HOST_DATABASE)
  .then(() => {
    console.log('Connect to the MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Connect error:', err);
  });

  
