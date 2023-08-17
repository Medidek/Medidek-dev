const express = require("express");
const router = express.Router(); //used express to create route handlers
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
router.post("/hospital/staff/profile", staffController.addStaffProfile);
router.get("/hospital/details/:hospital_id", hospDetailsController.getHospitalDetails);

//router.post("/login", categoryControllers.login);

// //product image URL API
// router.post("/image/url", url.uploadFile)

//product API's
// router.post("/api/product/save",middleware.authentication, productControllers.createProduct);
// router.get("/api/product/list",middleware.authentication, productControllers.getCategoryWiseProduct);
// router.put("/books/:bookId",middleware.authentication, bookControllers.updateBook);
// router.delete("/books/:bookId",middleware.authentication,middleware.authorization, bookControllers.deleteBook);

// //review API's
// router.post("/books/:bookId/review", reviewControllers.createReview)
// router.put("/books/:bookId/review/:reviewId", reviewControllers.updateReview)
// router.delete("/books/:bookId/review/:reviewId", reviewControllers.deleteReview)

module.exports = router;
