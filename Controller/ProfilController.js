const express = require('express');
const router = express.Router();
const ProfilDAO = require('../Model/ProfilDAO');


router.get('/', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "Non autorisé." });
    }

    const userId = req.session.user.id;

    ProfilDAO.getUserProfile(userId, (err, result) => {
        if (err) return res.status(400).json(err);

        // Retourner directement les données utilisateur
        res.status(200).json({
            success: true,
            data: result.data // ← C'est ici qu'il faut accéder à result.data
        });
    });
});

router.get('/mesfilms', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "Non autorisé." });
    }

    const userId = req.session.user.id;

    ProfilDAO.getUserRentals(userId, (err, result) => {
        if (err) return res.status(400).json(err);

        res.status(200).json({
            success: true,
            data: result.data // ← Même correction ici
        });
    });
});
router.put('/password', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "Non autorisé." });
    }

    const userId = req.session.user.id;
    const newPassword = req.body.newPassword;

    if (!newPassword) {
        return res.status(400).json({ success: false, message: "Mot de passe manquant." });
    }

    ProfilDAO.updatePassword(userId, newPassword, (err, result) => {
        if (err) return res.status(400).json(err);

        res.status(200).json(result);
    });
});





module.exports = router;