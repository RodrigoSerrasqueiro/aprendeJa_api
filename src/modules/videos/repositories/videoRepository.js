import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

class VideoRepository {


  async uploadVideo (req, res) {
    const video = req.file 
    console.log(video)
    const apiKey = process.env.API_KEY
    const FOLDER_ID = null
    const FILENAME = req.file.originalname
    const VIDEO_ID = uuidv4()
    const parseToBase64 = string=>Buffer.from(string).toString('base64')
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
  
      // Step 1
      // Create a video URL to upload content in the second step
      const { headers } = await axios.post(`https://${host}.pandavideo.com.br/files`, false, {
        headers:{
          'Tus-Resumable': '1.0.0', 
          'Upload-Length': binaryFile.byteLength,
          'Upload-Metadata': metadata
        }
      });
  
      // Step 2
      // Send the video content in the URL received in the header of the first step
      // Create a video URL to upload content in the second step
      await axios.patch(`${headers.location}`, Buffer.from(binaryFile, 'binary'), {
        headers:{
          'Upload-Offset': 0,
          'Tus-Resumable': '1.0.0',
          'Content-Type': 'application/offset+octet-stream'
        }
      });
  
      console.log('Upload completed successfully');
    } catch (error) {
      console.log('UPLOAD ERROR');
      console.log({message: "Deu erro", error: error});
    }
  }
}

export default VideoRepository;