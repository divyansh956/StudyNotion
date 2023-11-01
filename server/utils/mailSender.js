const nodeMailer = require('nodemailer');

const mailSender = async (email, subject, message) => {
    try {
        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        const mailOptions = {
            from: 'Divyansh Saxena',
            to: `${email}`,
            subject: `${subject}`,
            html: `${message}`,
        };

        return await transporter.sendMail(mailOptions);
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = mailSender;