const AWS = require("aws-sdk");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
//const axios = require("axios")
const dbConnection = require("../utils/mysql")
const validator = require("../middleware/validation")
//const hospitalAuth = require("../middleware/auth")

AWS.config.update({ 
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRETE_ACCESS_KEY_ID,
    region: "us-east-1" }); 
//const sns = new AWS.SNS();
const ses = new AWS.SES()

// Function to generate a random OTP
const generateOTP = () => {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

// Function to send OTP email using AWS SES
const sendOTPToEmail = async (toEmail, otp) => {
  const params = {
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Body: {
        Text: {
          Data: `Your OTP: ${otp}`,
        },
      },
      Subject: {
        Data: 'Your OTP for Medidek',
      },
    },
    Source: 'support@medidek.in',
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log('OTP email sent:', result);
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};






// const sendOTPToPhone = async (phone, otp) => {
//     const params = {
//       Message: `Your OTP is: ${otp}`,
//       PhoneNumber: phone,
//     };
//     return sns.publish(params).promise();
//   };

// //Function to send the OTP to the user's email
// const sendOTP = async (email, OTP) => {
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.zoho.com', // Use Gmail's SMTP server
//     port: 465,
//     secure: true, // true for 465, false for other ports
//     auth: {
//       user: "support@medidek.in",
//       pass: process.env.EMAIL_APP_PASS,     // new app password of mail
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USERNAME,
//     to: email, // The user's email address
//     subject: 'OTP Verification',
//     text: `Your OTP : ${OTP} for signup verification of Medidek Healthcare Pvt Ltd.`,
//   };
//   console.log(mailOptions)

//   try {
//       await transporter.sendMail(mailOptions);
//       console.log(`OTP sent to ${email}`);
//     } catch (error) {
//       console.error('Error sending email:', error);
//       throw new Error('Failed to send OTP via email.');
//     }
//   };

const createUser = async function(req, res) {
    try {

        let body = req.body
         // Generate UUID for the user
    const hospitalId = uuidv4();
        if (!validator.isValidRequestBody(body)) {
            return res.status(400).send({ Status: false, message: "Sorry Body can't be empty" })
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
                          FROM loggedin_user_hospital
                          WHERE email = ?`;
     
    const duplicateEmail = await new Promise((resolve, reject) => {
      dbConnection.query(checkUserQuery, email, (error, results) => {
        if (error) reject(error);
        else resolve(results[0].count_exists);
      });
    });

    if (duplicateEmail > 0) {
      return res.status(400).send({ status: false, msg: 'This email is used before for sign up, use different email' });
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
        passwordValue = await bcrypt.hash("medidekPass@123", salt);

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
                          FROM loggedin_user_hospital
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
        // Generate OTP
    const OTP = generateOTP();
    console.log(OTP)

    await sendOTPToEmail(email, OTP)

    // Send OTP to the user's email
    //await sendOTP(email, OTP);

    // // Send OTP to the user's email
    // await sendOTPToPhone(phone, OTP);
    // // Send OTP to the user's email and phone
    // await Promise.all([
    //     sendOTPToEmail(email, OTP),
    //     sendOTPToPhone(phone, OTP)
    //   ]);

    const currentTimestamp = Date.now();

// Convert the timestamp to a MySQL DATETIME format
const createdAt = new Date(currentTimestamp).toISOString().slice(0, 19).replace('T', ' ');

        let filterBody = [ hospitalId, phone, email, passwordValue, OTP, createdAt ]

        const sql = `INSERT INTO master_user_hospital (hospital_id, phone, email, password, otp, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?)`;

    console.log(filterBody)
    dbConnection.query(sql, filterBody, (error, results) => {
      if (error) throw error;
      // Fetch the inserted user's data based on email
      const selectUserQuery = `SELECT hospital_id FROM master_user_hospital WHERE email = ?`;

      dbConnection.query(selectUserQuery, email, (error, userResults) => {
          if (error) throw error;

          const insertedUser = userResults[0];
   
          res.status(201).send({ status: true, msg: "User added successfully", user: insertedUser });
      });
    });

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const login = async function(req, res, next) {
    try {

        let body = req.body

        if (!validator.isValidRequestBody(body)) {
            return res.status(400).send({ Status: false, message: "Please provide log in credentials" })
        }
        const { email, otp } = body
        console.log(email)

        const checkUser = req.checkUser;

        if (otp !== checkUser.otp) {
            return res.status(401).json({ message: 'Invalid OTP.' });
          }

        let userToken = jwt.sign({hospital_id: checkUser.hospital_id}, process.env.JWT_SECRET); // token expiry for 24hrs

        let sqlQuery = `INSERT INTO loggedin_user_hospital (hospital_id, email, password, phone, otp) 
        SELECT hospital_id, email, password, phone, otp
        FROM master_user_hospital
        WHERE email = ?
        ORDER BY createdAt DESC
        LIMIT 1;`

    dbConnection.query(sqlQuery, checkUser.email, (error, results) => {
      if (error) throw error;
      results[0]
    
    })
    

        return res.status(200).send({ status: true, message: "User login successfully", data: { hospital_id: checkUser.hospital_id, authToken: userToken } });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const addHospitalProfile = async function(req, res) {
  try {

      let body = req.body
      console.log(body)
      let hospital_id = req.query.hospital_id
       // Generate UUID for the user
  //const uuid = uuidv4();
      if (!validator.isValidRequestBody(body)) {
          return res.status(400).send({ Status: false, message: "Please provide required information to create hospital profile" })
      }
      if (!validator.isValidUUID(hospital_id)) {
        return res.status(400).send({ status: false, msg: "Hospital Id is required" })
    };
      let checkUserQuery = `SELECT COUNT(*) AS count_exists
                          FROM hospital_profile
                          WHERE hospital_id = ?`;
     
    const duplicateEmail = await new Promise((resolve, reject) => {
      dbConnection.query(checkUserQuery, hospital_id, (error, results) => {
        if (error) reject(error);
        else resolve(results[0].count_exists);
      });
    });

    if (duplicateEmail > 0) {
      return res.status(400).send({ status: false, msg: 'Hospital profile is already created for this information' });
    }

    const { name, type, location, landmark, address, photo } = body
      // Email is Mandatory...
      if (!validator.isValid(name)) {
          return res.status(400).send({ status: false, msg: "name is required" })
      };
      // Email is Mandatory...
      if (!validator.isValid(type)) {
          return res.status(400).send({ status: false, msg: "Type is required" })
      };
      // phone Number is Mandatory...
      if (!validator.isValid(location)) {
          return res.status(400).send({ status: false, msg: 'Location is required' })
      };
          // Email is Mandatory...
          if (!validator.isValid(landmark)) {
            return res.status(400).send({ status: false, msg: "Landmark is required" })
        };
        // Email is Mandatory...
        if (!validator.isValid(address)) {
            return res.status(400).send({ status: false, msg: "Address is required" })
        };
         // Check if the photo field exists in the request body
         let hospitalPhoto = req.file.filename
         console.log(hospitalPhoto)
    if (!hospitalPhoto) {
      return res.status(400).send({ status: false, msg: 'Photo is required' });
    }
    // const geocodingApiKey = 'AIzaSyCvWhsKUokLYedwLKXOJ8-Jhk5JbmlxXA4';
    // const geocodingUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

    // const geocodingResponse = await axios.get(geocodingUrl, {
    //   params: {
    //     address: location + ' ' + address,
    //     key: geocodingApiKey,
    //   },
    // });
    // console.log(geocodingResponse)

    // const results = geocodingResponse.data.results;
    // console.log(results)

    // if (results.length === 0) {
    //   return res.status(400).send({ status: false, msg: 'Invalid location or address' });
    // }

    // const latitude = results[0].geometry.location.lat;
    // const longitude = results[0].geometry.location.lng;

    // // Combine latitude and longitude into a JSON object
    // const coordinates = { latitude, longitude };
    // const coordinatesJson = JSON.stringify(coordinates);

      let filterBody = [ hospital_id, name, type, location, landmark, address, hospitalPhoto ]

      const sql = `INSERT INTO hospital_profile (hospital_id ,name, type, location, landmark, address, photo )
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  console.log(filterBody)
  dbConnection.query(sql, filterBody, (error, results) => {
    //console.log(dbConnection.query(sql, filterBody))
    if (error) throw error;
    res.status(201).send({ status: true, msg: "Hospital profile created successfully" });
  });

  } catch (error) {
      res.status(500).send({ status: false, msg: error.message })
  }
}


module.exports = { createUser, login, addHospitalProfile }