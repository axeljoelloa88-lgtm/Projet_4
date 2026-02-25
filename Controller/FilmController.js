const express = require('express');
const router = express.Router();
const FilmsDAO = require('../Model/FilmsDAO');
const authenticateToken = require('../Middleware/authJWT'); // <-- IMPORTER LE MIDDLEWARE

// Route pour récupérer les genres - PROTÉGÉE
router.get('/metadata/genres', authenticateToken, (req, res) => {
    // Plus besoin de vérifier req.session.user, le middleware l'a déjà fait !
    
    FilmsDAO.getAllGenres((err, results) => {
        if (err) {
            return res.status(500).send('Erreur serveur');
        }
        res.json({
            success: true,
            data: results.map(g => g.genre_name)
        });
    });
});

// Route pour les films avec filtres - PROTÉGÉE
router.get('/', authenticateToken, (req, res) => {
    // Le middleware garantit que l'utilisateur est authentifié
    // Ses infos sont dans req.user (si besoin)
    
    const { title, name, genre } = req.query;
    const filters = {};
    if (title) filters.title = title;
    if (name) filters.name = name;
    if (genre) filters.genre = genre;

    FilmsDAO.getFilmsByFilters(filters, (err, results) => {
        if (err) {
            return res.status(500).send('Erreur serveur');
        }
        res.json({ 
            success: true, 
            data: results
        });
    });
});

// Route pour un film spécifique - PROTÉGÉE
router.get('/:id', authenticateToken, (req, res) => {
    const Id = req.params.id;

    FilmsDAO.getFilmById(Id, (err, results) => {
        if (err) {
            return res.status(500).send('Erreur serveur');
        }

        res.json({ 
            success: true, 
            data: results[0]
        });
    });
});

module.exports = router;