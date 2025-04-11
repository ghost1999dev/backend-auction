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
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user:  'turciosortezalberto@gmail.com',
    pass: 'tybx jfzc xozs tont',
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
    from: 'turciosortezalberto@gmail.com',
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
 * @function emailVerificationService
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<import("express").Response>} JSON response with verification status.
 */
export const emailVerificationService = async (email) => {
  if (!email) {
    return { error: "El correo es requerido.", status: 400 };
  }

  const verificationCode = uuidv4().substring(0, 6);

  verificationCodes.set(email, {
    code: verificationCode,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });

  try {
    await sendVerificationEmail(email, verificationCode);
    return { message: "Correo de verificación enviado.", status: 200 };
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return { error: "Error al enviar el correo de verificación.", status: 500 };
  }
};


/**
 * Controller for confirming email verification.
 *
 * @async
 * @function confirmEmailService
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<import("express").Response>} JSON response with confirmation status.
 */
export const confirmEmailService = async (email, code) => {
  if (!email || !code) {
    return { error: "El correo y el código son requeridos.", status: 400 };
  }

  const blockExpiry = blockedEmails.get(email);
  if (blockExpiry && Date.now() < blockExpiry) {
    const minutesLeft = Math.ceil((blockExpiry - Date.now()) / 60000);
    return {
      error: `Demasiados intentos fallidos. La verificación está bloqueada temporalmente. Por favor, intente de nuevo en ${minutesLeft} minuto(s).`,
      status: 429,
    };
  } else if (blockExpiry) {
    blockedEmails.delete(email);
  }

  const verificationData = verificationCodes.get(email);

  if (!verificationData) {
    return {
      error:
        "No se encontró un código de verificación para ese correo. Por favor, solicite uno nuevo.",
      status: 400,
    };
  }

  if (Date.now() > verificationData.expiresAt) {
    verificationCodes.delete(email);
    return {
      error: "El código de verificación ha expirado. Por favor, solicite uno nuevo.",
      status: 400,
    };
  }

  if (verificationData.code !== code) {
    verificationData.attempts += 1;
    verificationCodes.set(email, verificationData);

    if (verificationData.attempts >= 5) {
      blockedEmails.set(email, Date.now() + 15 * 60 * 1000);
      verificationCodes.delete(email);
      return {
        error:
          "Has excedido el número máximo de intentos. La verificación ha sido bloqueada temporalmente por 15 minutos.",
        status: 429,
      };
    } else {
      return {
        error: `Código de verificación incorrecto. Intentos fallidos: ${verificationData.attempts}.`,
        status: 400,
      };
    }
  }

  verificationCodes.delete(email);
  const mailOptions = {
    from: 'turciosortezalberto@gmail.com',
    to: email,
    subject: "Cuenta verificada exitosamente",
    text: "¡Felicidades! Tu cuenta ha sido verificada exitosamente.",
  };

  try {
    await transporter.sendMail(mailOptions);
    return {
      message:
        "Correo verificado correctamente. Se ha enviado un correo de confirmación.",
      status: 200,
    };
  } catch (error) {
    console.error("Error enviando el correo de confirmación:", error);
    return {
      error: "Hubo un error al enviar el correo de confirmación.",
      status: 500,
    };
  }
};
