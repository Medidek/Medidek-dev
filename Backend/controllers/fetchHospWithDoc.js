const dbConnection = require("../utils/mysql");
const validator = require("../middleware/validation");

const getHospWithDoctor = async function (req, res) {
    try {
        const hospitalId = req.params.hospital_id;
        console.log(hospitalId);

        if (!validator.isValidUUID(hospitalId)) {
            return res.status(400).send({ status: false, msg: "Hospital Id is required" });
        }

        const doctorId = req.query.doctor_id; // Read doctor_id from query parameter

        let detailsQuery = `SELECT
        hp.name AS hospital_name,
        uh.email,
        uh.phone,
        dp.doctor_id,
        dp.name AS doctor_name,
        dp.specialty,
        dp.experience,
        dp.rating,
        dp.photo AS doctor_photo
    FROM
        hospital_profile hp
    JOIN
        master_user_hospital uh ON hp.uuid = uh.uuid
    LEFT JOIN
        doctor_profile dp ON uh.uuid = dp.hospital_id
    WHERE
        uh.uuid = ?`;

        if (doctorId) {
            detailsQuery += " AND dp.doctor_id = ?"; // Add doctor_id condition
        }

        const queryParams = doctorId ? [hospitalId, doctorId] : [hospitalId]; // Adjust query parameters

        const hospitalDetails = await new Promise((resolve, reject) => {
            dbConnection.query(detailsQuery, queryParams, (error, results) => {
                if (error) reject(error);
                else resolve(results);
                console.log(results);
            });
        });

        if (!hospitalDetails.length) {
            return res.status(404).send({ status: false, message: "No doctor details are found for this hospital" });
        }

        if (hospitalDetails.length === 1) {
            return res.status(200).send({ status: true, message: "Success", data: hospitalDetails[0] });
        } else {
            return res.status(200).send({ status: true, message: "Success", data: hospitalDetails });
        }

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};

module.exports = { getHospWithDoctor };
