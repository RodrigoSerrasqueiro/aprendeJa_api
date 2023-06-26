import { Router } from "express";
import CourseRepository from "../modules/courses/repositories/courseRepository.js";

const courseRoutes =  Router();
const courseRepository = new CourseRepository();

courseRoutes.post('/create-course', (req, res) => {
  courseRepository.createCourse(req, res);
});

courseRoutes.get('/get-courses', (req, res) => {
  courseRepository.getCourses(req, res);
});

export default courseRoutes;