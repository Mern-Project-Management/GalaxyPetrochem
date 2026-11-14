const nodemailer = require('nodemailer');
const Email = require('../model/email');
const path = require('path');

const sendEmail = async (req, res) => {
  try {
    const { email, cc_email, subject, body, attachment } = req.body;

    // Save email data to the database
    const newEmail = new Email({ email, cc_email, subject, body, attachment });
    await newEmail.save();

    // SMTP configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // Primary recipient
      cc: cc_email, // CC recipients
      subject: subject,
      text: body, // Plain text body
      html: `<p>${body}</p>`, // HTML body
      attachments: attachment ? [
        {
          filename: path.basename(attachment),  
          path: attachment, // File path
        },
      ] : [],
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully!', data: newEmail });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};

module.exports = { sendEmail };
