import { Router } from "express";
import multer from "multer";
import VideoRepository from '../modules/videos/repositories/videoRepository.js';

const videoRoutes = Router();
const videoRepository = new VideoRepository();

// Configuração do multer
const upload = multer({
  dest: "uploads/", // diretório onde os arquivos serão armazenados temporariamente
});

// Rota para upload de vídeo
videoRoutes.post('/upload', upload.single('video'), (req, res) => {
  videoRepository.uploadVideo(req, res);
});

export default videoRoutes;