import mongoose from 'mongoose';


//type é como se fosse varchar em um banco relacional.
//Default é um valor padrão a ser atribuido caso não seja atribuido nenhum valor aquele campo. 
//required é como se fosse o not a null
const studentSchema = new mongoose.Schema({
  userType: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  cpf: { type: String, required: true },
  password: { type: String, required: true },
  startedCourses: [String],
  doneCourses: [String],
  doneLessons: [Object],
  notes: [Object]
});

const Student = mongoose.model('alunos', studentSchema);

export default Student;
