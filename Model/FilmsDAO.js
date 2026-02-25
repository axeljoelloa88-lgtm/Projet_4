const db = require('./Db_Connexion');

class FilmsDAO {

    static getFilmById(Id, callback) {
        // PostgreSQL utilise $1 au lieu de ?
        const sql = 'SELECT * FROM films WHERE id = $1';
        db.query(sql, [Id], (err, results) => {
            if (err) {
                console.error('Erreur : ' + err.stack);
                return callback(err, null);
            }
            // PostgreSQL retourne les résultats dans results.rows
            callback(null, results.rows);
        });
    }

    static getFilmsByFilters(filters, callback) {
        let sql = 'SELECT * FROM films WHERE 1=1';
        const params = [];
        let paramCount = 1;

        // Filtre par titre (recherche partielle insensible à la casse)
        if (filters.title) {
            sql += ` AND LOWER(title) LIKE LOWER($${paramCount})`;
            params.push(`%${filters.title}%`);
            paramCount++;
        }

        // Filtre par réalisateur ou acteur (recherche partielle insensible à la casse)
        if (filters.name) {
            sql += ` AND (LOWER(realisateurs) LIKE LOWER($${paramCount}) OR LOWER(acteurs) LIKE LOWER($${paramCount + 1}))`;
            const searchTerm = `%${filters.name}%`;
            params.push(searchTerm, searchTerm);
            paramCount += 2;
        }

        // Filtre par genre (recherche partielle insensible à la casse)
        if (filters.genre) {
            sql += ` AND LOWER(genre) LIKE LOWER($${paramCount})`;
            const searchTerm = `%${filters.genre}%`;
            params.push(searchTerm);
            paramCount++;
        }

        // Tri par défaut : titre
        sql += ' ORDER BY title ASC';

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('Erreur :', err.stack);
                return callback(err, null);
            }
            // PostgreSQL retourne les résultats dans results.rows
            callback(null, results.rows);
        });
    }

    // Nouvelle méthode pour récupérer tous les genres uniques
    static getAllGenres(callback) {
        // Version PostgreSQL pour extraire les genres uniques
        const sql = `
            SELECT DISTINCT TRIM(genre_item) as genre_name
            FROM films,
                 LATERAL unnest(string_to_array(genre, ',')) as genre_item
            WHERE genre_item IS NOT NULL AND genre_item != ''
            ORDER BY genre_name
        `;
        
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération des genres :', err.stack);
                return callback(err, null);
            }
            // PostgreSQL retourne les résultats dans results.rows
            callback(null, results.rows);
        });
    }
}

module.exports = FilmsDAO;