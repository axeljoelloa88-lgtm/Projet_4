const express = require('express');
const router = express.Router();
const ProfilDAO = require('../Model/ProfilDAO');
const { authenticateToken } = require('../index'); // <-- IMPORT DU MIDDLEWARE
const bcrypt = require('bcrypt');

// Récupérer le profil - PROTÉGÉ
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;

    ProfilDAO.getUserProfile(userId, (err, result) => {
        if (err) return res.status(400).json({ 
            success: false, 
            error: err 
        });

        res.status(200).json({
            success: true,
            data: result.data
        });
    });
});

// Récupérer les films loués - PROTÉGÉ
router.get('/mesfilms', authenticateToken, (req, res) => {
    const userId = req.user.id;

    ProfilDAO.getUserRentals(userId, (err, result) => {
        if (err) return res.status(400).json({ 
            success: false, 
            error: err 
        });

        res.status(200).json({
            success: true,
            data: result.data
        });
    });
});

// Modifier le mot de passe - PROTÉGÉ
router.put('/password', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ 
            success: false, 
            message: "Mot de passe manquant" 
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        ProfilDAO.updatePassword(userId, hashedPassword, (err, result) => {
            if (err) return res.status(400).json({ 
                success: false, 
                error: err 
            });

            res.status(200).json({ 
                success: true, 
                message: "Mot de passe modifié avec succès" 
            });
        });
    } catch (error) {
        console.error('Erreur hashage:', error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur serveur" 
        });
    }
});

module.exports = router;