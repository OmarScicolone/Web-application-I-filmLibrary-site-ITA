"use strict";
/* Data Access Object (DAO) module for accessing courses and exams */
const dayjs = require('dayjs');
const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('films.db', (err) => { if (err) throw err; });


// get all films
exports.getAllFilms = (userId) => {
    return new Promise( (resolve, reject) => {
        const sql = 'select * from films where user=?';
        db.all(sql, [userId], (err,rows) => {
            if(err){
                reject(err);
                return;
            }
            else{
                const films = rows.map((f) => ({ id: f.id, title: f.title, fav: f.favorite, date: f.watchdate, rating: f.rating, user: f.user}));
                resolve((films));
            }
        });
    });
};

// get the film identified by {id}
exports.getFilmById = (id, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'select * from films where id=? and user=?';
        db.get(sql, [id, userId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row == undefined) {
                resolve({error: 'Film not found.'});
            } else {
                const film = { id: row.id, title: row.title, fav: row.favorite, date: row.watchdate, rating: row.rating, user: row.user};
                resolve(film);
            }
        });
    });
};

// create a new film
exports.createFilm = (newfilm, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'insert into films(title, favorite, watchdate, rating, user) values (?,?,?,?,?)';
        db.run(sql, [newfilm.title, newfilm.fav, newfilm.date, newfilm.rating, userId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(null);
        });
    });
};

// update an existing film
exports.updateFilm = (film, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'update films set title=?, favorite=?, watchdate=?, rating=? where id=? and user=?';
        console.log(film);
        db.run(sql, [film.title, film.fav, film.date, film.rating, film.id, userId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(film);
        });
    });
};

// delete an existing film
exports.deleteFilm = (id, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'delete from films where id=? and user=?';
        db.run(sql, [id, userId], (err) => {
            if (err) {
                reject(err);
                return;
            } 
            else
                resolve(null);
        });
    });
}

// mark an existing film as favorite/unfavorite
exports.updateFavorite = (fav, id, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'update films set favorite=? where id=? and user=?';
        db.run(sql, [fav, id, userId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(null);
        });
    });
};

// update the rating of an existing film inline
exports.updateRating = (rating, id, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'update films set rating=? where id=? and user=?';
        db.run(sql, [rating, id, userId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(null);
        });
    });
};