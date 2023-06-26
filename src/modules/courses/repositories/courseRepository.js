import Course from "../models/course.model.js";
import { v4 as uuidv4 } from 'uuid'

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
      await Course.create(course);
      res.status(201).json({ message: 'Curso criado com sucesso!' });
    } catch (error) {
      console.error('Erro ao criar novo curso:', error);
      res.status(500).json({ error: 'Não foi possível criar novo curso.' });
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