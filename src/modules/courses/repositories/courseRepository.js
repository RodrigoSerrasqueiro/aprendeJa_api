import Course from "../models/course.model.js";
import { v4 as uuidv4 } from 'uuid'

async function validateCourseData(data) {
  const { 
    courseType, 
    courseSubType, 
    courseName, 
    courseImage, 
    courseDescription, 
    moduleName, 
    lessonTitle, 
    lessonDescription, 
    lessonVideoURL 
  } = data;
  const errors = [];

  if (!courseType) {
    errors.push("O campo 'Tipo de curso' é obrigatório.");
  }

  if (!courseSubType) {
    errors.push("O campo 'sub-tipo' é obrigatório.");
  }

  if (!courseName) {
    errors.push("O campo 'nome do curso' é obrigatório.");
  }

  if (!courseImage) {
    errors.push("Insira a imagem do curso.");
  }

  if (!courseDescription) {
    errors.push("O campo 'descrição do curso' é obrigatório.");
  }

  if (!moduleName) {
    errors.push("O campo 'nome do módulo' é obrigatório.");
  }

  if (!lessonTitle) {
    errors.push("O campo 'título da aula' é obrigatório.");
  }

  if (!lessonDescription) {
    errors.push("O campo 'descrição da aula' é obrigatório.");
  }

  if (!lessonVideoURL) {
    errors.push("Realize o upload da vídeo aula.");
  }

  return errors;
}

class CourseRepository {

  async createCourse(req, res) {
    const { 
      courseType, 
      courseSubType, 
      courseName, 
      courseImage, 
      courseDescription, 
      moduleName, 
      lessonTitle, 
      lessonDescription, 
      lessonVideoURL 
    } = req.body;
  
    const courseID = uuidv4();
    const moduleID = uuidv4();
    const lessonID = uuidv4();

    const validationErrors = await validateCourseData(req.body);
    if (validationErrors.length > 0) {
      res.status(400).json({ errors: validationErrors });
      return;
    }
  
    const lesson = {
      lessonID,
      lessonTitle,
      lessonDescription,
      lessonVideoURL
    };
  
    const courseModule = {
      moduleID,
      moduleName,
      lessons: [lesson]
    };
  
    const course = {
      courseID,
      courseType,
      courseSubType,
      courseName,
      courseImage,
      courseDescription,
      modules: [courseModule]
    };
  
    try {

      const existingCourse = await Course.findOne({ courseName });
      if (existingCourse) {
        if (existingCourse.courseName) {
          res.status(424).json({error: "Já existe um curso criado com o mesmo nome. Verifique uma possível duplicidade ou altere o nome do curso."})
        }
        return;
      }

      await Course.create(course);
      res.status(201).json({ message: 'Curso criado com sucesso!' });
    } catch (error) {
      console.error('Erro ao criar novo curso:', error);
      res.status(500).json({ error: 'Não foi possível criar novo curso.' });
    }
  }

  async addModuleToCourse(req, res) {
    const { courseID } = req.params
    const { moduleName, lessonTitle, lessonDescription, lessonVideoURL } = req.body

    try {
      const moduleID = uuidv4();
      const lessonID = uuidv4();
  
      const lesson = {
        lessonID,
        lessonTitle,
        lessonDescription,
        lessonVideoURL
      };
  
      const module = {
        moduleID,
        moduleName,
        lessons: [lesson]
      };
  
      const course = await Course.findOne({ courseID });
  
      if (!course) {
        res.status(404).json({error: "Curso não encontrado"});
        return;
      }
  
      course.modules.push(module);
      await course.save();

      res.status(200).json({message: "Um novo módulo foi adicionado ao curso", course: course})
    } catch (error) {
      console.error('Erro ao adicionar módulo ao curso:', error);
      res.status(500).json({error: "Não foi possível adicionar novo módulo ao curso."});
    }
  }

  async getCourses(req, res) {
    try {
      const courses = await Course.find();
      res.status(200).json(courses)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter os cursos.' });
    }
  }

}

export default CourseRepository;