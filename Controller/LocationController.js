const express = require('express');
const router = express.Router();
const LocationDAO = require('../Model/LocationDAO');
const { authenticateToken } = require('../index'); // <-- IMPORT DU MIDDLEWARE

// Louer un film - PROTÉGÉ
router.post('/location', authenticateToken, (req, res) => {
    const filmId = req.body.filmId;
    const userId = req.user.id; // <-- VIENT DU TOKEN
    
    if (!filmId) {
        return res.status(400).json({ 
            success: false, 
            message: "L'ID du film est requis" 
        });
    }

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
    const { filmId } = req.body;
    const userId = req.user.id; // <-- VIENT DU TOKEN
    
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