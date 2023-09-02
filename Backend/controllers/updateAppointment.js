const dbConnection = require("../utils/mysql")
const validator = require("../middleware/validation")

const updateAppointment = async function (req, res) {
    try {
        //reading doctorId from param
        const hospitalId = req.params.hospital_id;
        const doctorId = req.params.doctor_id;
        const patientId = req.params.patient_id
        const nameToBeChange = req.params.name
        const dateWithStartTime =req.query.dateWithStartTime
        const dateWithEndTime =req.query.dateWithEndTime

        const body = req.body
        console.log(body)

        //id format validation
        if (!validator.isValidUUID(hospitalId)) {
            return res.status(400).send({ status: false, msg: "Hospital Id is required" })
        };
        //id format validation
        if (!validator.isValidUUID(doctorId)) {
            return res.status(400).send({ status: false, msg: "Doctor Id is required" })
        };
         //id format validation
         if (!validator.isValidUUID(patientId)) {
            return res.status(400).send({ status: false, msg: "Patient Id is required" })
        };

        let { name, age, gender, phone, appointment_status, opd_status, medical_history } = body
        console.log(body)

        const detailsQuery = `
            UPDATE patient_appointment
            SET 
                name = '${name}', 
                age = '${age}', 
                gender = '${gender}',  
                phone = ${phone},  
                appointment_status = '${appointment_status}',  
                opd_status = '${opd_status}', 
                medical_history = '${medical_history}' 
            WHERE 
                hospital_id = '${hospitalId}'
                AND doctor_id = '${doctorId}'
                AND patient_id = '${patientId}'
                AND name = '${nameToBeChange}'
                AND date >= '${dateWithStartTime}' AND date <= '${dateWithEndTime}'`;

        const updateResult = dbConnection.query(detailsQuery, (error, results) => {
            if (error) {
                res.status(500).send({ status: false, msg: error.message });
            } else {
                if (results.affectedRows > 0) {
                    // Rows were updated
                    const selectUserQuery = `
                SELECT * FROM patient_appointment 
                WHERE 
                    hospital_id = '${hospitalId}'
                    AND doctor_id = '${doctorId}'
                    AND patient_id = '${patientId}'
                    AND name = '${name}'`;

            dbConnection.query(selectUserQuery, (error, userResults) => {
                if (error) {
                    res.status(500).send({ status: false, msg: error.message });
                } else {
                    const patientData = userResults[0];
                    res.status(200).send({ status: true, message: "Appointment updated successfully", data: patientData });
                }
            });
                } else {
                    // No rows were updated
                    res.status(200).send({ status: true, message: "No changes made to the appointment" });
                }
            }
        });
       

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = { updateAppointment }