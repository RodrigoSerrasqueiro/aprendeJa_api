import mongoose from 'mongoose'

const Student = mongoose.model('Student', {
  name: String,
  email: String,
  cpf: String,
  password: String,
})

export default Student;
