const dbConnection = require("../utils/mysql")
const validator = require("../middleware/validation")

const updateAppointment = async function (req, res) {
    try {
        //reading doctorId from param
        const hospitalId = req.params.hospital_id;
        const doctorId = req.params.doctor_id;
        const patientId = req.params.patient_id
        const dateWithStartTime =req.query.dateWithStartTime
        const dateWithEndTime =req.query.dateWithEndTime

        const body = req.body

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

        let { name, age, gender, phone, appointment_status, opd_status } = body

        // let detailsQuery = `UPDATE 
        // patient_appointment
        // SET name = '${name}', age = '${age}', gender = '${gender}',  phone = '${phone}',  status = '${appointment_status}',  opd_status = '${opd_status}', 
        // WHERE hospital_id = '${hospitalId}'
        // AND patient_id = '${patientId}'
        // AND doctor_id = '${doctorId}'
        // AND patient_id = '${patientId}'
        // AND date >= '${dateWithStartTime}' AND date <= '${dateWithEndTime}'`;

        let detailsQuery = `UPDATE patient_appointment
        SET 
            name = CASE WHEN name IS NOT NULL THEN '${name}' ELSE name END,
            age = CASE WHEN age IS NOT NULL THEN '${age}' ELSE age END,
            gender = CASE WHEN gender IS NOT NULL THEN '${gender}' ELSE gender END,
            phone = CASE WHEN phone IS NOT NULL THEN '${phone}' ELSE phone END,
            appointment_status = CASE WHEN appointment_status IS NOT NULL THEN '${appointment_status}' ELSE appointment_status END,
            opd_status = CASE WHEN opd_status IS NOT NULL THEN '${opd_status}' ELSE opd_status END
        WHERE 
            hospital_id = '${hospitalId}'
            AND doctor_id = '${doctorId}'
            AND patient_id = '${patientId}'
            AND date >= '${dateWithStartTime}' AND date <= '${dateWithEndTime}';
        `

        console.log(detailsQuery)
        const appointmentData = await new Promise((resolve, reject) => {
            let query = dbConnection.query(detailsQuery, (error, results) => {
                console.log(query)
                if (error) reject(error);
                else resolve(results);

                const selectUserQuery = `SELECT * FROM patient_appointment WHERE patient_id = ?`;
            dbConnection.query(selectUserQuery, patientId, (error, userResults) => {
                if (error) throw error;
                     const patientData = userResults[0];
                     
                     if (appointmentData.length === 1) {
                        return res.status(200).send({ status: true, message: "Appointments updated successfully", data: patientData[0] });
                    } else {
                        return res.status(200).send({ status: true, message: "Appointments updated successfully", data: patientData });
                    }
            
            });
            
        })
        
        });

       
        // if (!appointmentData.length) {
        //     return res.status(404).send({ status: false, message: "No appointments are scheduled for this date" });
        // }
       

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = { updateAppointment }