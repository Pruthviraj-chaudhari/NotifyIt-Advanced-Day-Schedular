const nodemailer = require("nodemailer");

const mailSender = async(email,title,body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })

        let info = await transporter.sendMail({
            from: 'My Todo App',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        })

        return info;
        
    } catch (error) {
        console.log("Error Occured at MailSender: ", error.message);
    }
}

module.exports = mailSender;