const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, message) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.G_EMAIL}`,
      pass: `${process.env.G_PASSWORD}`,
    },
  });

  var mailOptions = {
    from: `${process.env.G_EMAIL}`,
    to: `${email}`,
    subject: `${subject}`,
    html: `${message}`,
  };

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendEmail;
