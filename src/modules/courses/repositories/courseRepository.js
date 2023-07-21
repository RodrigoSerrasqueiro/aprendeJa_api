import Course from "../models/course.model.js";
import { v4 as uuidv4 } from 'uuid'
import s3 from '../../../awsConfig.js'
import dotenv  from 'dotenv'
dotenv.config()

async function validateCourseData(data) {
  const { 
    courseType, 
    courseSubType, 
    courseName, 
    courseImage,
    courseDescription, 
    courseWorkload,
    teacherName, 
    courseLevel
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
    errors.push("A imagem do curso é obrigatório.");
  }

  if (!courseDescription) {
    errors.push("O campo 'descrição do curso' é obrigatório.");
  }

  if (!courseWorkload) {
    errors.push("O campo 'carga horária do curso' é obrigatório.");
  }

  if (!teacherName) {
    errors.push("O campo 'nome do professor(a) do curso' é obrigatório.");
  }

  if (!courseLevel) {
    errors.push("O campo 'nível do curso' é obrigatório.");
  }

  return errors;
}

class CourseRepository {

  async uploadCourseImage(req, res) {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
        return;
      }

      const { originalname, buffer } = req.file;
      const imageKey = `images/${uuidv4()}-${originalname}`;

      const s3Params = {
        Bucket: process.env.BUCKET_NAME, // Substitua pelo nome do seu bucket S3
        Key: imageKey,
        Body: buffer,
      };

      await s3.upload(s3Params).promise();

      // Agora você tem o URL da imagem no S3 após o upload
      const imageUrl = `https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}`;

      // Aqui você pode realizar outras ações com o URL da imagem, como salvá-lo no banco de dados
      // Por exemplo, você pode adicionar o URL da imagem ao objeto do curso que foi criado anteriormente
      
