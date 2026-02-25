const db = require('./Db_Connexion');
const bcrypt = require('bcrypt');

class ProfilDAO {

    // Récupérer toutes les locations de l'utilisateur, triées par statut (en cours ou retournées)
    static getUserRentals(userId, callback) {
        // PostgreSQL utilise $1 au lieu de ? et nécessite des guillemets pour les alias avec mots-clés
        const sql = `SELECT r.id, r.film_id, r.rental_date, r.return_date, f.title AS film_title 
                     FROM rentals r 
                     JOIN films f ON r.film_id = f.id 
                     WHERE r.user_id = $1 
                     ORDER BY r.return_date IS NULL DESC, r.rental_date DESC`;

        db.query(sql, [userId], (err, results) => {
            if (err) {
                console.error("Erreur lors de la récupération des locations :", err.stack);
                return callback({ success: false, message: "Erreur serveur." }, null);
            }
            // PostgreSQL retourne les résultats dans results.rows
            callback(null, { success: true, data: results.rows });
        });
    }

    // Récupérer les infos du profil (sauf l'id)
    static getUserProfile(userId, callback) {
        // PostgreSQL utilise $1 au lieu de ?
        const sql = `SELECT name, email, date_inscription FROM users WHERE id = $1`;

        db.query(sql, [userId], (err, results) => {
            if (err) {
                console.error("Erreur lors de la récupération du profil :", err.stack);
                return callback({ success: false, message: "Erreur serveur." }, null);
            }

            // PostgreSQL retourne les résultats dans results.rows
            if (results.rows.length === 0) {
                return callback({ success: false, message: "Utilisateur introuvable." }, null);
            }

            callback(null, { success: true, data: results.rows[0] });
        });
    }

    // Modifier le mot de passe
    static updatePassword(userId, newPassword, callback) {
        // Hacher le mot de passe avec bcrypt (coût 10)
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
            if (err) {
                console.error("Erreur lors du hachage du mot de passe :", err.stack);
                return callback({ success: false, message: "Erreur serveur." }, null);
            }

            // Mettre à jour le mot de passe haché dans la base de données
            // PostgreSQL utilise $1, $2 au lieu de ?
            const sql = `UPDATE users SET password = $1 WHERE id = $2`;
            db.query(sql, [hashedPassword, userId], (dbErr, results) => {
                if (dbErr) {
                    console.error("Erreur lors de la mise à jour du mot de passe :", dbErr.stack);
                    return callback({ success: false, message: "Erreur serveur." }, null);
                }
                
                // Vérifier si une ligne a été modifiée (optionnel)
                if (results.rowCount === 0) {
                    return callback({ success: false, message: "Utilisateur introuvable." }, null);
                }
                
                callback(null, { success: true, message: "Mot de passe mis à jour avec succès !" });
            });
        });
    }
}

module.exports = ProfilDAO;