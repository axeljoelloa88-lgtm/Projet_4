const express = require('express');
const router = express.Router();
const AuthentificationDAO = require('../Model/AuthentificationDAO');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../index'); // <-- IMPORT DU MIDDLEWARE

/**
 * Enregistre un nouvel utilisateur s'il n'existe pas déjà.
 */
router.post('/register', async (req, res) => {
    const user = req.body;

    try {
        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Prépare l'objet utilisateur pour le DAO
        const newUser = {
            email: user.email,
            password: hashedPassword,
            name: user.name
        };

        // Insertion en base via le DAO
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

/**
 * Connexion - Renvoie un token JWT
 */
router.post('/login', (req, res) => {
    const user = req.body;
    
    AuthentificationDAO.SetLogin(user, (err, dbUser) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Erreur serveur" });
        }
        
        if (dbUser) {
            // CRÉATION DU TOKEN JWT
            const token = jwt.sign(
                { 
                    id: dbUser.id,
                    email: dbUser.email,
                    name: dbUser.name
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            console.log("Token JWT créé pour :", dbUser.email);

            // Réponse avec le token
            res.status(200).json({ 
                success: true, 
                message: "Connexion réussie",
                token: token,
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
 * Déconnexion
 */
router.get('/logout', (req, res) => {
    AuthentificationDAO.Logout((err, isValid) => {
        if (err) {
            return res.status(500).send("Erreur serveur");
        }
        console.log("Déconnexion réussie");
        return res.status(200).json({ 
            success: true, 
            message: "Déconnexion réussie" 
        });
    });
});

module.exports = router;