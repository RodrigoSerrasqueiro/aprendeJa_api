import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  lessonID: { type: String, required: true },
  lessonTitle: { type: String, required: true },
  lessonDescription: { type: String, required: true },
  lessonVideoURL: { type: String, required: true },
});

const moduleSchema = new mongoose.Schema({
  moduleID: { type: String, required: true },
  moduleName: { type: String, required: true },
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
  courseID: { type: String, required: true },
  courseType: { type: String, required: true },
  courseSubType: { type: String, required: true },
  courseName: { type: String, required: true },
  courseImage: { type: String, required: true },
  courseDescription: { type: String, required: true },
  courseWorkload: { type: String, required: true },
  teacherName: { type: String, required: true },
  modules: [moduleSchema],
});

const Course = mongoose.model('Courses', courseSchema);

export default Course;