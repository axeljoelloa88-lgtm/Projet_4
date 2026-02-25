const express = require('express');
const router = express.Router();
const AuthentificationDAO = require('../Model/AuthentificationDAO');
const bcrypt = require('bcrypt');


/**
 * Enregistre un nouvel utilisateur s’il n'existe pas déjà.
 * Les données sont envoyées dans le corps de la requête (email, password).
 */

router.post('/register', async (req, res) => {
    const user = req.body;

    try {
        // 2. Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // 3. Prépare l'objet utilisateur pour le DAO
        const newUser = {
            email: user.email,
            password: hashedPassword, // <-- mot de passe haché
            name: user.name
        };

        // 4. Insertion en base via le DAO
        AuthentificationDAO.SetInscription(newUser, (err, results) => {
            if (err) {
                return res.status(500).send('Erreur serveur');
            }

            res.json(results);
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur interne lors du hashage");
    }
});


// Dans AuthentificationController.js - Modifiez la route /login
router.post('/login', (req, res) => {
    const user = req.body;
    AuthentificationDAO.SetLogin(user, (err, dbUser) => {
        if (err) {
            res.status(500).json({ success: false, message: "Erreur serveur" });
        } else if (dbUser) {
            // Stocke l'utilisateur dans la session
            req.session.user = {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name
            };
            
            console.log("Session créée :", req.session.user);

            // Réponse avec les données utilisateur
            res.status(200).json({ 
                success: true, 
                message: "Connexion réussie",
                user: {
                    id: dbUser.id,
                    email: dbUser.email,
                    name: dbUser.name
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Email ou mot de passe incorrect" });
        }
    });
});


    

/**
 * Simule une déconnexion.
 */
router.get('/logout', (req, res) => {
    AuthentificationDAO.Logout((err, isValid) => {
        if (err) {
            return res.status(500).send("Erreur serveur");
        }

        // Tuer la session
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send("Erreur lors de la suppression de la session");
            }

            // Effacer le cookie lié à la session
            res.clearCookie('connect.sid'); // nom par défaut d’express-session
            
            console.log("Session terminée");
            return res.status(200).send("Déconnexion réussie");
        });
    });
});


module.exports = router;
