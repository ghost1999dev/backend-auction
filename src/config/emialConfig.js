export const emailConfig = {

    email: {
      host: process.env.EMAIL_HOST || 'smtp.tuservicio.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.SENDEMAIL,
      password: process.env.PASSWORD,
    },
  };