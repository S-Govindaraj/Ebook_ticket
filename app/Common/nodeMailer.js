const nodemailer = require("nodemailer");
const ejs = require("ejs");
const config = require("config");

const transporter = nodemailer.createTransport({
  host:  config.Mail_Host,
  port: config.Mail_Port,
  secure: false,
  auth: {
    user: config.Mail_User, 
    pass: config.Mail_Pass 
  },
  tls: {
    rejectUnauthorized: false
  }
});

exports.sendEmails = async ({ file, sendToMail, subject, data = [], attachment = null, cc = null }) => {
    if (!config?.SEND_EMAIL) {
      console.log("Email sending is disabled")
      return;
    }
    try {
        ejs.renderFile('views/emailTemplate/' + file, { data }, (err, html) => {
            if (err) {
                // console.error(err);
                return;
            }
            const mailOptions = {
                from: config.FromEmail,
                to: sendToMail,
                subject: `${subject}`,
                html: html
            };
            if (attachment) {
                mailOptions.attachments = attachment;
            }
            if (cc) {
                mailOptions.cc = cc;
            }
            if (data?.senderEmail) {
                mailOptions.replyTo = data.senderEmail;
            }
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        });
    } catch (err) {
      return { message: "An error occurred", error: err.message };
    }
};

