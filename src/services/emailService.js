import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cron from 'node-cron';
import ProjectsModel from '../models/ProjectsModel.js';
import UsersModel from '../models/UsersModel.js';
import NotificationsModel from '../models/NotificationsModel.js';


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
 * @returns {Promise} 
 */
export const sendProjectStatusEmail = async ({ email, name, projectName, statusName, status }) => {

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