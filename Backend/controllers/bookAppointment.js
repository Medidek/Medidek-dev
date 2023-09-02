//const { v4: uuidv4 } = require("uuid");
const dbConnection = require("../utils/mysql")
const validator = require("../middleware/validation")

const bookAppointment = async function (req, res) {
    try {
        
        let body = req.body
        //console.log(body)

        if (!validator.isValidRequestBody(body)) {
            return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
        }

        const { patient_id, date, name, age, gender, phone, appointment_status, source, hospital_id, doctor_id, opd_status, prescription } = body

        // Email is Mandatory...
        if (!validator.isValid(hospital_id)) {
            return res.status(400).send({ status: false, msg: "Hospital Id is required" })
        };
        if (!validator.isValid(doctor_id)) {
            return res.status(400).send({ status: false, msg: "Doctor Id is required" })
        };
        if (!validator.isValid(patient_id)) {
            return res.status(400).send({ status: false, msg: "Patient Id is required" })
        }
        // Get the current timestamp in milliseconds
const currentTimestamp = Date.now();

// Convert the timestamp to a MySQL DATETIME format
const datetimeValue = new Date(currentTimestamp).toISOString().slice(0, 19).replace('T', ' ');
console.log(datetimeValue)
        // phone Number is Unique...
        let checkPhoneQuery = `SELECT COUNT(*) AS count_exists
                          FROM patient_appointment
                          WHERE patient_id = ?
                          AND name = ?
                          AND DATE_FORMAT(date, '%Y-%m-%d') = DATE_FORMAT(?, '%Y-%m-%d')`;

        const duplicatePatient = await new Promise((resolve, reject) => {
            dbConnection.query(checkPhoneQuery, [patient_id, name, datetimeValue], (error, results) => {
                if (error) reject(error);
                else resolve(results[0].count_exists);
            });
        });

        if (duplicatePatient > 0) {
            return res.status(409).send({ status: false, msg: 'This patient_id already has an appointment today.' });
        }
        if (!validator.isValid(name)) {
            return res.status(400).send({ status: false, msg: "Name is required" })
        };
        if (!validator.isValid(age)) {
            return res.status(400).send({ status: false, msg: "Age is required" })
        };
        // phone Number is Mandatory...
        if (!validator.isValid(gender)) {
            return res.status(400).send({ status: false, msg: 'gender is required' })
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
        if(source){
        if (!validator.isValid(source)) {
            return res.status(400).send({ status: false, msg: "source is required" })
        };
    }
    // Set the default value for status
    let givenStatus = "scheduled";
    if (appointment_status) {
        givenStatus = appointment_status;
    }else {
        return res.status(400).send({ status: false, msg: "Appointment status can be only: scheduled, cancelled or completed" })
    }
    let givenSource = "Patient";
    if (source) {
        givenSource = source;
    }else {
        return res.status(400).send({ status: false, msg: "Source can be only: patient or staff" })
    }
    let givenOpdStatus = "paused";
    if (opd_status) {
        givenOpdStatus = opd_status;
    }else {
        return res.status(400).send({ status: false, msg: "OPD Status can be only: start, paused or in progress" })
    }
    // Check if the photo field exists in the request body
    let prescriptionPhoto;
    if(req.file){
     prescriptionPhoto = req.file.filename
     console.log(prescriptionPhoto)
     }


// Fetch the maximum token_id for the current date
const getLastTokenIdQuery = `SELECT MAX(token_id) AS max_token_id FROM patient_appointment WHERE patient_id = ? AND DATE_FORMAT(date, '%Y-%m-%d') = DATE_FORMAT(?, '%Y-%m-%d')`;
const lastTokenIdResult = await new Promise((resolve, reject) => {
    //const checkDate = new Date(datetimeValue).format("YYYY-MM-DD")
    dbConnection.query(getLastTokenIdQuery, [patient_id, datetimeValue], (error, results) => {
        console.log(dbConnection.query(getLastTokenIdQuery, [patient_id, datetimeValue]))
        if (error) reject(error);
        else resolve(results[0]);
    });
});
console.log('lastTokenIdResult', lastTokenIdResult)
console.log(lastTokenIdResult.max_token_id)

// Determine the token_id based on the last token_id for the current date
const token_id = lastTokenIdResult.max_token_id ? lastTokenIdResult.max_token_id + 1 : 1;

        let filterBody = [token_id, patient_id, datetimeValue, name, age, gender, phone, givenStatus, givenSource, hospital_id, doctor_id, givenOpdStatus, prescriptionPhoto]

        const sql = `INSERT INTO patient_appointment( token_id, patient_id, date, name, age, gender, phone, appointment_status, source, hospital_id, doctor_id, opd_status, prescription )
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        console.log(filterBody)
        dbConnection.query(sql, filterBody, (error, results) => {
            if (error) throw error;
            const selectUserQuery = `SELECT * FROM patient_appointment WHERE token_id = ?`;
            dbConnection.query(selectUserQuery, [token_id], (error, userResults) => {
                if (error) throw error;
                     const patientData = userResults[0];
                     console.log(patientData)
                     
            res.status(201).send({ status: true, msg: "Appointment scheduled successfully", data: patientData });
        });
    })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


module.exports = { bookAppointment }