const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const dbConnection = require("../utils/mysql")
const validator = require("../middleware/validation")

const hospitalLogin = async function(req, res, next) {
    try {

        let body = req.body

        if (!validator.isValidRequestBody(body)) {
            return res.status(400).send({ Status: false, message: "Please provide log in credentials" })
        }
        const { email, password } = body
        console.log(email)

        const checkUser = req.checkUser;
        if(email !== checkUser.email) {
            return res.status(401).json({ message: 'Incorrect email' });
          }

          let passwordMatch = await bcrypt.compare(password, checkUser.password)
        if (!passwordMatch) {
            return res.status(401).send({ status: false, msg: "Incorrect password" })
        }

        let userToken = jwt.sign({hospital_id: checkUser.hospital_id}, process.env.JWT_SECRET); // token expiry for 24hrs

        return res.status(200).send({ status: true, message: "Hospital logged in successfully", data: { hospital_id: checkUser.hospital_id, authToken: userToken } });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports = { hospitalLogin }
