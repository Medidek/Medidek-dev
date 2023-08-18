const multer = require("multer");
const path = require("path");

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: function (req, file, cb) {
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const extname = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(extname)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .jpeg, and .png files are allowed."));
    }
  },
}).single("photo");

module.exports.upload = upload;
