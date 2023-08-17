const express = require("express");
const router = express.Router(); //used express to create route handlers
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file

//import controllers
const hospitalController = require("../controllers/addUserHospital");
const doctorController = require("../controllers/addHospDoctor");
const staffController = require("../controllers/addStaff");
const hospDetailsController = require("../controllers/fetchHospitalDetails")
const middleware = require('../middleware/uploadFile')
//const url = require('../middlewares/aws')

//Category API's
router.post("/registerUser", hospitalController.createUser);
router.post("/hospital/profile", middleware.upload, hospitalController.addHospitalProfile);
router.post("/hospital/doctor/profile", middleware.upload, doctorController.addDoctorProfile);
router.post("/hospital/staff/profile", middleware.upload, staffController.addStaffProfile);
router.get("/hospital/details/:hospital_id", hospDetailsController.getHospitalDetails);


module.exports = router;
