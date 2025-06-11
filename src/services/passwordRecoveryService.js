import { emailVerificationService } from "../helpers/emailVerification.js"

export const requestPasswordRecovery = async (email) => {
    try {
  
      const response = await emailVerificationService(email);
  
      if (response.status === 200) {
        res
          .status(200)
          .json({
            status: 200,
            message: "Codigo de recuperacion enviado."
          })
      }
      else {
        res
          .status(response.status)
          .json({
            status: response.status,
            message: "Correo no encontrado"
          })
      }
    } catch (error) {
      res
        .status(500)
        .json({ 
          status: 500,
          message: "Error al enviar el correo de recuperacion", error: error.message 
        })
    }
}
