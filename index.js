const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');
const cors = require('cors');          // <-- UNE SEULE FOIS
const jwt = require('jsonwebtoken');

app.use(cookieParser());

// Pour utiliser le body pour les requêtes JSON
app.use(express.json());


const allowedOrigins = ["https://projet-4-backend.onrender.com", "https://projet-4-frontend-84i9.onrender.com"].filter(Boolean);

// Configurer CORS pour accepter les requêtes depuis 127.0.0.1:5500
app.use(cors({
    origin: (origin, callback)=>{
        if(!origin) return callback(null, true);
        if(allowedOrigins.includes(origin)) return callback(null, true);
        return callback (new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods : ["GET","POST","PATCH","PUT","DELETE","OPTIONS"],
    allowedHeaders:["Content-Type", "Authorization"]
}));

// Middleware pour parser les données du formulaire
app.use(express.urlencoded({ extended: true }));


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

// PROXY POUR LES IMAGES TMDB - Version avec fetch natif
app.get('/api/proxy-image', async (req, res) => {
    const imageUrl = req.query.url;
    
    if (!imageUrl) {
        return res.status(400).json({ error: 'URL manquante' });
    }

    if (!imageUrl.includes('themoviedb.org')) {
        return res.status(400).json({ error: 'URL non autorisée' });
    }

    try {
        console.log('📸 Proxy image:', imageUrl.substring(0, 50) + '...');
        
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Lofilm-App/1.0',
                'Referer': 'https://projet-4-4qcd.onrender.com'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(buffer);
        
    } catch (error) {
        console.error('❌ Proxy image error:', error);
        res.status(500).json({ error: 'Erreur proxy image' });
    }
});

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
