import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración del email desde variables de entorno
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  user: process.env.SENDEMAIL || '',
  password: process.env.PASSWORD || '',

};

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.password,
  },
});

/**
 * Envía un correo electrónico notificando el cambio de estado de un proyecto
 * @param {Object} params - Parámetros para el correo
 * @param {string} params.email - Correo electrónico del destinatario
 * @param {string} params.name - Nombre del destinatario
 * @param {string} params.projectName - Nombre del proyecto
 * @param {string} params.statusName - Nombre del estado (Pendiente, Activo, etc.)
 * @param {number} params.status - Número de estado (0, 1, 3, 4)
 * @returns {Promise} - Promesa con el resultado del envío
 */
export const sendProjectStatusEmail = async ({ email, name, projectName, statusName, status }) => {
  // Preparar el asunto y cuerpo del correo según el estado
  let subject = `Actualización de estado de tu proyecto: ${projectName}`;
  let bodyContent = '';
  
  switch (status) {
    case 0:
      bodyContent = `<p>Hola ${name},</p>
                     <p>Te informamos que tu proyecto <strong>${projectName}</strong> ha sido marcado como <strong>Pendiente</strong>.</p>
                     <p>Esto significa que tu proyecto está en espera de revisión. Te notificaremos cuando haya cambios.</p>`;
      break;
    case 1:
      bodyContent = `<p>Hola ${name},</p>
                     <p>¡Buenas noticias! Tu proyecto <strong>${projectName}</strong> ahora está <strong>Activo</strong>.</p>
                     <p>Ahora puedes comenzar a trabajar en él. No dudes en contactarnos si necesitas asistencia.</p>`;
      break;
    case 3:
      bodyContent = `<p>Hola ${name},</p>
                     <p>Lamentamos informarte que tu proyecto <strong>${projectName}</strong> ha sido <strong>Rechazado</strong>.</p>
                     <p>Por favor, contacta con nuestro equipo para obtener más información y discutir los próximos pasos.</p>`;
      break;
    case 4:
      bodyContent = `<p>Hola ${name},</p>
                     <p>¡Felicitaciones! Tu proyecto <strong>${projectName}</strong> ha sido marcado como <strong>Finalizado</strong>.</p>
                     <p>Gracias por tu trabajo. Esperamos colaborar contigo en futuros proyectos.</p>`;
      break;
    default:
      bodyContent = `<p>Hola ${name},</p>
                     <p>Te informamos que el estado de tu proyecto <strong>${projectName}</strong> ha cambiado a <strong>${statusName}</strong>.</p>
                     <p>Ingresa a la plataforma para más detalles.</p>`;
  }

  // Plantilla HTML completa
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 15px; text-align: center; }
        .content { padding: 20px; background-color: #ffffff; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
        <img src="https://tu-dominio.com/logo-white.svg" alt="Logo de Bluepixel" class="logo" />
          <h2>Actualización de Proyecto</h2>
        </div>
        <div class="content">
          ${bodyContent}
        </div>
        <div class="footer">
          <p>Este es un mensaje automático, por favor no responda a este correo.</p>
          <p>© ${new Date().getFullYear()} Bluepixel. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Configuración del correo
  const mailOptions = {
    from: `"Sistema de Proyectos" <${emailConfig.user}>`,
    to: email,
    subject: subject,
    html: htmlTemplate,
  };

  // Enviar el correo
  console.log(`Intentando enviar correo a ${email} con la configuración:`, {
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    user: emailConfig.user,
    pass: emailConfig.password ? '******' : '[no configurada]'
  });
  
  const info = await transporter.sendMail(mailOptions);
  console.log(`Correo enviado con éxito: ${info.messageId}`);
  return info;
};