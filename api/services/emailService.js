const nodemailer = require('nodemailer');
EMAIL_USER="vaishnavigoudar@gmail.com";
EMAIL_PASS="gsrfdxmcwhgsuqjk" ;
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER, // Your Gmail address
        pass: EMAIL_PASS, // Your App Password
    },
});
const sendEmail = async (to, subject, status) => {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER, // Sender address
    to: to, // List of recipients
    subject: subject, // Subject line
    text: `The status for the ticket is: ${status}`, // Plain text body
});

  return transporter.sendMail(info);
};

module.exports = { sendEmail };
