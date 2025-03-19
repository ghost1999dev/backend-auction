import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";




dotenv.config();



const verificationCodes = new Map();
const blockedEmails = new Map();

/**
 * SMTP transporter configured with Gmail credentials.
 *
 * @constant {import("nodemailer").Transporter}
 */
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "moisesviera30@gmail.com",
    pass: "yajm pgix fuyq omsi",
  },
});

/**
 * Sends a verification email containing a unique code that expires in 10 minutes.
 *
 * @async
 * @function sendVerificationEmail
 * @param {string} email - Recipient's email address.
 * @param {string} code - Unique verification code.
 * @returns {Promise<void>} Resolves when the email is sent.
 */
async function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: process.env.SENDEMAIL,
    to: email,
    subject: "Verifica tu correo electrónico",
    text: `Tu código de verificación es: ${code}\n\n¡Advertencia! Este código expirará en 10 minutos.`,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Controller for requesting email verification.
 *
 * @async
 * @function emailVerification
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<import("express").Response>} JSON response with verification status.
 */
export const emailVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "El correo es requerido." });
  }

  const verificationCode = uuidv4().substring(0, 6);

  verificationCodes.set(email, {
    code: verificationCode,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });

  try {
    await sendVerificationEmail(email, verificationCode);
    return res.status(200).json({ message: "Correo de verificación enviado." });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return res
      .status(500)
      .json({ error: "Error al enviar el correo de verificación." });
  }
};

/**
 * Controller for confirming email verification.
 *
 * @async
 * @function confirmEmail
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<import("express").Response>} JSON response with confirmation status.
 */
export const confirmEmail = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(400)
      .json({ error: "El correo y el código son requeridos." });
  }

  const blockExpiry = blockedEmails.get(email);
  if (blockExpiry && Date.now() < blockExpiry) {
    const minutesLeft = Math.ceil((blockExpiry - Date.now()) / 60000);
    return res.status(429).json({
      error: `Demasiados intentos fallidos. La verificación está bloqueada temporalmente. Por favor, intente de nuevo en ${minutesLeft} minuto(s).`,
    });
  } else if (blockExpiry) {
    blockedEmails.delete(email);
  }

  const verificationData = verificationCodes.get(email);

  if (!verificationData) {
    return res.status(400).json({
      error:
        "No se encontró un código de verificación para ese correo. Por favor, solicite uno nuevo.",
    });
  }

  if (Date.now() > verificationData.expiresAt) {
    verificationCodes.delete(email);
    return res.status(400).json({
      error:
        "El código de verificación ha expirado. Por favor, solicite uno nuevo.",
    });
  }

  if (verificationData.code !== code) {
    verificationData.attempts += 1;
    verificationCodes.set(email, verificationData);

    if (verificationData.attempts >= 5) {
      blockedEmails.set(email, Date.now() + 15 * 60 * 1000);
      verificationCodes.delete(email);
      return res.status(429).json({
        error:
          "Has excedido el número máximo de intentos. La verificación ha sido bloqueada temporalmente por 15 minutos.",
      });
    } else {
      return res.status(400).json({
        error: `Código de verificación incorrecto. Intentos fallidos: ${verificationData.attempts}.`,
      });
    }
  }
  verificationCodes.delete(email);
  const mailOptions = {
    from: process.env.SENDEMAIL,
    to: email,
    subject: "Cuenta verificada exitosamente",
    text: "¡Felicidades! Tu cuenta ha sido verificada exitosamente.",
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      message:
        "Correo verificado correctamente. Se ha enviado un correo de confirmación.",
    });
  } catch (error) {
    console.error("Error enviando el correo de confirmación:", error);
    return res
      .status(500)
      .json({ error: "Hubo un error al enviar el correo de confirmación." });
  }
};
