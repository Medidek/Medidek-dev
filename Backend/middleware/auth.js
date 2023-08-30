//====================================================================================
const jwt = require("jsonwebtoken");
const dbConnection = require("../utils/mysql")
const validator = require("../middleware/validation");
// const multer = require('multer');
// const upload = multer(); // Initialize multer

// app.use(upload.none()); // Use multer to parse form data


const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const hospitalAuth = async function (req, res, next) {
    try {
        let email = req.body.email
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        };

        // For a Valid Email...
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: ' Email should be a valid' })
        };

        //******------------------- checking User Detail -------------------****** //

        let checkUserQuery = `SELECT *
        FROM master_user_hospital
        WHERE email = ?
        ORDER BY createdAt DESC
        LIMIT 1`;

        const checkUser = await new Promise((resolve, reject) => {
            const query = dbConnection.query(checkUserQuery, email, (error, results) => {
                if (error) reject(error);
                else resolve(results[0]);
            });
        });
        console.log(checkUser)

        if (!checkUser) {
            return res.status(401).send({ Status: false, message: "Authentication failed: Invalid email" });
        }

        req.checkUser = checkUser;
        next();
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}
// const authentication = function ( req, res, next) {
//     try{
//         let token = req.headers['authorization']; 
//         if(!token){
//             return res.status(400).send({status:false, message: "Token is required..!"});
//         }
//          let Token = token.split(" ")
//         //  console.log(token)
//          let tokenValue = Token[1]
//         //  console.log(tokenValue)


//      jwt.verify(tokenValue, process.env.JWT_SECRET, function(err, decoded) {
//             if (err)
//             return res.status(400).send({ status: false, message: "invalid token "}); 
//             console.log(decoded)

//         let userLoggedIn = decoded.hospital_id; 
//         req["hospita"] = userLoggedIn; 

//         next(); 
//      })

//     } 
//     catch (error) {
//         return res.status(500).send({ status: false, message: error.message });
//     }
// }

const hospitalAuthorization = async function (req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token not provided' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }

            req.user = decodedToken;

            // Extract hospital_id from the request body
            const hospital_id = req.query.hospital_id || req.params.hospital_id;

            // Check if the hospital_id in the token matches the requested hospital_id
            if (hospital_id !== decodedToken.hospital_id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next();
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const patientAuth = async function (req, res, next) {
    try {
        let body = req.body
        console.log(body)

        const { email, password } = body
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        };

        // For a Valid Email...
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: 'Email should be a valid' })
        };
        // if (!validator.isValid(password)) {
        //     return res.status(400).send({ status: false, msg: "Password is required" })
        // };

        //******------------------- checking User Detail -------------------****** //

        let checkUserQuery = `SELECT *
        FROM patient_profile
        WHERE email = ?
        ORDER BY createdAt DESC
        LIMIT 1`;

        const values = [email]

        const checkUser = await new Promise((resolve, reject) => {
            const query = dbConnection.query(checkUserQuery, values, (error, results) => {
                if (error) reject(error);
                else resolve(results[0]);
            });
        });

        if (!checkUser) {
            return res.status(401).send({ Status: false, message: "Authentication failed: Invalid email" });
        }

        req.checkUser = checkUser;
        next();
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}
const patientAuthorization = async function (req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token not provided' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }

            req.user = decodedToken;

            // Extract hospital_id from the request body
            const patient_id = req.query.patient_id || req.params.patient_id;

            // Check if the hospital_id in the token matches the requested hospital_id
            if (patient_id !== decodedToken.patient_id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next();
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// const authorization = async function (req, res, next) {
//     try {
//     //     let body = req.body
//     // const hospital_id = body
//     // console.log(hospital_id)
//         const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'Token not provided' });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
//     if (err) {
//       return res.status(403).json({ message: 'Invalid token' });
//     }

//     req.user = decodedToken;
//     console.log(req)
//     let param = req.params
//     console.log('param', param)
//     let hospital_id = req.body.uuid
//     console.log(hospital_id)

//     // Check if the hospital_id in the token matches the requested hospital_id
//     if (req.body.uuid ? req.body.uuid !== decodedToken.hospital_id : req.params.hospital_id !== decodedToken.hospital_id) {
//         return res.status(403).json({ message: 'Access denied' });
//     }
//     next();
//   });
//         // let hospitalId = req.params.hospital_id;
//         // let id = req.userId;
//         // if (!validator.isValidUUID(hospitalId)) {
//         //     return res.status(400).send({ status: false, message: "Please enter valid hospital Id" })
//         // }
//         // let checkUserQuery = `SELECT *
//         //                   FROM master_user_hospital
//         //                   WHERE uuid = ?`;

//         // const checkUser = await new Promise((resolve, reject) => {
//         //     const query = dbConnection.query(checkUserQuery, hospitalId, (error, results) => {
//         //         if (error) reject(error);
//         //         else resolve(results[0]);
//         //     });
//         // });

//         // if (!checkUser) {
//         //     return res.status(401).send({ Status: false, message: "Hospital id is not correct" });
//         // }
//         // if (id != user._id) {
//         //     return res.status(403).send({ status: false, message: "Not authorized..!" });
//         // }
//         // next();
//     }
//     catch (error) {
//         return res.status(500).send({ status: false, message: error.message });
//     }
// }



module.exports = { hospitalAuth, hospitalAuthorization, patientAuth, patientAuthorization }