const dbConnection = require("../utils/mysql")
const validator = require("../middleware/validation")

const getHospitalDetails = async function (req, res) {
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
        dp.name AS doctor_name,
        dp.specialty,
        sp.name AS staff_name,
        sp.designation
    FROM
        hospital_profile hp
    JOIN
        master_user_hospital uh ON hp.uuid = uh.uuid
    LEFT JOIN
        doctor_profile dp ON uh.uuid = dp.hospital_id
    LEFT JOIN
        staff_profile sp ON uh.uuid = sp.hospital_id
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
            return res.status(404).send({ status: false, message: "No hospital details found" });
        }
        console.log(hospitalDetails)
        
        //return user in response
        return res.status(200).send({ status: true, message: "Success", data: hospitalDetails });


    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = { getHospitalDetails }