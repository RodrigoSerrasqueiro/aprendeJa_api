import multer from 'multer'

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Arquivo não é uma imagem válida'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
});

export default upload;