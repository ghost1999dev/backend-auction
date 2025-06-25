import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { config } from "dotenv";
import UsersModel from "../models/UsersModel.js";
import ExternalAccountsModel from "../models/ExternalAccountsModel.js";
import jwt from 'jsonwebtoken';

config();

passport.use(
  "auth-github",
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "https://backend-auction-5zdm.onrender.com/passport/auth/github/callback",
      scope: ["user:email"],
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || profile.username;
        const photo = profile.photos?.[0]?.value;

        if (!email) return done(new Error("No se pudo obtener el correo de GitHub"), null);

        let user = await UsersModel.findOne({ where: { email } });

        if (!user) {
          user = await UsersModel.create({
            role_id: 2,
            name: name,
            email: email,
            image: photo,
            account_type: 2,
            status: 1,
            last_login: new Date(),
          });

          await ExternalAccount.create({
            user_id: user.id,
            provider_id: profile.id,
            provider: "github",
          });
        } else {
          await UsersModel.update(
            {
              name,
              image: photo,
              last_login: new Date(),
            },
            { where: { id: user.id } }
          );

          const external = await ExternalAccountsModel.findOne({
            where: { user_id: user.id, provider: "github" },
          });

          if (!external) {
            await ExternalAccount.create({
              user_id: user.id,
              provider_id: profile.id,
              provider: "github",
            });
          }
        }

        done(null, user);
      } catch (error) {
        console.error("Error GitHub login:", error);
        done(error, null);
      }
    }
  )
);

passport.use(
  "auth-google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/passport/auth/google/callback",//"https://backend-auction-5zdm.onrender.com/passport/auth/google/callback",
      scope: ['profile', 'email']
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const name = profile.displayName || '';
        const profilePhoto = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        
        if (!email) {
          return done(new Error("No se pudo obtener el correo electrónico del perfil de Google"), null);
        }
        
        let user = await UsersModel.findOne({ where: { email } });
        
        if (!user) {
          user = await UsersModel.create({
            role_id: 2, 
            name: name,
            email: email,
            image: profilePhoto,
            account_type: 3, 
            status: 1, 
            last_login: new Date()
          });
                    
          await ExternalAccountsModel.create({
            user_id: user.id,
            provider_id: profile.id,
            provider: 'google'
          });
          
        } else {
          await UsersModel.update(
            {
              name: name, 
              image: profilePhoto, 
              last_login: new Date() 
            },
            { where: { id: user.id } }
          );
          
          let externalAccount = await ExternalAccountsModel.findOne({
            where: {
              user_id: user.id,
              provider: 'google'
            }
          });
          
          if (!externalAccount) {
            await ExternalAccountsModel.create({
              user_id: user.id,
              provider_id: profile.id,
              provider: 'google'
            });
          }
          
        }
        
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET, 
          { expiresIn: '1h' } 
        );
        
        done(null, user);
      } catch (error) {
        console.error("Error durante la autenticación con Google:", error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UsersModel.findByPk(id, {
      include: [{ model: ExternalAccountsModel }]
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