const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
//const axios = require("axios")
const dbConnection = require("../utils/mysql")
const validator = require("../middleware/validation")
//const hospitalAuth = require("../middleware/auth")


const createPatient = async function(req, res) {
    try {

        let body = req.body
         // Generate UUID for the user
    const patientId = uuidv4();
        if (!validator.isValidRequestBody(body)) {
            return res.status(400).send({ Status: false, message: "Please provide required information for signup" })
        }

        const { phone, email } = body

        // Email is Mandatory...
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        };
        // For a Valid Email...
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: 'Email should be a valid' })
        };

        // Email is Unique...
        let checkUserQuery = `SELECT COUNT(*) AS count_exists
                          FROM patient_profile
                          WHERE email = ?`;
     
    const duplicateEmail = await new Promise((resolve, reject) => {
      dbConnection.query(checkUserQuery, email, (error, results) => {
        if (error) reject(error);
        else resolve(results[0].count_exists);
      });
    });

    if (duplicateEmail > 0) {
      return res.status(409).send({ status: false, msg: 'This email is used before for sign up, use different email' });
    }

        // // Email is Mandatory...
        // if (!validator.isValid(password)) {
        //     return res.status(400).send({ status: false, msg: "Password is required" })
        // };
        // // password Number is Valid... (need to change regex it shouldn't accept only alphabates)
        // let Passwordregex = /^[A-Z0-9a-z]{1}[A-Za-z0-9.@#$&]{7,14}$/
        // if (!Passwordregex.test(password)) {
        //     return res.status(401).send({ Status: false, message: " Please enter a valid password, minlength 8, maxxlength 15" })
        // }
        //generate salt to hash password
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        let passwordValue = await bcrypt.hash("medidekPass@123", salt);

        // phone Number is Mandatory...
        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, msg: 'phone number is required' })
        };
        // phone Number is Valid...
        let Phoneregex = /^[6-9]{1}[0-9]{9}$/

        if (!Phoneregex.test(phone)) {
            return res.status(400).send({ Status: false, message: "Please enter a valid phone number" })
        }
        // phone Number is Unique...
        let checkPhoneQuery = `SELECT COUNT(*) AS count_exists
                          FROM patient_profile
                          WHERE phone = ?`;
     
    const duplicatePhone = await new Promise((resolve, reject) => {
      dbConnection.query(checkPhoneQuery, phone, (error, results) => {
        if (error) reject(error);
        else resolve(results[0].count_exists);
      });
    });

    if (duplicatePhone > 0) {
      return res.status(409).send({ status: false, msg: 'This phone no. is used before for sign up, use different phone no.' });
    }
        

    const currentTimestamp = Date.now();

// Convert the timestamp to a MySQL DATETIME format
const createdAt = new Date(currentTimestamp).toISOString().slice(0, 19).replace('T', ' ');

        let filterBody = [ patientId, phone, email, passwordValue, createdAt ]

        const sql = `INSERT INTO patient_profile (patient_id, phone, email, password, createdAt)
                 VALUES (?, ?, ?, ?, ?)`;

    console.log(filterBody)
    dbConnection.query(sql, filterBody, (error, results) => {
      if (error) throw error;
      // Fetch the inserted user's data based on email
      const selectUserQuery = `SELECT patient_id FROM patient_profile WHERE email = ?`;

      dbConnection.query(selectUserQuery, email, (error, userResults) => {
          if (error) throw error;

          const insertedUser = userResults[0];
   
          res.status(201).send({ status: true, msg: "Patient added successfully", user: insertedUser });
      });
    });

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const patientLogin = async function(req, res, next) {
    try {

        let body = req.body

        if (!validator.isValidRequestBody(body)) {
            return res.status(400).send({ Status: false, message: "Please provide log in credentials" })
        }
        const { email, password } = body
        console.log(email)

        const checkUser = req.checkUser;

        if(email !== checkUser.email) {
            return res.status(401).json({ message: 'Incorrect email' });
          }

          let passwordMatch = await bcrypt.compare(password, checkUser.password)
        if (!passwordMatch) {
            return res.status(401).send({ status: false, msg: "Incorrect password" })
        }

        let userToken = jwt.sign({hospital_id: checkUser.hospital_id}, process.env.JWT_SECRET); // token expiry for 24hrs

        
    

        return res.status(200).send({ status: true, message: "Patient login successfully", data: { patient_id: checkUser.patient_id, authToken: userToken } });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports = { createPatient, patientLogin }