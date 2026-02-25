const express = require('express');
const router = express.Router();
const LocationDAO = require('../Model/LocationDAO');

router.post('/location', (req, res) => {
    // 1. Vérifier la session 
    if (!req.session.user) {
        return res.status(401).send("Vous devez être connecté pour louer un film.");
    }

    // 2. Récupérer les données du corps de la requête
    const  filmId = req.body.filmId;
    const userId = req.session.user.id;

    // 3. Appeler la fonction du DAO pour louer le film
    LocationDAO.LouerFilm(userId, filmId, (err, result) => {
        if (err) {
            return res.status(400).json(err); 
        }
        res.status(201).json({ success: true, message: result.message });
    });
});

router.post('/retour', (req, res) => {
    
    if (!req.session.user) {
        return res.status(401).send("Vous devez être connecté pour retourner un film.");
    }
    const {filmId} = req.body;
     const userId = req.session.user.id;
    LocationDAO.RetournerFilm(userId, filmId, (err, result) => {
        if (err) {
            return res.status(400).json(err);
        }
        res.status(200).json({success: true,  message: result.message });
    });
});




module.exports = router;