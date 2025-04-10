import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "dotenv";
import UsersModel from "../models/UsersModel.js";
import ExternalAccount from "../models/ExternalAccount.js";

config();

passport.use(
  "auth-google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google",
      scope: ['profile', 'email'] // Solicitar acceso al perfil y correo electrónico
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        // Extraer datos del perfil de Google
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const name = profile.displayName || '';
        const profilePhoto = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        
        if (!email) {
          return done(new Error("No se pudo obtener el correo electrónico del perfil de Google"), null);
        }
        
        // Buscar si el usuario ya existe en la base de datos
        let user = await UsersModel.findOne({ where: { email } });
        
        if (!user) {
          // Crear nuevo usuario con los datos de Google
          user = await UsersModel.create({
            role_id: 2, // Rol de usuario ajustar según la tabla
            name: name,
            email: email,
            image: profilePhoto,
            account_type: 2, // Cuenta de tipo Google ajustar según la tabla
            status: 1, // Activo
            last_login: new Date()
            // No guardamos password para cuentas de Google
          });
          
          console.log(`Nuevo usuario creado con ID: ${user.id} y correo: ${email}`);
          
          // Crear registro en la tabla de cuentas externas
          await ExternalAccount.create({
            user_id: user.id,
            provider_id: profile.id,
            provider: 'google'
          });
          
          console.log(`Cuenta externa de Google registrada para el usuario ID: ${user.id}`);
        } else {
          // Actualizar información del usuario existente con datos de Google
          await UsersModel.update(
            {
              name: name, // Actualizar nombre por si cambió en Google
              image: profilePhoto, // Actualizar foto de perfil
              last_login: new Date() // Registrar inicio de sesión
            },
            { where: { id: user.id } }
          );
          
          // Verificar si ya existe un registro de cuenta externa para el usuario
          let externalAccount = await ExternalAccount.findOne({
            where: {
              user_id: user.id,
              provider: 'google'
            }
          });
          
          if (!externalAccount) {
            // Crear registro de cuenta externa si no existe
            await ExternalAccount.create({
              user_id: user.id,
              provider_id: profile.id,
              provider: 'google'
            });
            console.log(`Nueva cuenta externa de Google registrada para usuario existente ID: ${user.id}`);
          }
          
          console.log(`Usuario existente actualizado, ID: ${user.id}, último login: ${new Date()}`);
        }
        
        // Devolver el usuario completo para la sesión
        done(null, user);
      } catch (error) {
        console.error("Error durante la autenticación con Google:", error);
        done(error, null);
      }
    }
  )
);

// Serializar el usuario para almacenar solo el ID en la sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar el usuario recuperando todos sus datos de la BD cuando sea necesario
passport.deserializeUser(async (id, done) => {
  try {
    // Obtener usuario con sus cuentas externas asociadas
    const user = await UsersModel.findByPk(id, {
      include: [{ model: ExternalAccount }]
    });
    
    if (!user) {
      return done(new Error("Usuario no encontrado"), null);
    }
    
    done(null, user);
  } catch (error) {
    console.error("Error al deserializar usuario:", error);
    done(error, null);
  }
});

export default passport;