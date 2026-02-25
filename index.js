const express = require('express');
const cookieParser = require('cookie-parser');
// const session = require('express-session'); // <-- À SUPPRIMER
const app = express();

app.use(cookieParser());

// Pour utiliser le body pour les requêtes JSON
app.use(express.json());

// ✅ PLUS BESOIN DE SESSION - ON SUPPRIME TOUT CE BLOC :
/*
app.use(session({
        secret: 'min_max',
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
        }
}));
*/

const path = require('path');
const cors = require('cors');

// Configurer CORS pour accepter les requêtes depuis 127.0.0.1:5500
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true, // On garde si tu utilises cookies pour autre chose
    // Note: Avec JWT, on n'a plus besoin de credentials=true si on utilise localStorage
    // Mais ça ne gêne pas de le laisser
}));

// Middleware pour parser les données du formulaire
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du dossier Vue
app.use(express.static(path.join(__dirname, 'Vue')));

// Importation des routes
const AuthentificationRoutes = require('./Controller/AuthentificationController');
const FilmRoutes = require('./Controller/FilmController');
const LocationRoutes = require('./Controller/LocationController');
const ProfilRoutes = require('./Controller/ProfilController');

// Association des routes 
app.use('/api/auth', AuthentificationRoutes);   
app.use('/api/films', FilmRoutes); 
app.use('/api/rentals', LocationRoutes);
app.use('/api/profil', ProfilRoutes);

// Démarrage du serveur sur le port spécifié
const PORT = process.env.PORT || 3000; // ✅ Utilise la variable d'environnement PORT

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`✅ Authentification avec JWT activée`);
});

// Export de l'application 
module.exports = app;