      res.status(201).json({ imageUrl });
    } catch (error) {
      console.error('Erro ao enviar a imagem para o S3:', error);
      res.status(500).json({ error: 'Não foi possível enviar a imagem para o S3.' });
    }
  }


  async createCourse(req, res) {
    const { 
      courseType, 
      courseSubType, 
      courseName, 
      courseImage,
      courseDescription, 
      courseWorkload,
      teacherName,
      courseLevel
    } = req.body;
  
    const courseID = uuidv4();

    const validationErrors = await validateCourseData(req.body);
    if (validationErrors.length > 0) {
      res.status(400).json({ errors: validationErrors });
      return;
    }
  
    const course = {
      courseID,
      courseType,
      courseSubType,
      courseName,
      courseImage,
      courseDescription,
      courseWorkload,
      teacherName,
      courseLevel,
      modules: []
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
    const { moduleName } = req.body

    try {
      const moduleID = uuidv4();
  
      const module = {
        moduleID,
        moduleName,
        lessons: []
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

  async addLessonToModule(req, res) {

    const {courseID, moduleID} = req.params
    const { lessonID, lessonTitle, lessonDescription, lessonVideoURL } = req.body
    try {
  
      const lesson = {
        lessonID,
        lessonTitle,
        lessonDescription,
        lessonVideoURL
      };
  
      const course = await Course.findOne({ courseID });
  
      if (!course) {
        res.status(404).json({error: "Curso não encontrado."})
        return;
      }
  
      const module = course.modules.find((mod) => mod.moduleID === moduleID);
  
      if (!module) {
        res.status(404).json({error: "Módulo não encontrado nesse curso."})
        return;
      }
  
      module.lessons.push(lesson);
      await course.save();
  
      res.status(200).json({message: "Uma nova aula foi adicionada ao curso.", course: course})
    } catch (error) {
      console.error('Erro ao adicionar aula ao módulo:', error);
      res.status(500).json({error: "Não foi possível adicionar a aula ao módulo"});
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

  async searchCourses(searchString, res) {
    try {
      const courses = await Course.find({ courseName: { $regex: searchString, $options: 'i' } });
  
      res.status(200).json(courses);
    } catch (error) {
      console.error('Erro ao pesquisar cursos:', error);
      res.status(500).json({ error: 'Erro ao pesquisar cursos.' });
    }
  }

  async updateCourse(req, res) {
    const { courseID } = req.params;
    const { courseType, courseSubType, courseName, courseImage, courseDescription } = req.body;
  
    const updatedCourse = {
      ...(courseType && { courseType }),
      ...(courseSubType && { courseSubType }),
      ...(courseName && { courseName }),
      ...(courseImage && { courseImage }),
      ...(courseDescription && { courseDescription }),
    };
  
    try {
      const course = await Course.findOneAndUpdate({ courseID }, { $set: updatedCourse }, { new: true });
  
      if (!course) {
        res.status(404).json({ error: 'Curso não encontrado para atualização.' });
        return;
      }
  
      res.status(200).json({message: "Curso atualizado com sucesso", course: course});
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar os dados do curso.' });
    }
  }

  async updateModuleInCourse(req, res) {
    const { courseID, moduleID } = req.params;
    const { moduleName } = req.body;
  
    try {
      const course = await Course.findOne({ courseID });
  
      if (!course) {
        res.status(404).json({ error: 'Curso não encontrado.' });
        return;
      }
  
      const module = course.modules.find((mod) => mod.moduleID === moduleID);
  
      if (!module) {
        res.status(404).json({ error: 'Módulo não encontrado nesse curso.' });
        return;
      }
  
      module.moduleName = moduleName;
      await course.save();
  
      res.status(200).json({ message: 'Nome do módulo atualizado com sucesso.', course });
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error);
      res.status(500).json({ error: 'Não foi possível atualizar o módulo.' });
    }
  }

  async updateLessonInModule(req, res) {
    const { courseID, moduleID, lessonID } = req.params;
    const { lessonTitle, lessonDescription, lessonVideoURL } = req.body;
  
    try {
      const course = await Course.findOne({ courseID });
  
      if (!course) {
        res.status(404).json({ error: 'Curso não encontrado.' });
        return;
      }
  
      const module = course.modules.find((mod) => mod.moduleID === moduleID);
  
      if (!module) {
        res.status(404).json({ error: 'Módulo não encontrado nesse curso.' });
        return;
      }
  
      const lesson = module.lessons.find((les) => les.lessonID === lessonID);
  
      if (!lesson) {
        res.status(404).json({ error: 'Aula não encontrada nesse módulo.' });
        return;
      }
  
      if (lessonTitle) {
        lesson.lessonTitle = lessonTitle;
      }
  
      if (lessonDescription) {
        lesson.lessonDescription = lessonDescription;
      }
  
      if (lessonVideoURL) {
        lesson.lessonVideoURL = lessonVideoURL;
      }
  
      await course.save();
  
      res.status(200).json({ message: 'Dados da aula atualizados com sucesso.', course });
    } catch (error) {
      console.error('Erro ao atualizar aula:', error);
      res.status(500).json({ error: 'Não foi possível atualizar a aula.' });
    }
  }

  async deleteCourse(req, res) {
    const { courseID } = req.params;
  
    try {
      const course = await Course.findOneAndDelete({ courseID });
  
      if (!course) {
        res.status(404).json({ error: 'Curso não encontrado.' });
        return;
      }
  
      res.status(200).json({ message: 'Curso excluído com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      res.status(500).json({ error: 'Não foi possível excluir o curso.' });
    }
  }

  async deleteModuleFromCourse(req, res) {
    const { courseID, moduleID } = req.params;
  
    try {
      const course = await Course.findOne({ courseID });
  
      if (!course) {
        res.status(404).json({ error: 'Curso não encontrado.' });
        return;
      }
  
      const moduleIndex = course.modules.findIndex((module) => module.moduleID === moduleID);
  
      if (moduleIndex === -1) {
        res.status(404).json({ error: 'Módulo não encontrado neste curso.' });
        return;
      }
  
      course.modules.splice(moduleIndex, 1);
      await course.save();
  
      res.status(200).json({ message: 'Módulo excluído com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir módulo do curso:', error);
      res.status(500).json({ error: 'Não foi possível excluir o módulo do curso.' });
    }
  }

  async deleteLessonFromModule(req, res) {
    const { courseID, moduleID, lessonID } = req.params;
  
    try {
      const course = await Course.findOne({ courseID });
  
      if (!course) {
        res.status(404).json({ error: "Curso não encontrado." });
        return;
      }
  
      const module = course.modules.find((mod) => mod.moduleID === moduleID);
  
      if (!module) {
        res.status(404).json({ error: "Módulo não encontrado nesse curso." });
        return;
      }
  
      const lessonIndex = module.lessons.findIndex((lesson) => lesson.lessonID === lessonID);
  
      if (lessonIndex === -1) {
        res.status(404).json({ error: "Aula não encontrada nesse módulo." });
        return;
      }
  
      module.lessons.splice(lessonIndex, 1);
      await course.save();
  
      res.status(200).json({ message: "Aula removida do módulo com sucesso.", course });
    } catch (error) {
      console.error('Erro ao remover aula do módulo:', error);
      res.status(500).json({ error: "Não foi possível remover a aula do módulo." });
    }
  }

}

export default CourseRepository;