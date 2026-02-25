const db = require('./Db_Connexion');

class LocationDAO {
    static LouerFilm(userId, filmId, callback) {
        // 1. Vérifier si l'utilisateur a déjà 5 films non retournés
        // PostgreSQL utilise $1 au lieu de ?
        const checkUserRentalSql = `SELECT COUNT(*) AS "activeRentals" FROM rentals WHERE user_id = $1 AND return_date IS NULL`;
        db.query(checkUserRentalSql, [userId], (err, results) => {
            if (err) {
                console.error('Erreur lors de la vérification des locations :', err.stack);
                return callback({ success: false, message: "Erreur serveur." }, null);
            }
            // PostgreSQL retourne les résultats dans results.rows
            const activeRentals = parseInt(results.rows[0].activeRentals);
            
            // 2. Si l'utilisateur a déjà 5 films non retournés, refuser
            if (activeRentals >= 5) {
                return callback({ success: false, message: "Vous avez déjà 5 films en location non retournés." }, null);
            }

            // 3. Vérifier si l'utilisateur a déjà loué ce film (et ne l'a pas retourné)
            const checkDuplicateRentalSql = `SELECT COUNT(*) AS "duplicateRental" FROM rentals WHERE user_id = $1 AND film_id = $2 AND return_date IS NULL`;
            db.query(checkDuplicateRentalSql, [userId, filmId], (err, results) => {
                if (err) {
                    console.error('Erreur lors de la vérification du doublon :', err.stack);
                    return callback({ success: false, message: "Erreur serveur." }, null);
                }
                const duplicateRental = parseInt(results.rows[0].duplicateRental);
                if (duplicateRental > 0) {
                    return callback({ success: false, message: "Vous avez déjà loué ce film et ne l'avez pas encore retourné." }, null);
                }

                // 4. Vérifier si le film a des copies disponibles
                const checkFilmCopiesSql = `SELECT available_copies FROM films WHERE id = $1`;
                db.query(checkFilmCopiesSql, [filmId], (err, results) => {
                    if (err) {
                        console.error('Erreur lors de la vérification des copies disponibles :', err.stack);
                        return callback({ success: false, message: "Erreur serveur." }, null);
                    }
                    const availableCopies = parseInt(results.rows[0].available_copies);
                    if (availableCopies <= 0) {
                        return callback({ success: false, message: "Aucune copie disponible pour ce film." }, null);
                    }

                    // 5. Réduire le nombre de copies disponibles dans Films
                    const updateFilmCopiesSql = `UPDATE films SET available_copies = available_copies - 1 WHERE id = $1`;
                    db.query(updateFilmCopiesSql, [filmId], (err, results) => {
                        if (err) {
                            console.error('Erreur lors de la mise à jour des copies disponibles :', err.stack);
                            return callback({ success: false, message: "Erreur serveur." }, null);
                        }

                        // 6. Ajouter une nouvelle location dans Rentals
                        const addRentalSql = `INSERT INTO rentals (user_id, film_id, rental_date, return_date) VALUES ($1, $2, NOW(), NULL)`;
                        db.query(addRentalSql, [userId, filmId], (err, results) => {
                            if (err) {
                                console.error('Erreur lors de l\'ajout de la location :', err.stack);
                                return callback({ success: false, message: "Erreur serveur." }, null);
                            }
                            callback(null, { success: true, message: "Film loué avec succès !" });
                        });
                    });
                });
            });
        });
    }

    static RetournerFilm(userId, filmId, callback) {
        // 1. Vérifier si l'utilisateur a une location active pour ce film
        // PostgreSQL utilise $1, $2 au lieu de ?
        const checkRentalSql = `SELECT id FROM rentals WHERE user_id = $1 AND film_id = $2 AND return_date IS NULL`;
        
        db.query(checkRentalSql, [userId, filmId], (err, results) => {
            if (err) {
                console.error("Erreur lors de la vérification de la location :", err.stack);
                return callback({ success: false, message: "Erreur serveur." }, null);
            }

            // PostgreSQL retourne les résultats dans results.rows
            if (results.rows.length === 0) {
                return callback({ success: false, message: "Vous n'avez pas de location active pour ce film." }, null);
            }

            const rentalId = results.rows[0].id;

            // 2. Mettre à jour la date de retour
            const updateReturnSql = `UPDATE rentals SET return_date = NOW() WHERE id = $1`;

            db.query(updateReturnSql, [rentalId], (err) => {
                if (err) {
                    console.error("Erreur lors de la mise à jour du retour :", err.stack);
                    return callback({ success: false, message: "Erreur serveur." }, null);
                }

                // 3. Augmenter les copies disponibles du film
                const updateCopiesSql = `UPDATE films SET available_copies = available_copies + 1 WHERE id = $1`;

                db.query(updateCopiesSql, [filmId], (err) => {
                    if (err) {
                        console.error("Erreur lors de la mise à jour des copies :", err.stack);
                        return callback({ success: false, message: "Erreur serveur." }, null);
                    }

                    // 4. Succès
                    return callback(null, { success: true, message: "Film retourné avec succès !" });
                });
            });
        });
    }
}

module.exports = LocationDAO;