const express = require("express");
const bodyParser = require("body-parser")
const route = require("./routes/route.js");
const cors = require('cors')
// const nodemailer = require('nodemailer');
// const multer = require('multer');
// const upload = multer(); // Initialize multer

const app = express()
//app.use(upload.none()); // Use multer to parse form data



// Use body-parser middleware for parsing JSON and url-encoded request bodies
app.use(cors({
    credentials:true,
    origin:'http://localhost:5173'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('./uploads'));

app.use("/", route)

//port is two-way communication link between two programs running on the network
app.listen(process.env.PORT || 3000, function() {
    console.log("Express app running on port " + (process.env.PORT || 3000));
});