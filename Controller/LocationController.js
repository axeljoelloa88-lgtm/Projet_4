const express = require('express');
const router = express.Router();
const LocationDAO = require('../Model/LocationDAO');
const authenticateToken = require('../Middleware/authJWT'); // <-- IMPORTER LE MIDDLEWARE

// Louer un film - PROTÉGÉ
router.post('/location', authenticateToken, (req, res) => {
    // Plus besoin de vérifier req.session.user
    // Le middleware garantit que l'utilisateur est authentifié
    // Ses infos sont dans req.user
    
    // Récupérer les données du corps de la requête
    const filmId = req.body.filmId;
    const userId = req.user.id; // <-- VIENT DU TOKEN MAINTENANT !
    
    // Vérifier que filmId est présent
    if (!filmId) {
        return res.status(400).json({ 
            success: false, 
            message: "L'ID du film est requis" 
        });
    }

    // Appeler la fonction du DAO pour louer le film
    LocationDAO.LouerFilm(userId, filmId, (err, result) => {
        if (err) {
            return res.status(400).json({ 
                success: false, 
                error: err 
            }); 
        }
        res.status(201).json({ 
            success: true, 
            message: result.message 
        });
    });
});

// Retourner un film - PROTÉGÉ
router.post('/retour', authenticateToken, (req, res) => {
    // Le middleware garantit que l'utilisateur est authentifié
    
    const { filmId } = req.body;
    const userId = req.user.id; // <-- VIENT DU TOKEN
    
    // Vérifier que filmId est présent
    if (!filmId) {
        return res.status(400).json({ 
            success: false, 
            message: "L'ID du film est requis" 
        });
    }
    
    LocationDAO.RetournerFilm(userId, filmId, (err, result) => {
        if (err) {
            return res.status(400).json({ 
                success: false, 
                error: err 
            });
        }
        res.status(200).json({ 
            success: true, 
            message: result.message 
        });
    });
});

module.exports = router;