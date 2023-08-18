const dbConnection = require("../utils/mysql")
const validator = require("../middleware/validation")

const getHospWithDoc = async function (req, res) {
    try {
        //reading userid from path
        const hospitalId = req.params.hospital_id;
        console.log(hospitalId)

        //id format validation
        if (!validator.isValidUUID(hospitalId)) {
            return res.status(400).send({ status: false, msg: "hospital Id is required" })
        };

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

        const hospitalDetails = await new Promise((resolve, reject) => {
            dbConnection.query(detailsQuery, hospitalId, (error, results) => {
                if (error) reject(error);
                else resolve(results);
                console.log(results)
            });
        });            //no users found
        if (!hospitalDetails) {
            return res.status(404).send({ status: false, message: "No doctor details are found for this hospital" });
        }
        console.log(hospitalDetails)
        
        //return user in response
        return res.status(200).send({ status: true, message: "Success", data: hospitalDetails });


    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = { getHospWithDoc }