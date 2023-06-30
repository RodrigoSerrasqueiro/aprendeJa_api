import fs from 'fs';

class VideoRepository {
  async uploadVideo (req, res) {
    const { video } = req.file;
    try {
      // Fazer o processamento necessário com o arquivo de vídeo
      // Exemplo: mover o arquivo para um diretório permanente
      const newPath = `uploads/${video.originalname}`;
      fs.renameSync(video.path, newPath);

      res.status(200).json({ message: "Chegou algo aqui", video: newPath });
    } catch (error) {
      res.status(500).json({ message: "Erro no servidor" });
    }
  }
}

export default VideoRepository;