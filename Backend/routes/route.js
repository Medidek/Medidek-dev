const express = require("express");
const router = express.Router(); //used express to create route handlers
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file

//import controllers
const hospitalController = require("../controllers/addUserHospital");
const hospLoginController = require("../controllers/hospitalDirectLogin")
const doctorController = require("../controllers/addHospDoctor");
const staffController = require("../controllers/addStaff");
const docDetailsController = require("../controllers/fetchHospWithDoc")
const staffDetailsController = require("../controllers/fetchHospWithStaff")
const hospDetailsController = require("../controllers/fetchHospDetails")
const appointmentController = require("../controllers/bookAppointment")
const patientController = require("../controllers/addPatient")
const fetchAppointController = require("../controllers/fetchAppointments")
const updateAppointController = require("../controllers/updateAppointment")
const auth = require("../middleware/auth")
const middleware = require('../middleware/uploadFile')
//const url = require('../middlewares/aws')

//Category API's

//Hospital signup 
router.post("/registerUser", hospitalController.createUser);
//Hospital Login
router.post("/login", auth.hospitalAuth, hospitalController.login);
//Direct hospital Login
router.post("/login/hospital", auth.hospitalAuth, hospLoginController.hospitalLogin);
//create hospital profile
router.post("/hospital/profile", auth.hospitalAuthorization, middleware.upload, hospitalController.addHospitalProfile);
//create doctor profile
router.post("/hospital/doctor/profile", auth.hospitalAuthorization, middleware.upload, doctorController.addDoctorProfile);
//create staff profile
router.post("/hospital/staff/profile", auth.hospitalAuthorization, middleware.upload, staffController.addStaffProfile);
//fetch doctor details for particular hospital
router.get("/hospital/doctor/:hospital_id", auth.hospitalAuthorization, docDetailsController.getHospWithDoctor);
//fetch staff details for particular hospital
router.get("/hospital/staff/:hospital_id", auth.hospitalAuthorization, staffDetailsController.getHospWithStaff);
//fetch hospital details for particular hospital
router.get("/hospital/details/:hospital_id", auth.hospitalAuthorization, hospDetailsController.getHospDetails);
//patient signup 
router.post("/register/patient", patientController.createPatient);
//patient Login
router.post("/login/patient", auth.patientAuth, patientController.patientLogin);
//book appointment
router.post("/hospital/appointment", middleware.uploadPrescription, appointmentController.bookAppointment);
//fetch appointments details for particular doctor
router.get("/hospital/appointments/:hospital_id/:doctor_id", fetchAppointController.getAppointments);
//update appointments details for particular doctor
router.put("/hospital/appointments/:hospital_id/:doctor_id/:patient_id", updateAppointController.updateAppointment);

module.exports = router;
