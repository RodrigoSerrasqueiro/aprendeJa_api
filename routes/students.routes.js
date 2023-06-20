const router = require('express').Router()
const Student = require('../models/Student')


router.post('/create-student', async (req, res) => {
  const { name, email, cpf, password} = req.body
  const student = {
    name,
    email,
    cpf,
    password
  }

  //criar validações para o envio

  if (!name || !email || !cpf || !password) {
    res.status(424).json({error: 'Campos obrigatórios precisam ser preenchidos.'})
    return;
  }

  try {
    await Student.create(student)
    res.status(201).json({message: 'Aluno inserido com sucesso!'})
  } catch (error) {
    res.status(500).json({error: error})
  }
})

router.get('/get-students', async (req, res) => {
  try {
    const studants = await Student.find();
    res.status(200).json(studants)
  } catch (error) {
    res.status(500).json({error: error});
  }
})

//pesquisar por um aluno específico
router.get('/:cpf', async (req, res) => {
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
})


//atualizar dados de um aluno específico
router.patch('/:cpf', async (req, res) => {
  const studentCPF = req.params.cpf
  const { name, email, cpf, password } = req.body

  const student = {
    name,
    email,
    cpf,
    password
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
})

router.delete('/:cpf', async (req, res) => {
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
})

module.exports = router;