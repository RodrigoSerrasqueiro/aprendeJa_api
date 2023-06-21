import mongoose from 'mongoose'

//'alunos' é nome da coleção. 
const Student = mongoose.model('alunos', {
  name: String,
  email: String,
  cpf: String,
  password: String,
})

export default Student;
