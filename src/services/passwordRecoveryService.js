import { emailVerificationService } from "../helpers/emailVerification.js"

export const requestPasswordRecovery = async (email) => {
  try {
    const response = await emailVerificationService(email);

    if (response.status === 200) {
      return {
        status: 200,
        message: "Código de recuperación enviado.",
        code: response.code // ✅ Propagamos el código
      };
    } else {
      return {
        status: response.status,
        message: response.message
      };
    }
  } catch (error) {
    return {
      status: 500,
      message: "Error al enviar el correo de recuperación",
      error: error.message
    };
  }
};
