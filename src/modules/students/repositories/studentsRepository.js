import Student from '../models/Student.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

async function validateStudentData(data) {
  const { name, cpf } = data;
  const errors = [];

  if (!name) {
    errors.push("O campo 'name' é obrigatório.");
  }

  if (!cpf) {
    errors.push("O campo 'cpf' é obrigatório.");
  }

  return errors;
}

class StudentRepository {
  
  async createStudent(req, res) {
    const { name, email, cpf } = req.body;
    const password = cpf;
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = {
      name,
      email,
      cpf,
      password: hashedPassword,
    };
  
    const validationErrors = await validateStudentData(req.body);
    if (validationErrors.length > 0) {
      res.status(400).json({ errors: validationErrors });
      return;
    }
  
    try {
      const existingStudent = await Student.findOne({ cpf });
      if (existingStudent) {
        let errorMessage = '';
        if (existingStudent.cpf === cpf) {
          errorMessage = 'Aluno já cadastrado';
        }
        res.status(400).json({ error: errorMessage });
        return;
      }
  
      await Student.create(student);
      res.status(201).json({ message: 'Aluno inserido com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async login(req, res) {
    const { cpfOrEmail, password } = req.body;
  
    if (!cpfOrEmail || !password) {
      return res.status(400).json({ error: 'CPF ou email e senha são obrigatórios.' });
    }
  
    try {
      const student = await Student.findOne({
        $or: [{ cpf: cpfOrEmail }, { email: cpfOrEmail }]
      });
  
      if (!student) {
        return res.status(404).json({ message: 'Aluno não encontrado.' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, student.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Senha incorreta.' });
      }
  
      // Gerar o token JWT
      const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1w' });
      return res.status(200).json({ message: 'Aluno autenticado com sucesso.', token: token });

    } catch (error) {
      return res.status(500).json({ error: 'Não foi possível realizar o login do aluno.' });
    }
  }

  async createStudents(req, res) {
    const students = req.body;
  
    if (!students || !Array.isArray(students) || students.length === 0) {
      res.status(424).json({ error: 'Alunos inválidos.' });
      return;
    }
  
    const validationErrors = [];
    const studentsWithHashedPasswords = [];
    const existingStudents = [];
  
    for (const student of students) {
      const errors = await validateStudentData(student);
  
      if (errors.length > 0) {
        validationErrors.push({ student, errors });
      } else {
        const { cpf } = student;
        const password = cpf;
        const hashedPassword = await bcrypt.hash(password, 10);
  
        const existingStudent = await Student.findOne({ cpf });
        if (existingStudent) {
          existingStudents.push(existingStudent);
        } else {
          studentsWithHashedPasswords.push({
            ...student,
            password: hashedPassword,
          });
        }
      }
    }
  
    if (validationErrors.length > 0) {
      res.status(400).json({ errors: validationErrors });
      return;
    }
  
    if (existingStudents.length > 0) {
      const existingStudentsList = students.filter(student => existingStudents.some(existingStudent => existingStudent.cpf === student.cpf));
      res.status(400).json({ message: 'Os seguintes alunos dessa lista já possuem seus CPFs cadastrados no banco:', students: existingStudentsList });
      return;
    }
  
    try {
      await Student.insertMany(studentsWithHashedPasswords);
      res.status(201).json({ message: 'Alunos inseridos com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getStudents(req, res) {
    try {
      const students = await Student.find();
      res.status(200).json(students)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter os alunos.' });
    }
  }
  
  //pesquisar por um aluno específico
  async getOneStudent(req, res) {
    //extrair dado da requisição
    const cpf = req.params.cpf
  
    try {
      const student = await Student.findOne({cpf: cpf})
      if (!student) {
        res.status(404).json({message: 'Aluno não encontrado'})
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
    
    const updatedStudent = {
      name,
      email,
      cpf: studentCPF,
      password: hashedPassword 
    }
  
    try {

      const student = await Student.findOneAndUpdate({cpf: studentCPF}, updatedStudent, {new: true})
  
      if (!student) {
        res.status(404).json({ error: 'Aluno não encontrado para atualização.' });
        return;
      }
  
      res.status(200).json(student)
  
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar os dados do aluno.' });
    }
  }
  
  async deleteStudent(req, res) {
    const cpf = req.params.cpf;
  
    try {
      const deletedStudent = await Student.findOneAndDelete({ cpf: cpf });
  
      if (!deletedStudent) {
        res.status(404).json({ error: 'Aluno não encontrado.' });
        return;
      }
  
      res.status(200).json({ message: `Aluno com CPF ${cpf} deletado com sucesso!` });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar o aluno.' });
    }
  }

  async deleteStudentsByCPF(req, res) {
    try {
      const cpfs = req.body;
  
      // Verificar se os cpfs são um array válido
      if (!Array.isArray(cpfs)) {
        return res.status(400).json({ error: 'Formato inválido. Esperado um array de cpfs.' });
      }
  
      // Verificar se todos os cpfs estão presentes na lista de alunos
      const students = await Student.find({ cpf: { $in: cpfs } });
      const foundCpfs = students.map((student) => student.cpf);
      const missingCpfs = cpfs.filter((cpf) => !foundCpfs.includes(cpf));
  
      if (missingCpfs.length > 0) {
        return res.status(404).json({ message: `CPFs não encontrados: ${missingCpfs.join(', ')}` });
      }
  
      const result = await Student.deleteMany({ cpf: { $in: cpfs } });
  
      if (result.deletedCount > 0) {
        return res.status(200).json({ message: 'Alunos deletados com sucesso.' });
      } else {
        return res.status(404).json({ message: 'Nenhum aluno encontrado para deletar.' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Não foi possível deletar os alunos.' });
    }
  }
}

export default StudentRepository;