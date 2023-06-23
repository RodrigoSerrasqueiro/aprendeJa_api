import { Router } from "express";
import UserRepository  from "../modules/users/repositories/userRepository.js";

const userRoutes =  Router();
const userRepository = new UserRepository();

userRoutes.post('/create-user', (req, res) => {
  userRepository.createUser(req, res)
})

userRoutes.post('/sign-in', (req, res) => {
  userRepository.login(req, res)
})

userRoutes.post('/create-users', (req, res) => {
  userRepository.createUsers(req, res)
})

userRoutes.get('/get-users', (req, res) => {
  userRepository.getUsers(req, res)
})

userRoutes.get('/:cpf', (req, res) => {
  userRepository.getOneUser(req, res);
})

userRoutes.patch('/:cpf', (req, res) => {
  userRepository.updateUser(req, res);
})

userRoutes.delete('/:cpf', (req, res) => {
  userRepository.deleteUser(req, res);
})

userRoutes.post('/delete-users', (req, res) => {
  userRepository.deleteUsersByCPF(req, res);
});

export default userRoutes;