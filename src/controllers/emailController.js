import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

// Almacenamiento temporal para códigos de verificación con datos adicionales
const verificationCodes = new Map();

// Almacenamiento temporal para correos bloqueados
const blockedEmails = new Map();

// Configuración de Nodemailer para enviar correos
// (Podrías extraer esto a un archivo config/nodemailer.js si lo prefieres)
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "correo@gmail.com",
    pass: "contraseña-de-aplicacion", // Contraseña de aplicación para terceros
  },
});

// Función para enviar el correo de verificación
async function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: "correo@gmail.com",
    to: email,
    subject: "Verifica tu correo electrónico",
    text: `Tu código de verificación es: ${code}\n\n¡Advertencia! Este código expirará en 10 minutos.`,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Controlador para solicitar la verificación del correo
 */
export const requestVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "El correo es requerido." });
  }

  // Generar código
  const verificationCode = uuidv4().substring(0, 6);

  // Guardar el código con su tiempo de expiración
  verificationCodes.set(email, {
    code: verificationCode,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutos
    attempts: 0,
  });

  try {
    // Enviar el correo de verificación
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
 * Controlador para confirmar la verificación del correo
 */
export const confirmVerification = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(400)
      .json({ error: "El correo y el código son requeridos." });
  }

  // Verificar si el correo se encuentra bloqueado temporalmente
  const blockExpiry = blockedEmails.get(email);
  if (blockExpiry && Date.now() < blockExpiry) {
    const minutesLeft = Math.ceil((blockExpiry - Date.now()) / 60000);
    return res.status(429).json({
      error: `Demasiados intentos fallidos. La verificación está bloqueada temporalmente. Por favor, intente de nuevo en ${minutesLeft} minuto(s).`,
    });
  } else if (blockExpiry) {
    // Si el bloqueo ha expirado, eliminarlo
    blockedEmails.delete(email);
  }

  // Obtener el objeto de verificación almacenado para el correo
  const verificationData = verificationCodes.get(email);

  if (!verificationData) {
    return res
      .status(400)
      .json({
        error:
          "No se encontró un código de verificación para ese correo. Por favor, solicite uno nuevo.",
      });
  }

  // Verificar si el código ha expirado
  if (Date.now() > verificationData.expiresAt) {
    verificationCodes.delete(email);
    return res
      .status(400)
      .json({
        error:
          "El código de verificación ha expirado. Por favor, solicite uno nuevo.",
      });
  }

  // Verificar si el código proporcionado coincide
  if (verificationData.code !== code) {
    verificationData.attempts += 1;
    // Actualizar el contador de intentos
    verificationCodes.set(email, verificationData);

    // Bloquear si se excede el número de intentos
    if (verificationData.attempts >= 5) {
      blockedEmails.set(email, Date.now() + 15 * 60 * 1000); // 15 minutos
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

  // Si el código es correcto
  verificationCodes.delete(email);

  // Configurar el correo de confirmación
  const mailOptions = {
    from: "correo@gmail.com",
    to: email,
    subject: "Cuenta verificada exitosamente",
    text: "¡Felicidades! Tu cuenta ha sido verificada exitosamente.",
  };

  try {
    // Enviar el correo de confirmación
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
