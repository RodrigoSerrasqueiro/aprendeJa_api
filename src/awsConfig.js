import AWS from 'aws-sdk'
import dotenv from 'dotenv'

dotenv.config()

const configureAWS = () => {
  AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: 'sa-east-1'
  })
  return new AWS.S3();
}

export default configureAWS();