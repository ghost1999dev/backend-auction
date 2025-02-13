import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'eliasjsegura00@gmail.com',
        pass: 'marlo123'
    }
})

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
        from: 'eliasjsegura00@gmail.com',
        to: email,
        subject: 'Verificación de correo electrónico',
        html: `<p>Haz click en el siguiente enlace para verificar tu correo electrónico:</p>
        <p><a href="http://localhost:3000/verify-email/${token}">Verificar correo</a></p>`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
        }
        else {
            console.log('Email sent: ' + info.response)
        }
    })
}

export default sendVerificationEmail