import 'bootstrap/dist/css/bootstrap.min.css';
import { FilmsView } from './MainFilmList.js';
import FilmForm from './FilmForm';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { NotFoundComponent } from './NotFound.js';
import { LoginForm } from './LoginComponents';
import { MyNavBar } from './NavigationBar.js';
import API from './API';

function App() {
  return (
    <>
      <Router>
        <App2 />
      </Router>
    </>
  )
}

function App2() {
  const [films, setFilms] = useState([]);
  const [dirty, setDirty] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);  // no user is logged in when app loads
  const [user, setUser] = useState({});
  const [message, setMessage] = useState('');

  const navigate = useNavigate();


  useEffect(()=> {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch(err) {
        console.log(err);
      }
    };
    checkAuth();
  }, []);
  
  useEffect(() => {
    // fetch  /api/films
    // setFilms del risultato

    if(dirty && loggedIn){
      API.getAllFilms()
        .then((films) => {
          setFilms(films);
          setDirty(false);
        })
        .catch( err => console.log(err));
    }
  }, [dirty, loggedIn]);
  

  function deleteFilm(deleteID){
    setFilms(oldFilms => oldFilms.filter(f => f.id!==deleteID));  
    API.deleteFilm(deleteID)
      .then( () => setDirty(true))
      .catch( err => console.log(err));
  }
  function addFilm(film){
      setFilms(oldFilms => oldFilms.concat(film));
      API.addFilm(film)
        .then( () => setDirty(true) )
        .catch( err => console.log(err));
  }
  function updateFilm(film){
    setFilms(oldFilms => oldFilms.map(
      f => (f.id === film.id) ? Object.assign({}, film) : f));
    API.updateFilm(film)
      .then( () => setDirty(true) )
      .catch( err => console.log(err) );
  }

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then( user => {
        setLoggedIn(true);
        setUser(user);
        setMessage('');
        navigate('/');
      })
      .catch(err => setMessage(err));
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    setFilms([]);
    setDirty(true);
    navigate('/login');   
  }
  
  return (
    <>
    <MyNavBar loggedIn={loggedIn} user={user} logout={doLogOut}/>
    <Container>
        
        <Row><Col>
        {message ? <Alert variant='danger' onClose={() => setMessage('')} dismissible>{message}</Alert> : false}
        </Col></Row>
    </Container>
    <Routes>
      <Route path='/login' element={loggedIn ? <Navigate to='/' /> : <LoginForm login={doLogIn} />} />
      <Route path='/' element={loggedIn ? (<FilmsView films={films} setFilms={setFilms} addFilm={addFilm} deleteFilm={deleteFilm} dirty={dirty} setDirty={setDirty} />) : <Navigate to='/login' /> } />
      <Route path='/filter/:activeFilter' element={<FilmsView films={films} setFilms={setFilms} addFilm={addFilm} deleteFilm={deleteFilm} dirty={dirty} setDirty={setDirty} /> } />
      <Route path='/add' element={<FilmForm films={films} addFilm={addFilm} /> } />
      <Route path='/edit/:filmId' element={<FilmForm films={films} addFilm={updateFilm} /> } />
      <Route path='*' element={<NotFoundComponent></NotFoundComponent> } />
    </Routes>
    </>
  );
}
export default App;