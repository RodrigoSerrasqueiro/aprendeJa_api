import { Router } from "express";
import CourseRepository from "../modules/courses/repositories/courseRepository.js";
import upload from "../multerConfig.js";

const courseRoutes =  Router();
const courseRepository = new CourseRepository();

courseRoutes.post('/create-course', (req, res) => {
  courseRepository.createCourse(req, res);
});

courseRoutes.post('/upload-image', upload.single('courseImage'), (req, res) => {
  courseRepository.uploadCourseImage(req, res);
});

courseRoutes.post('/new-module/:courseID', (req, res) => {
  courseRepository.addModuleToCourse(req, res);
});

courseRoutes.post('/new-lesson/:courseID/:moduleID', (req, res) => {
  courseRepository.addLessonToModule(req, res);
});

courseRoutes.get('/get-courses', (req, res) => {
  courseRepository.getCourses(req, res);
});

courseRoutes.get('/search-courses', (req, res) => {
  const searchString = req.query.search;
  courseRepository.searchCourses(searchString, res);
});

courseRoutes.patch('/update-course/:courseID', (req, res) => {
  courseRepository.updateCourse(req, res);
});

courseRoutes.patch('/update-module/:courseID/:moduleID', (req, res) => {
  courseRepository.updateModuleInCourse(req, res);
});

courseRoutes.patch('/update-lesson/:courseID/:moduleID/:lessonID', (req, res) => {
  courseRepository.updateLessonInModule(req, res);
});

courseRoutes.delete('/delete-course/:courseID', (req, res) => {
  courseRepository.deleteCourse(req, res);
});

courseRoutes.delete('/delete-module/:courseID/:moduleID', (req, res) => {
  courseRepository.deleteModuleFromCourse(req, res);
});

courseRoutes.delete('/delete-lesson/:courseID/:moduleID/:lessonID', (req, res) => {
  courseRepository.deleteLessonFromModule(req, res);
});

export default courseRoutes;