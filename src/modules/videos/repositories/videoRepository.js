import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

class VideoRepository {


  async uploadVideo (req, res) {
    const apiKey = process.env.API_KEY;
    const FOLDER_ID = null;
    const FILENAME = req.file.originalname;
    const VIDEO_ID = uuidv4();
    const parseToBase64 = string=>Buffer.from(string).toString('base64');
    const binaryFile = fs.readFileSync(req.file.path);

    let metadata = `authorization ${parseToBase64(apiKey)}`
    if(FOLDER_ID){ 
      metadata += `, folder_id ${parseToBase64(FOLDER_ID)}`
    }
    metadata += `, filename ${parseToBase64(FILENAME)}`
    metadata += `, video_id ${parseToBase64(VIDEO_ID)}`
  
    try {
      const {data: uploadServers} = await axios.get('https://api-v2.pandavideo.com.br/hosts/uploader',{
        headers:{
          'Authorization': apiKey,
        }
      });
      const allHosts = Object.values(uploadServers.hosts).reduce((acc,curr)=>([...acc,...curr]),[]);
      const host = allHosts[Math.floor(Math.random() * allHosts.length)];
      console.log(`Starting upload to ${host}`);
  
      const { headers } = await axios.post(`https://${host}.pandavideo.com.br/files`, false, {
        headers:{
          'Tus-Resumable': '1.0.0', 
          'Upload-Length': binaryFile.byteLength,
          'Upload-Metadata': metadata
        }
      });
  
      await axios.patch(`${headers.location}`, Buffer.from(binaryFile, 'binary'), {
        headers:{
          'Upload-Offset': 0,
          'Tus-Resumable': '1.0.0',
          'Content-Type': 'application/offset+octet-stream'
        }
      });
  
      fs.unlinkSync(req.file.path);
      res.status(200).json({ message: 'Upload realizado com sucesso' });
      console.log("Upload Realizado com sucesso.");
    } catch (error) {
      res.status(500).json({ message: 'Erro ao realizar o upload', error: error });
    }
  }
}

export default VideoRepository;