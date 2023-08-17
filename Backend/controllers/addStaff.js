const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const dbConnection = require("../utils/mysql")
const validator = require("../middleware/validation")

const addStaffProfile = async function (req, res) {
    try {

        let body = req.body
        console.log(body)
        // Generate UUID for the user
        const uuid = uuidv4();
        console.log(uuid)
        if (!validator.isValidRequestBody(body)) {
            return res.status(400).send({ Status: false, message: "Sorry Body can't be empty" })
        }

        const { hospital_id, staff_id, name, designation, phone, email,  password } = body

        // Email is Mandatory...
        if (!validator.isValid(hospital_id)) {
            return res.status(400).send({ status: false, msg: "Hospital Id is required" })
        };
        if (!validator.isValid(name)) {
            return res.status(400).send({ status: false, msg: "Name is required" })
        };  
        if (!validator.isValid(designation)) {
            return res.status(400).send({ status: false, msg: "Designation is required" })
        };  
        // phone Number is Mandatory...
        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, msg: 'Phone number is required' })
        };
        // phone Number is Valid...
        let Phoneregex = /^[6-9]{1}[0-9]{9}$/

        if (!Phoneregex.test(phone)) {
            return res.status(400).send({ Status: false, message: "Please enter a valid phone number" })
        }
        // phone Number is Unique...
        let checkPhoneQuery = `SELECT COUNT(*) AS count_exists
                          FROM staff_profile
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

        // For a Valid Email...
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: 'Email should be a valid' })
        };

        // Email is Unique...
        let checkUserQuery = `SELECT COUNT(*) AS count_exists
                      FROM staff_profile
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
        
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        passwordValue = await bcrypt.hash("medidekPass@123", salt);

        // Check if the photo field exists in the request body
        let staffPhoto = req.file ? req.file.path : null
        console.log(staffPhoto)

        let filterBody = [hospital_id, uuid, name, designation, phone, email, passwordValue, staffPhoto]

        const sql = `INSERT INTO staff_profile (hospital_id, staff_id, name, designation, phone, email, password, photo )
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        console.log(filterBody)
        dbConnection.query(sql, filterBody, (error, results) => {
            //console.log(dbConnection.query(sql, filterBody))
            if (error) throw error;
            res.status(201).send({ status: true, msg: "Staff profile created successfully" });
        });

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


module.exports = { addStaffProfile }