import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: '' },
  cpf: { type: String, required: true },
  password: { type: String, required: true },
  startedCourses: { type: [String], default: [''] },
  doneCourses: { type: [String], default: [''] },
  doneLessons: [Object],
  notes: [Object]
});

const Student = mongoose.model('alunos', studentSchema);

export default Student;
