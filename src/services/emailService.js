import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cron from 'node-cron';
import ProjectsModel from '../models/ProjectsModel.js';
import UsersModel from '../models/UsersModel.js';
import NotificationsModel from '../models/NotificationsModel.js';
import signImage from '../helpers/signImage.js';

//logo para enviar en los correos 
const logoUrl = "https://i.imgur.com/qC2uF4a.jpeg"; 
//console.log('URL firmada del logo:', logoUrl);


dotenv.config();


const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  user: process.env.SENDEMAIL || '',
  password: process.env.PASSWORD || '',

};


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
 * @param {Object} params 
 * @param {string} params.email 
 * @param {string} params.name 
 * @param {string} params.projectName
 * @param {string} params.statusName 
 * @param {number} params.status 
 * @param {string} params.reason
 * @returns {Promise} 
 */
export const sendProjectStatusEmail = async ({ email, name, projectName, statusName, status, reason }) => {

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
                      <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #f44336; margin-bottom: 20px;">
                      <em>${reason}</em>
                      </div>
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


const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#333;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="position:relative;text-align:center;">
      <!-- Imagen del logo pequeña -->
      <img src="${logoUrl}" alt="Imagen del proyecto" style="width:150px;height:auto;display:block;margin:0 auto;" />
      <!-- Texto superpuesto al centro -->
      <div style="
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%, -50%);
        font-size:14px;
        font-weight:bold;
        color:#800080;
        padding:0 10px;
      ">
        Actualización de Proyecto
      </div>
    </div>
    <div style="background-color:#ffffff;padding:20px;margin-top:10px;">
      ${bodyContent}
    </div>
    <div style="text-align:center;margin-top:20px;font-size:12px;color:#666;">
      <p>Este es un mensaje automático, por favor no responda a este correo.</p>
      <p>© ${new Date().getFullYear()} Bluepixel. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`;


  const mailOptions = {
    from: `"Sistema de Proyectos" <${emailConfig.user}>`,
    to: email,
    subject: subject,
    html: htmlTemplate,
  };


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

/**
 * Envía un correo con plantilla HTML cuando un proyecto se finaliza automáticamente
 */
export const sendFinalizationEmail = async ({ email, company_name, project_name, days_available, project_link }) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Proyecto Finalizado</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.05);
        }
        h2 {
          color: #2c3e50;
        }
        p {
          color: #34495e;
          font-size: 16px;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 20px;
          background-color: #3498db;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          font-size: 13px;
          color: #999;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <h2>Proyecto Finalizado</h2>
        <p>Hola <strong>${company_name}</strong>,</p>
        <p>Te informamos que tu proyecto <strong>"${project_name}"</strong> ha sido <strong>finalizado automáticamente</strong> tras completar los <strong>${days_available} días</strong> disponibles.</p>

        <a class="button" href="${project_link}" target="_blank">Ver Proyecto</a>

        <p>Gracias por confiar en nuestra plataforma.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Bluepixel. Todos los derechos reservados.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Bluepixel" <${process.env.SENDEMAIL}>`,
    to: email,
    subject: `Tu proyecto "${project_name}" ha finalizado`,
    html: htmlTemplate,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Correo de finalización enviado a ${email}: ${info.messageId}`);
  return info;
};

export const sendBlockedUserEmail = async ({ email, name, project_name }) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Proyecto Finalizado</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.05);
        }
        h2 {
          color: #2c3e50;
        }
        p {
          color: #34495e;
          font-size: 16px;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 20px;
          background-color: #3498db;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          font-size: 13px;
          color: #999;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <h2>Usuario Bloqueado</h2>
        <p>Hola <strong>${company_name}</strong>,</p>
        <p>
          Te informamos que tu usuario ${name} ha sido bloqueado por incumplimiento de politicas, tras no haber programado la subasta del proyecto <strong>"${project_name}"</strong> en el tiempo disponible.
        </p>

        <p>Gracias por confiar en nuestra plataforma.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} CodeBin. Todos los derechos reservados.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"CodeBid" <${process.env.SENDEMAIL}>`,
    to: email,
    subject: `Tu usuario ha sido bloqueado`,
    html: htmlTemplate,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Correo de bloqueo enviado a ${email}: ${info.messageId}`);
  return info;
}

// Cron job: ejecuta todos los días a las 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('Ejecutando verificación diaria de proyectos activos...');

  try {
    const activeProjects = await ProjectsModel.findAll({
      where: { status: 1 },
      include: [{ model: UsersModel, as: 'company' }]
    });

    const today = new Date();

    for (const project of activeProjects) {
      const createdAt = new Date(project.updatedAt);
      const elapsedDays = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));
      const daysRemaining = project.days_available - elapsedDays;

      if (daysRemaining <= 0) {
        
        await ProjectsModel.update({ status: 4 }, { where: { id: project.id } });

        
        await NotificationsModel.create({
          user_id: project.company_id,
          title: 'Proyecto Finalizado',
          body: `El proyecto "${project.project_name}" ha sido finalizado automáticamente tras agotar sus días disponibles.`,
          context: JSON.stringify({
            action: 'project_auto_finalize',
            project_id: project.id,
            status: 'finalizado'
          }),
          sent_at: new Date(),
          status: 'Enviado',
          error_message: null
        });

       
        await sendFinalizationEmail({
          email: project.company.email,
          company_name: project.company.name,
          project_name: project.project_name,
          days_available: project.days_available,
          project_link: `https://sitio/nombre-proyecto/${project.id}`
        });

        console.log(`Proyecto ${project.id} finalizado y notificado.`);
      } else {
        console.log(`Proyecto ${project.id}: ${daysRemaining} días restantes.`);
      }
    }
  } catch (error) {
    console.error("Error en la verificación diaria de proyectos:", error);
  }
});

