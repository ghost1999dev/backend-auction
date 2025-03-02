import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

//const OAuth2 = google.auth.OAuth2

// const oauth2Client = new OAuth2(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     "https://developers.google.com/oauthplayground"
// )

// oauth2Client.setCredentials({
//     refresh_token: process.env.REFRESH_TOKEN
// })

//const accessToken = await oauth2Client.getAccessToken()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: process.env.ACCESS_TOKEN,
  },
});

/**
 * verify email
 *
 * function to verify email
 *
 * @param {string} email - email to verify
 * @param {string} token - token to verify
 * @returns {void} void
 */
const sendVerificationEmail = (email, token) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Verificación de correo electrónico",
    html: `<p>Haz click en el siguiente enlace para verificar tu correo electrónico:</p>
        <p><a href="http://localhost:3000/users/verify-email/${token}">${token}</a></p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

export default sendVerificationEmail;
