/**
* All the API calls
*/

const dayjs = require("dayjs");
const URL = 'http://localhost:3001/api'

async function getAllFilms() {
    // call  /api/films
    const response = await fetch(URL + '/films', {credentials: 'include'});
    const filmsJson = await response.json();
    if (response.ok) {
        return filmsJson.map((f) => ({id: f.id, title: f.title, fav: f.fav, date: dayjs(f.date).isValid() ? dayjs(f.date) : undefined, rating: f.rating}) )
    } 
    else {
        throw filmsJson;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
    }    
}

async function getFilteredFilms(filter) {
    // call  /api/films/filter/<filter>
    const response = await fetch(URL + `/films/filter/${filter}`, {credentials: 'include'});
    const filmsJson = await response.json();
    if (response.ok) {
        return filmsJson.map((f) => ({id: f.id, title: f.title, fav: f.fav, date: dayjs(f.date).isValid() ? dayjs(f.date) : undefined, rating: f.rating}) )
    } 
    else {
        throw filmsJson;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
    }
}

function deleteFilm(filmId) {
    // call: DELETE /api/films/:filmId
    return new Promise((resolve, reject) => {
        fetch(URL + `/films/${filmId}`, {
            method: 'DELETE',
            credentials: 'include',
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                .then((message) => { reject(message); }) // error message in the response body
                .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
}

function addFilm(film) {
    // call: POST /api/films
    return new Promise((resolve, reject) => {
        fetch(URL + "/films/", {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({ title: film.title, fav: film.fav, date: film.date ? film.date.format('YYYY-MM-DD') : undefined, rating: film.rating }),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                .then((message) => { reject(message); }) // error message in the response body
                .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
}
  
function updateFilm(film) {
    // call: PUT /api/films/:filmId
    return new Promise((resolve, reject) => {
        fetch(URL + "/films/" + film.id, {
            method: 'PUT',
            credentials: 'include',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({ title: film.title, fav: film.fav, date: film.date ? film.date.format('YYYY-MM-DD') : undefined, rating: film.rating}),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                .then((obj) => { reject(obj); }) // error message in the response body
                .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
}

function updateRatingInLine(filmId, newRating) {
    // call: PATCH /api/films/:filmId
    return new Promise((resolve, reject) => {
        fetch(URL + `/films/${filmId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({ rating: newRating }),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                .then((obj) => { reject(obj); }) // error message in the response body
                .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
}

function updateFavoriteInLine(filmId, newFav) {
    // call: PATCH /api/films/:filmId
    return new Promise((resolve, reject) => {
        fetch(URL + `/films/${filmId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({ fav: newFav }),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                .then((obj) => { reject(obj); }) // error message in the response body
                .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
}

async function logIn(credentials) {
    let response = await fetch(URL + "/sessions", {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}
  
async function logOut() {
    await fetch(URL + "/sessions/current", { method: 'DELETE', credentials: 'include' });
}
  
async function getUserInfo() {
    const response = await fetch(URL + "/sessions/current", {credentials: 'include'});
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo;  // an object with the error coming from the server
    }
}



const API = {getAllFilms, getFilteredFilms, deleteFilm, addFilm, updateFilm, updateFavoriteInLine, updateRatingInLine, logIn, logOut, getUserInfo};
export default API;