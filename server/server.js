'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const {check, validationResult, body} = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const dayjs = require('dayjs');
const cors = require('cors');
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the users in the DB

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
    function(username, password, done) {
        userDao.getUser(username, password).then((user) => {
            if (!user)
                return done(null, false, { message: 'Incorrect username and/or password.' });
            return done(null, user, { message: 'Welcome, ' + user.name });
        })
    }
));
  
// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
    userDao.getUserById(id)
        .then(user => {
            done(null, user); // this will be available in req.user
        }).catch(err => {
            done(err, null);
        });
    }
);

// init express
const app = express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};
app.use(cors(corsOptions));

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated())    
        return next();
    return res.status(401).json({ error: 'not authenticated'});
}
  
// set up the session
app.use(session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
    resave: false,
    saveUninitialized: false 
}));
  
// then, init passport
app.use(passport.initialize());
app.use(passport.session());


/*** APIs ***/

// GET /api/films
app.get('/api/films', isLoggedIn, (req, res) => {
    dao.getAllFilms(req.user.id)
    .then(films => res.json(films))
    .catch(() => res.status(500).json({errors: `Database error while retrieving films`}).end());
});

// GET /api/films/<id>
app.get('/api/films/:id', isLoggedIn, async (req, res) => {
    try {
        const result = await dao.getFilmById(req.params.id, req.user.id);
        if(result.error)
            res.status(404).json(result);
        else
            res.json(result);
    } 
    catch(err) {
        res.status(500).end();
    }
});

// POST /api/films
app.post('/api/films', isLoggedIn, [
    check('rating').isInt({min: 0, max: 5}),
    check('title').notEmpty(),
    check('fav').isBoolean(),
    check('date').if(body("date").exists()).isDate({format: 'YYYY-MM-DD', strictMode: true})
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }
  
    const film = {
        title: req.body.title,
        fav: req.body.fav,
        date: req.body.date,
        rating: req.body.rating,
    };
  
    try {
        await dao.createFilm(film, req.user.id);
        res.status(201).end();
    } 
    catch(err) {
        res.status(503).json({error: `Database error during the creation of film ${film.id}.`});
    }
});

// PUT /api/films/<id>
app.put('/api/films/:id', isLoggedIn, [
    check('rating').isInt({min: 0, max: 5}),
    check('title').notEmpty(),
    check('fav').isBoolean(),
    check('date').if(body("date").exists()).isDate({format: 'YYYY-MM-DD', strictMode: true})
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
  
    const film = {
        id: req.params.id,
        title: req.body.title,
        fav: req.body.fav,
        date: req.body.date,
        rating: req.body.rating,
    };
    console.log(req.user.id);
    try {
        await dao.updateFilm(film, req.user.id);
        res.status(200).end();
    } 
    catch(err) {
        res.status(503).json({error: `Database error during the update of film ${req.params.id}.`});
    }
});

// DELETE /api/films/<id>
app.delete('/api/films/:id', isLoggedIn, async (req, res) => {
    try {
        await dao.deleteFilm(req.params.id, req.user.id);
        res.status(204).end();
    } 
    catch(err) {
        res.status(503).json({ error: `Database error during the deletion of film ${req.params.id}.`});
    }
});

// PATCH /api/films/<id>
app.patch('/api/films/:id', isLoggedIn, [
    check('fav').if(body("fav").exists()).isBoolean(),
    check('rating').if(body("rating").exists()).isInt({min: 0, max: 5})    
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    try {
        if(req.body.rating === undefined){   //se non c'è il rating vuol dire che c'è per forza il favorite
            await dao.updateFavorite(req.body.fav, req.params.id, req.user.id);
        }
        else
            await dao.updateRating(req.body.rating, req.params.id, req.user.id);
        res.status(200).end();
    } 
    catch(err) {
        res.status(503).json({error: `Database error during the update of film ${req.params.id}.`});
    }
});

// GET /api/films/filter/<filter>
app.get('/api/films/filter/:filter', isLoggedIn, (req, res) => {
    let filter = req.params.filter;
    let f = ["All", "Favorites", "Best Rated", "Seen Last Month", "Unseen"];
    if (!f.includes(filter)) 
        return  res.status(500).json({error: `Undefined filter: ${filter}`}).end();
    return dao.getAllFilms(req.user.id)
        .then((films) => films.filter( f => {
            switch(filter){
                case "All": return f; 
                case "Favorites":
                    return f.fav;
                case "Best Rated": 
                    // eslint-disable-next-line
                    return f.rating==5;
                case "Seen Last Month":             
                    return f.date !== null && dayjs().diff(dayjs(f.date), 'day') <=30;
                case "Unseen":
                    return !(f.date);
                default:   
            }
        }))
        .then(films => res.json(films))
        .catch(() => res.status(500).json({error: `Database error while retrieving filtered films`}).end());
});


/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            // display wrong login messages
            return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, (err) => {
            if (err)
                return next(err);
          
            // req.user contains the authenticated user, we send all the user info back
            // this is coming from userDao.getUser()
            return res.json(req.user);
        });
    })(req, res, next);
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
    req.logout( ()=> { res.end(); } );
});
  
// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
else
    res.status(401).json({error: 'Unauthenticated user!'});
});



// Activate the server
app.listen(port, () => {
    console.log(`server listening at http://localhost:${port}`);
});