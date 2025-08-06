var nodemailer = require("nodemailer");
var config = require("./../config/emailConfig.json");

var mailer = nodemailer.createTransport({
    host: config.host, // e.g., smtp.gmail.com
    port: config.port, // e.g., 587 for TLS, 465 for SSL
    secure: config.secure, // true for 465, false for other ports
    auth: {
        user: config.user, // Replace with your Gmail address
        pass: config.password // Use an App Password instead of your actual password
    }

});

module.exports = mailer;
