const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
require('dotenv').config();

const app = express();

// Configura Passport para GitHub
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    // Aquí puedes guardar el perfil del usuario en tu base de datos
    // Por ahora, simplemente devolvemos el perfil
    return done(null, profile);
  }
));

// Serializar y deserializar el usuario
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configura sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'bluepixeldeveloper',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Inicializa Passport
app.use(passport.initialize());
app.use(passport.session());

// Rutas de autenticación
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // Redirecciona al usuario después de autenticarse
    res.redirect('/');
  });

// Ruta de inicio
app.get('/', (req, res) => {
  if (req.user) {
    res.send(`Bienvenido, ${req.user.username}!`);
  } else {
    res.send('No estás autenticado. <a href="/auth/github">Iniciar sesión con GitHub</a>');
  }
});

// Ruta de cierre de sesión
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.send('Error al cerrar sesión');
    }
    res.redirect('/');
  });
});

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});