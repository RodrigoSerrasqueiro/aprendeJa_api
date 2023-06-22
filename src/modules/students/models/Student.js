import mongoose from 'mongoose';


//type é como se fosse varchar em um banco relacional.
//Default é um valor padrão a ser atribuido caso não seja atribuido nenhum valor aquele campo. 
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: '' },
  cpf: { type: String, required: true },
  password: { type: String, required: true },
  startedCourses: { type: [String], default: [''] },
  doneCourses: { type: [String], default: [''] },
  doneLessons: { type: [Object], default: [''] },
  notes: { type: [Object], default: [''] }
});

const Student = mongoose.model('alunos', studentSchema);

export default Student;
