const dbConnection = require("../utils/mysql")
const validator = require("../middleware/validation")

const getHospDetails = async function (req, res) {
    try {
        //reading userid from path
        const hospitalId = req.params.hospital_id;
        console.log(hospitalId)

        //id format validation
        if (!validator.isValidUUID(hospitalId)) {
            return res.status(400).send({ status: false, msg: "hospital Id is required" })
        };

        let detailsQuery = `SELECT
            *
        FROM hospital_profile
        WHERE
            uuid = ?`;

        const hospitalDetails = await new Promise((resolve, reject) => {
            dbConnection.query(detailsQuery, hospitalId, (error, results) => {
                if (error) reject(error);
                else resolve(results);
                console.log(results)
            });
        });            //no users found
        if (!hospitalDetails) {
            return res.status(404).send({ status: false, message: "No hospital details are found" });
        }
        
        //return user in response
        return res.status(200).send({ status: true, message: "Success", data: hospitalDetails[0] });


    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = { getHospDetails }