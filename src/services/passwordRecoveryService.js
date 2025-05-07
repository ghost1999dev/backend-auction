import { emailVerificationService } from "../helpers/emailVerification.js"

export const requestPasswordRecovery = async (email) => {
    try {
  
      const response = await emailVerificationService(email);
  
      if (response.status === 200) {
        return { 
          status: 200, 
          message: "Codigo de recuperacion enviado." 
        }
      }
      else {
        return {
          status: response.status,
          message: response.message
        }
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al enviar el correo de recuperacion", 
        error: error.message
      }
    }
}