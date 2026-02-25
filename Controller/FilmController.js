const express = require('express');
const router = express.Router();
const FilmsDAO = require('../Model/FilmsDAO');
const { authenticateToken } = require('../index'); // <-- IMPORT DU MIDDLEWARE

// Route pour récupérer les genres - PROTÉGÉE
router.get('/metadata/genres', authenticateToken, (req, res) => {
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