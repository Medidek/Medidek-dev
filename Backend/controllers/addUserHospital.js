//const AWS = require("aws-sdk");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
//const nodemailer = require('nodemailer');
//const axios = require("axios")
const dbConnection = require("../utils/mysql")
const validator = require("../middleware/validation")

// AWS.config.update({ 
//     accessKeyId: "AKIAYYFIKK6MVZQOGZ5K",
//     secretAccessKey: "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",
//     region: "us-east-1" }); 
// const sns = new AWS.SNS();

// // Function to generate a random OTP
// const generateOTP = () => {
//   const digits = '0123456789';
//   let OTP = '';
//   for (let i = 0; i < 6; i++) {
//     OTP += digits[Math.floor(Math.random() * 10)];
//   }
//   return OTP;
// };

// const sendOTPToPhone = async (phone, otp) => {
//     const params = {
//       Message: `Your OTP is: ${otp}`,
//       PhoneNumber: phone,
//     };
//     return sns.publish(params).promise();
//   };

// Function to send the OTP to the user's email
// const sendOTP = async (email, OTP) => {
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com', // Use Gmail's SMTP server
//     port: 465,
//      secure: true, // true for 465, false for other ports
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
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
    const uuid = uuidv4();
        if (!validator.isValidRequestBody(body)) {
            return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
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
                          FROM master_user_hospital
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
                          FROM master_user_hospital
                          WHERE phone = ?`;
     
    const duplicatePhone = await new Promise((resolve, reject) => {
      dbConnection.query(checkPhoneQuery, phone, (error, results) => {
        if (error) reject(error);
        else resolve(results[0].count_exists);
      });
    });

    if (duplicatePhone > 0) {
      return res.status(400).send({ status: false, msg: 'This phone no. is used before for sign up, use different phone no.' });
    }
        // Generate OTP
    // const OTP = generateOTP();
    // console.log(OTP)

    // // Send OTP to the user's email
    // await sendOTP(email, OTP);

    // // Send OTP to the user's email
    // await sendOTPToPhone(phone, OTP);
    // // Send OTP to the user's email and phone
    // await Promise.all([
    //     sendOTPToEmail(email, OTP),
    //     sendOTPToPhone(phone, OTP)
    //   ]);

        let filterBody = [ uuid, phone, email, passwordValue ]

        const sql = `INSERT INTO master_user_hospital (uuid, phone, email, password)
                 VALUES (?, ?, ?, ?)`;

    console.log(filterBody)
    dbConnection.query(sql, filterBody, (error, results) => {
      if (error) throw error;
      // Fetch the inserted user's data based on email
      const selectUserQuery = `SELECT uuid FROM master_user_hospital WHERE email = ?`;

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

// const login = async function(req, res) {
//     try {

//         let body = req.body

//         if (!validator.isValidRequestBody(body)) {
//             return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
//         }

//         const { email, otp } = body

//         //****------------------- Email validation -------------------****** //

//         if (!validator.isValid(email)) {
//             return res.status(400).send({ status: false, msg: "Email is required" })
//         };

//         // For a Valid Email...
//         if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
//             return res.status(400).send({ status: false, message: ' Email should be a valid' })
//         };

//         //******------------------- checking User Detail -------------------****** //

//         let checkUser = await userModel.findOne({ email: email });

//         if (!checkUser) {
//             return res.status(401).send({ Status: false, message: "email is not correct" });
//         }
//         // if (otp !== checkUser.otp) {
//         //     return res.status(401).json({ message: 'Invalid OTP.' });
//         //   }

//         //   // Mark email as verified and remove the OTP
//         //   checkUser.isEmailVerified = true;
//         //   checkUser.otp = undefined;
//         //   await checkUser.save();

//         let userToken = jwt.sign({UserId: checkUser._id}, process.env.JWT_SECRET); // token expiry for 24hrs

//         return res.status(200).send({ status: true, message: "User login successfully", data: { userData: checkUser, authToken: userToken } });
//     } catch (err) {
//         res.status(500).send({ status: false, msg: err.message })
//     }
// }

const addHospitalProfile = async function(req, res) {
  try {

      let body = req.body
       // Generate UUID for the user
  //const uuid = uuidv4();
      if (!validator.isValidRequestBody(body)) {
          return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
      }

      const { uuid, name, type, location, landmark, address, photo } = body

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

      let filterBody = [ uuid, name, type, location, landmark, address, hospitalPhoto ]

      const sql = `INSERT INTO hospital_profile (uuid ,name, type, location, landmark, address, photo )
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


module.exports = { createUser, addHospitalProfile }