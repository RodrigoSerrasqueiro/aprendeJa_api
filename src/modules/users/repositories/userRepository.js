import User from '../models/user.model.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

async function validateUserData(data) {
  const { userType, name, cpf } = data;
  const errors = [];

  if (!userType) {
    errors.push("O campo 'userType' é obrigatório.");
  }

  if (!name) {
    errors.push("O campo 'name' é obrigatório.");
  }

  if (!cpf) {
    errors.push("O campo 'cpf' é obrigatório.");
  }

  return errors;
}

class UserRepository {
  
  async createUser(req, res) {
    const { userType, name, email, cpf } = req.body;
    const password = cpf;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      userType,
      name,
      email,
      cpf,
      password: hashedPassword,
    };
  
    const validationErrors = await validateUserData(req.body);
    if (validationErrors.length > 0) {
      res.status(400).json({ errors: validationErrors });
      return;
    }
  
    try {
      const existingUser = await User.findOne({ cpf });
      if (existingUser) {
        let errorMessage = '';
        if (existingUser.cpf === cpf) {
          errorMessage = 'Usuário já cadastrado';
        }
        res.status(400).json({ error: errorMessage });
        return;
      }
  
      await User.create(user);
      res.status(201).json({ message: 'Usuário inserido com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async login(req, res) {
    const { cpfOrEmail, password } = req.body;
  
    if (!cpfOrEmail) {
      return res.status(400).json({ error: 'Digite seu CPF ou email.' });
    } else if (!password) {
      return res.status(400).json({ error: 'Digite sua senha.' });
    }
  
    try {
      const user = await User.findOne({
        $or: [{ cpf: cpfOrEmail }, { email: cpfOrEmail }]
      });
  
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Senha incorreta.' });
      }

      // Verificar o tipo de usuário
      if (user.userType.toLowerCase() !== 'admin' && user.userType.toLowerCase() !== 'tutor') {
        return res.status(401).json({ message: 'Login não autorizado. O usuário não é do tipo Admin ou Tutor.' });
      }
  
      // Gerar o token JWT
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1w' });
      return res.status(200).json({ message: 'Usuário autenticado com sucesso.', token: token });

    } catch (error) {
      return res.status(500).json({ error: 'Não foi possível realizar o login do usuário.' });
    }
  }

  async createUsers(req, res) {
    const users = req.body;
  
    if (!users || !Array.isArray(users) || users.length === 0) {
      res.status(424).json({ error: 'Usuários inválidos.' });
      return;
    }
  
    const validationErrors = [];
    const usersWithHashedPasswords = [];
    const existingUsers = [];
  
    for (const user of users) {
      const errors = await validateUserData(user);
  
      if (errors.length > 0) {
        validationErrors.push({ user, errors });
      } else {
        const { cpf } = user;
        const password = cpf;
        const hashedPassword = await bcrypt.hash(password, 10);
  
        const existingUser = await User.findOne({ cpf });
        if (existingUser) {
          existingUsers.push(existingUser);
        } else {
          usersWithHashedPasswords.push({
            ...user,
            password: hashedPassword,
          });
        }
      }
    }
  
    if (validationErrors.length > 0) {
      res.status(400).json({ errors: validationErrors });
      return;
    }
  
    if (existingUsers.length > 0) {
      const existingUsersList = users.filter(user => existingUsers.some(existingUser => existingUser.cpf === user.cpf));
      res.status(400).json({ message: 'Os seguintes usuários dessa lista já possuem seus CPFs cadastrados no banco:', users: existingUsersList });
      return;
    }
  
    try {
      await User.insertMany(usersWithHashedPasswords);
      res.status(201).json({ message: 'Usuários inseridos com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getUsers(req, res) {
    try {
      const users = await User.find();
      res.status(200).json(users)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter os usuários.' });
    }
  }
  
  //pesquisar por um aluno específico
  async getOneUser(req, res) {
    //extrair dado da requisição
    const cpf = req.params.cpf
  
    try {
      const user = await User.findOne({cpf: cpf})
      if (!user) {
        res.status(404).json({message: 'Usuário não encontrado'})
        return;
      }
  
      res.status(200).json(user)
    } catch (error) {
      res.status(500).json({error: error});
    }
  }
  
  
  //atualizar dados de um aluno específico
  async updateUser(req, res) {
    const userCPF = req.params.cpf
    const { name, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const updatedUser = {
      name,
      email,
      cpf: userCPF,
      password: hashedPassword 
    }
  
    try {

      const user = await User.findOneAndUpdate({cpf: userCPF}, updatedUser, {new: true})
  
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado para atualização.' });
        return;
      }
  
      res.status(200).json(user)
  
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar os dados do usuário.' });
    }
  }
  
  async deleteUser(req, res) {
    const cpf = req.params.cpf;
  
    try {
      const deletedUser = await User.findOneAndDelete({ cpf: cpf });
  
      if (!deletedUser) {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
      }
  
      res.status(200).json({ message: `Usuário com CPF ${cpf} deletado com sucesso!` });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar o usuário.' });
    }
  }

  async deleteUsersByCPF(req, res) {
    try {
      const cpfs = req.body;
  
      // Verificar se os cpfs são um array válido
      if (!Array.isArray(cpfs)) {
        return res.status(400).json({ error: 'Formato inválido. Esperado um array de cpfs.' });
      }
  
      // Verificar se todos os cpfs estão presentes na lista de alunos
      const users = await User.find({ cpf: { $in: cpfs } });
      const foundCpfs = users.map((user) => user.cpf);
      const missingCpfs = cpfs.filter((cpf) => !foundCpfs.includes(cpf));
  
      if (missingCpfs.length > 0) {
        return res.status(404).json({ message: `CPFs não encontrados: ${missingCpfs.join(', ')}` });
      }
  
      const result = await User.deleteMany({ cpf: { $in: cpfs } });
  
      if (result.deletedCount > 0) {
        return res.status(200).json({ message: 'Usuários deletados com sucesso.' });
      } else {
        return res.status(404).json({ message: 'Nenhum usuário encontrado para deletar.' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Não foi possível deletar os usuários.' });
    }
  }
}

export default UserRepository;