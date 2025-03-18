// Import the Nodemailer library
import nodemailer from 'nodemailer';
import dotenv from "dotenv"
dotenv.config()
const user = process.env.NODEMAILER_USER
const pass = process.env.NODEMAILER_PASS
const from = `Verify@Authorizer <${user}>`
// Create a transporter object
// console.log(user, pass, from)

const transporter = nodemailer.createTransport({
    host : 'smtp.ethereal.email',
    port : 587,
    auth: {
        user, pass,
    }
});

// Configure the mailoptions object

// console.log(transporter)


const mail = async (to, subject, text, html) => {
    const mailOptions = {
        from:`Verify@Authorizer <${user}>`,
        to,
        subject,
        text,
        html,
      };
      console.log(mailOptions)
      // Send the email
      let info = await transporter.sendMail(mailOptions)
      console.log(info)
      console.log("Message sent %s:", info.messageId)
}

export default mail