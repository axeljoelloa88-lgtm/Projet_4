const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');
const cors = require('cors');          // <-- UNE SEULE FOIS
const jwt = require('jsonwebtoken');

app.use(cookieParser());

// Pour utiliser le body pour les requêtes JSON
app.use(express.json());

// SUPPRIME CETTE LIGNE : const cors = require('cors');  // ← À ENLEVER !

// Configurer CORS pour accepter les requêtes depuis 127.0.0.1:5500
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));

// Middleware pour parser les données du formulaire
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du dossier Vue
app.use(express.static(path.join(__dirname, 'Vue')));

// =====================================================
// MIDDLEWARE JWT (directement dans index.js)
// =====================================================
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Token manquant - Authentification requise" 
        });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: "Token invalide ou expiré" 
            });
        }
        
        req.user = user; // Attacher l'utilisateur à la requête
        next();
    });
}

// Rendre le middleware disponible pour les controllers
module.exports.authenticateToken = authenticateToken;
// =====================================================

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
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`✅ Authentification avec JWT activée`);
});

// Export de l'application 
module.exports = app;