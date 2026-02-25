const db = require('./Db_Connexion');
const bcrypt = require('bcrypt');

class AuthentificationDAO {

    /**
     * Inscrit un nouvel utilisateur s’il n’existe pas déjà dans la base.
     */
    static SetInscription(user, callback) {

        // PostgreSQL utilise $1, $2 au lieu de ?
        const checkSql = "SELECT id FROM public.users WHERE email = $1";

        console.log(user);

        db.query(checkSql, [user.email], (err, results) => {
            console.log(err);
            if (err) {
                console.error("Erreur lors de la vérification de l'email : " + err.stack);
                return callback(err, null);
            }

            // Pour PostgreSQL, les résultats sont dans results.rows
            if (results.rows.length > 0) {
                // L'utilisateur existe déjà
                return callback(null, { exists: true });
            }

            // L'utilisateur n'existe pas dans ce cas on fait une insertion
            // PostgreSQL utilise $1, $2, $3 pour les paramètres
            const insertSql = "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)";
            db.query(insertSql, [user.name, user.email, user.password], (err, insertResults) => {
                if (err) {
                    console.error("Erreur d'inscription : " + err.stack);
                    return callback(err, null);
                }

                // Pour PostgreSQL, l'ID inséré est dans insertResults.rows[0] si vous utilisez RETURNING
                callback(null, { success: true, insertId: insertResults.rows[0]?.id });
            });
        });
    }

    /**
     * Vérifie si les identifiants fournis correspondent à un utilisateur existant.
     */
    static SetLogin(user, callback) {
        // PostgreSQL utilise $1 au lieu de ?
        const sql = "SELECT id, email, password, name FROM users WHERE email = $1";
        db.query(sql, [user.email], async (err, results) => {
            if (err) {
                console.error('Erreur lors de la connexion : ' + err.stack);
                return callback(err, null);
            }

            // Pour PostgreSQL, les résultats sont dans results.rows
            if (results.rows.length === 0) {
                return callback(null, false);
            }

            const dbUser = results.rows[0];

            try {
                const isMatch = await bcrypt.compare(user.password, dbUser.password);
                if (!isMatch) return callback(null, false);

                callback(null, dbUser);

            } catch (e) {
                callback(e, null);
            }
        });
    }

    // pour la Deconnexion
    static Logout(callback) {
        callback(null, callback);
    }
}

module.exports = AuthentificationDAO;