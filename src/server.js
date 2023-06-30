import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import usersRoutes from './routes/users.routes.js';
import courseRoutes from './routes/courses.routes.js';
import videoRoutes from './routes/videos.routes.js';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = 4000;


// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Rotas
app.use('/users', usersRoutes);
app.use('/courses', courseRoutes);
app.use('/videos', videoRoutes);



// Conexão com o banco de dados e inicialização do servidor
const { HOST_USERNAME, HOST_PASSWORD, HOST_CLUSTER, HOST_DATABASE } = process.env;
const URI = `mongodb+srv://${HOST_USERNAME}:${HOST_PASSWORD}@${HOST_CLUSTER}/${HOST_DATABASE}?retryWrites=true&w=majority`;
mongoose.connect(URI)
  .then(() => {
    console.log('Connect to the MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Connect error:', err);
  });

  
