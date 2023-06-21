import Student from '../models/Student.js';
import bcrypt from 'bcrypt'

class StudentRepository {
  
  async createStudent(req, res) {
    const { name, email, cpf } = req.body
    const password = cpf
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = {
      name,
      email,
      cpf,
      password: hashedPassword
    }
  
    //criar validações para o envio
  
    if (!name || !email || !cpf ) {
      res.status(424).json({error: 'Campos obrigatórios precisam ser preenchidos.'})
      return;
    }
  
    try {
      await Student.create(student)
      res.status(201).json({message: 'Aluno inserido com sucesso!'})
    } catch (error) {
      res.status(500).json({error: error})
    }
  }

  async createStudents(req, res) {
    const students = req.body;
  
    // Criar validações para o envio
  
    if (!students || !Array.isArray(students) || students.length === 0) {
      res.status(424).json({ error: 'Alunos inválidos.' });
      return;
    }
  
    try {
      // Criptografar as senhas dos alunos antes de inserir no banco de dados
      const studentsWithHashedPasswords = await Promise.all(
        students.map(async (student) => {
          const { cpf } = student;
          const password = cpf;
          const hashedPassword = await bcrypt.hash(password, 10);
          return {
            ...student,
            password: hashedPassword,
          };
        })
      );
  
      await Student.insertMany(studentsWithHashedPasswords);
      res.status(201).json({ message: 'Alunos inseridos com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
  
  async getStudents(req, res) {
    try {
      const studants = await Student.find();
      res.status(200).json(studants)
    } catch (error) {
      res.status(500).json({error: error});
    }
  }
  
  //pesquisar por um aluno específico
  async getOneStudent(req, res) {
    //extrair dado da requisição
    const cpf = req.params.cpf
  
    try {
      const student = await Student.findOne({cpf: cpf})
      if (!student) {
        res.status(424).json({message: 'Aluno não encontrado'})
        return;
      }
  
      res.status(200).json(student)
    } catch (error) {
      res.status(500).json({error: error});
    }
  }
  
  
  //atualizar dados de um aluno específico
  async updateStudent(req, res) {
    const studentCPF = req.params.cpf
    const { name, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const student = {
      name,
      email,
      cpf: studentCPF,
      password: hashedPassword 
    }
  
    try {

      const updatedStudent = await Student.updateOne({cpf: studentCPF}, student)
  
      if (updatedStudent.matchedCount === 0) {
        res.status(424).json({message: 'Não foi possível atualizar os dados do aluno.'})
        return;
      } 
  
      res.status(200).json(student)
  
    } catch (error) {
      res.status(500).json({error: error});
    }
  }
  
  async deleteStudent(req, res) {
    const cpf = req.params.cpf
  
    const student = await Student.findOne({cpf: cpf})
    if (!student) {
      res.status(424).json({message: 'Aluno não encontrado'})
      return;
    }

    try {
      await Student.deleteOne({cpf: cpf})
      res.status(200).json({message: 'Aluno deletado com sucesso!'})
  
    } catch (error) {
      res.status(500).json({error: error});
    }
  }
}

export default StudentRepository;