/**
 * Send reactivation email with temporary password
 * 
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.name - Recipient name
 * @param {string} options.tempPassword - Temporary password
 * @param {number} options.expirationHours - Hours until password expires
 * @returns {Promise<void>}
 */
export const sendReactivationEmail = async ({ email, name, tempPassword, expirationHours = 24 }) => {
  try {
    
    const subject = 'Tu cuenta ha sido reactivada - Acción requerida';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <img src="${logoUrl}" alt="Logo" style="display: block; margin: 0 auto; max-width: 200px;" />
      <h2 style="color: #333; text-align: center;">¡Bienvenido de vuelta!</h2>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Tu cuenta de administrador ha sido reactivada exitosamente.</p>
        <p>Para acceder nuevamente al sistema, utiliza la siguiente contraseña temporal:</p>
        <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 18px; margin: 15px 0; border-radius: 3px;">
          <code>${tempPassword}</code>
        </div>
        <div style="background-color: #fff8e1; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0; color: #d54400;"><strong>IMPORTANTE:</strong></p>
          <ul style="padding-left: 20px; margin-top: 10px;">
            <li>Esta contraseña expirará en <strong>${expirationHours} horas</strong>.</li>
            <li>Se te solicitará cambiar esta contraseña en tu primer inicio de sesión.</li>
            <li>No compartas esta contraseña con nadie.</li>
          </ul>
        </div>
        <p>Si no solicitaste esta reactivación o tienes alguna pregunta, por favor contacta al administrador del sistema inmediatamente.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
          Este es un correo electrónico automático, por favor no respondas a este mensaje.
        </p>
                <div class="footer">
          &copy; ${new Date().getFullYear()} Bluepixel. Todos los derechos reservados.
        </div>
      </div>
      </div>
    `;

      const mailOptions = {
        from: `"Bluepixel" <${process.env.SENDEMAIL}>`,
        to: email,
        subject: subject,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Correo enviado con éxito: ${info.messageId}`);
      return info;

  } catch (error) {
    console.error('Error al enviar correo de reactivación:', error);
    throw new Error('No se pudo enviar el correo de reactivación');
  }
};


export const sendReportReplyEmail = async ({ to, name, newStatus, responseMessage }) => {
  const statusColor = newStatus === 'Resuelto' ? ' #4CAF50' : ' #f44336';
  const statusLabel = newStatus === 'Resuelto' ? 'Resuelto' : 'Rechazado';

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background-color: ${statusColor}; color: white; padding: 20px;">
          <h2 style="margin: 0;">Respuesta a tu reporte</h2>
        </div>
        <div style="padding: 20px;">
          <p>Hola <strong>${name}</strong>,</p>
          <p>Gracias por comunicarte con nosotros. El equipo de administración ha revisado tu reporte, ha sido marcado como <strong style="color: ${statusColor}">${statusLabel}</strong>.</p>
          
          <p><strong>Mensaje del administrador:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid ${statusColor}; margin-bottom: 20px;">
            <em>${responseMessage}</em>
          </div>

          <p>Si tienes más dudas contacta al soporte técnico.</p>

          <p style="margin-top: 30px;">Saludos cordiales,<br><strong>Equipo de Soporte</strong></p>
        </div>
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          Este correo fue enviado automáticamente. Por favor, no lo respondas directamente.
        </div>
      </div>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailConfig.user,
      pass: emailConfig.password
    }
  });

  const mailOptions = {
    from: `"Bluepixel" <${process.env.SENDEMAIL}>`,
    to,
    subject: `Respuesta a tu reporte`,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Correo enviado:', info.messageId);
  return info;
};


export const sendWelcomeEmail = async (email, fullName, username, resetLink) => {
  const mailOptions = {
    from: '"Sistemas de Subastas" <no-reply@subastas.com>',
    to: email,
    subject: 'Bienvenido a la plataforma de administración',
    html: `
       <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
         <img src="${logoUrl}" alt="Logo Bluepixel" style="width: 100px; height: auto; margin-bottom: 10px;" />

         <h2 style="color: #0d6efd; font-size: 22px; margin-top: 10px;">¡Bienvenido/a, ${fullName}!</h2>
         <p style="font-size: 16px;">Nos complace darte la bienvenida al sistema de administración de Subastas.</p>

        <p><strong>Tus credenciales de acceso son:</strong></p>
        <ul>
          <li><strong>Usuario:</strong> ${username}</li>
          <li><strong>Importante:</strong> El código de verificación se te mando al correo electrónico que elijiste en el registro
          favor debes copiarlo y pegarlo en el siguiente enlace para continuar.</li>
          <br><br>
          <p style="color: #cc0000;"><strong>Este código es válido por 10 minutos. Si no lo solicitaste, puedes ignorar este mensaje.</strong></p>
        </ul>

        <p style="color: #cc0000;"><strong>Por motivos de seguridad, tu contraseña debe ser restablecida en un plazo máximo de 24 horas.</strong></p>
        <p>Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>

        <p>
          <a href="${resetLink}" style="background-color: #0d6efd; color: white; padding: 10px 15px; border-radius: 5px; text-decoration: none;">Restablecer contraseña</a>
        </p>

        <p>Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>

        <p style="margin-top: 30px;">Atentamente,<br>Equipo de Administración de Subastas</p>
      </div>
    `,
  };
    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailConfig.user,
      pass: emailConfig.password
    }
  });

  const info = await transporter.sendMail(mailOptions);
  console.log('Correo enviado:', info.messageId);
  return info;
};