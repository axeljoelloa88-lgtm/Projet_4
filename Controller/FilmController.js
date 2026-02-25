const express = require('express');
const router = express.Router();
const FilmsDAO = require('../Model/FilmsDAO');

// Route pour récupérer les genres
router.get('/metadata/genres', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Vous devez être connecté.");
    }

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

// Route existante pour les films avec filtres
router.get('/', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Vous devez être connecté.");
    }

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

// Route existante pour un film spécifique
router.get('/:id', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Vous devez être connecté pour accéder à cette ressource");
    }

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