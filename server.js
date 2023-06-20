const express = require('express');
const app = express();
const mongoose = require('mongoose')
require('dotenv').config();

//forma de ler json / middlewares
app.use (
  express.urlencoded({
    extended: true,
  }),
)
app.use(express.json())

//rotas API
const studentsRoutes = require('./routes/students.routes');
app.use('/students', studentsRoutes)

//conexão com o banco // rodar servidor na porta 3000
mongoose.connect(process.env.HOST_DATABASE)
.then(() => {
  console.log('Connect to the MongoDB')
  app.listen(3000)
})
.catch((err) => {
  console.log(err, 'Connect error')
});
