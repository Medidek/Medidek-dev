const dbConnection = require("../utils/mysql")
const validator = require("../middleware/validation")

const getAppointments = async function (req, res) {
    try {
        //reading doctorId from param
        const hospitalId = req.params.hospital_id;
        const doctorId = req.params.doctor_id;
        const dateWithStartTime =req.query.dateWithStartTime
        const dateWithEndTime =req.query.dateWithEndTime

        //id format validation
        if (!validator.isValidUUID(hospitalId)) {
            return res.status(400).send({ status: false, msg: "Hospital Id is required" })
        };
        if (!validator.isValidUUID(doctorId)) {
            return res.status(400).send({ status: false, msg: "Doctor Id is required" })
        };

        let detailsQuery = `SELECT *
        FROM patient_appointment
        WHERE doctor_id = ?
        AND date >= '${dateWithStartTime}' AND date <= '${dateWithEndTime}';`;

        const appointmentData = await new Promise((resolve, reject) => {
            dbConnection.query(detailsQuery, doctorId, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });
       
        if (!appointmentData.length) {
            return res.status(404).send({ status: false, message: "No appointments are scheduled for this date" });
        }
        if (appointmentData.length === 1) {
            return res.status(200).send({ status: true, message: "Appointments fetched successfully", data: appointmentData[0] });
        } else {
            return res.status(200).send({ status: true, message: "Appointments fetched successfully", data: appointmentData });
        }


    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = { getAppointments }