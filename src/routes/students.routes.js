import { Router } from "express";
import StudentRepository  from "../modules/students/repositories/studentsRepository.js";

const studentRoutes =  Router();
const studentRepository = new StudentRepository();

studentRoutes.post('/create-student', (req, res) => {
  studentRepository.createStudent(req, res)
})

studentRoutes.get('/get-students', (req, res) => {
  studentRepository.getStudents(req, res)
})

studentRoutes.get('/:cpf', (req, res) => {
  studentRepository.getOneStudent(req, res);
})

studentRoutes.patch('/:cpf', (req, res) => {
  studentRepository.updateStudent(req, res);
})

studentRoutes.delete('/:cpf', (req, res) => {
  studentRepository.deleteStudent(req, res);
})

export default studentRoutes ;