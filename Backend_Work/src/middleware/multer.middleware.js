import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // name overwrite if user same named file 2 -4 picture need to tweak
  }
})

export const upload = multer({
    storage,
})