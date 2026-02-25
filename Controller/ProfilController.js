const express = require('express');
const router = express.Router();
const ProfilDAO = require('../Model/ProfilDAO');
const authenticateToken = require('../Middleware/authJWT');

router.get('/', authenticateToken, (req, res) => {
    ProfilDAO.getUserProfile(req.user.id, (err, result) => {
        if (err) return res.status(400).json({ success: false, error: err });
        res.status(200).json({ success: true, data: result.data });
    });
});

router.get('/mesfilms', authenticateToken, (req, res) => {
    ProfilDAO.getUserRentals(req.user.id, (err, result) => {
        if (err) return res.status(400).json({ success: false, error: err });
        res.status(200).json({ success: true, data: result.data });
    });
});

router.put('/password', authenticateToken, async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword) {
        return res.status(400).json({ success: false, message: "Mot de passe manquant" });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    ProfilDAO.updatePassword(req.user.id, hashedPassword, (err, result) => {
        if (err) return res.status(400).json({ success: false, error: err });
        res.status(200).json({ success: true, message: "Mot de passe modifié" });
    });
});

module.exports = router;