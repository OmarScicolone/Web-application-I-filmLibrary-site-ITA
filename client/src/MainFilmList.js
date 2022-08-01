import { Container, Table, Form, Button, Row, Col } from 'react-bootstrap';
import { BsPencilSquare, BsTrash, BsFillStarFill, BsStar } from 'react-icons/bs';
import { MySideBar } from './FilterSideBar.js';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from './API';

function FilmsView(props) {
    const {activeFilter} = useParams();
    return(
        <>
            <Container fluid>
                <Row>
                    <Col xs={3} className="bg-light">
                        <MySideBar />
                    </Col>

                    <Col xs={9}>
                        <main className="m-3">
                            <h2>Filter: {activeFilter ? activeFilter.replace("%20", " ") : "All"}</h2>
                            <FilmsTable films={props.films} setFilms={props.setFilms} dirty={props.dirty} setDirty={props.setDirty}
                                        deleteFilm={props.deleteFilm} addFilm={props.addFilm}></FilmsTable>
                        </main>
                    </Col>
                </Row>
            </Container>  
        </>
    );
}

function FilmsTable(props){
    const navigate = useNavigate();
    const {activeFilter} = useParams();
    //stato per mantenere i film filtrati in base al filtro corrente
    const [filteredFilms, setFilteredFilms] = useState(props.films);

    function editFavorite(editFavID){
        let newFav = !props.films.find( f => f.id === editFavID ).fav;
        props.setFilms(oldFilms => oldFilms.map((f) => {
            if(f.id === editFavID)
                return { id: f.id, title: f.title, fav: !f.fav, date: f.date, rating: f.rating };
            return f;
        }));
        API.updateFavoriteInLine(editFavID, newFav)
            .then( () => props.setDirty(true))
            .catch( err => console.log(err));
    }
    function editRating(editRatingID, newRating){
        let currentRating = props.films.find( f => f.id === editRatingID ).rating;
        if(currentRating !== newRating){
            props.setFilms(oldFilms => oldFilms.map((f) => {
                if(f.id === editRatingID)
                    return { id: f.id, title: f.title, fav: f.fav, date: f.date, rating: newRating };
                return f;
            }));
            API.updateRatingInLine(editRatingID, newRating)
                .then( () => props.setDirty(true))
                .catch( err => console.log(err));
        }
    }

    //filtro lista film per la visualizzazione in base al valore dello stato che mi indica quale filtro è attivo
    let currentFilter = activeFilter ? activeFilter.replace("%20", " ") : "All";
    useEffect(() => {
        // fetch  /api/films
        // setFilms del risultato
        API.getFilteredFilms(currentFilter)
        .then((filteredFilms) => setFilteredFilms(filteredFilms))
        .catch( err => console.log("Stampa errore: " + JSON.stringify(err)))
        }, [currentFilter, props.films.length, props.dirty]
    );

    return(
        <>
            <Table>
                <tbody>
                    { filteredFilms.map((f) => <FilmRow key={f.id} film={f} deleteFilm={props.deleteFilm} editFavorite={editFavorite} editRating={editRating} />) }
                </tbody>
            </Table>
            <Button onClick={() => navigate('/add')} className="btn btn-primary rounded-circle float-end m-5 mt-2">+</Button>
        </>
    );
}

function FilmRow(props){
    return(
        <tr className="m-5"><FilmData film={props.film} deleteFilm={props.deleteFilm} editFavorite={props.editFavorite} editRating={props.editRating} /></tr>
    );
}
  
function FilmData(props) {
    const navigate = useNavigate();
    let stars = [];
    for (let i=0; i<5; i++) {
        if(i<props.film.rating)
            stars.push(<BsFillStarFill role='button' key={i} onClick={() => props.editRating(props.film.id,i+1)} />);    //i+1 servirà nel caso in cui l'utente modifichi il rating 
        else                                                                                                             //il nuovo rating sarà uguale all'indice della stella cliccata + 1
            stars.push(<BsStar role='button' key={i} onClick={() => props.editRating(props.film.id,i+1)} />);
        stars.push(" ");
    }

    return(
        <>
            <td><BsPencilSquare role='button' onClick={() => navigate(`/edit/${props.film.id}`)}/> <BsTrash role='button' onClick={() => props.deleteFilm(props.film.id)} />
                {props.film.fav? 
                    <span className="text-danger"> {props.film.title}</span> :
                    <span className="text-dark"> {props.film.title}</span>
                }
            </td>
            <td>
                <Form.Check type="checkbox" label="Favorite" defaultChecked={props.film.fav} onChange={() => props.editFavorite(props.film.id)} /> 
            </td>
            <td>{props.film.date ? props.film.date.format("MMMM D, YYYY") : ""}</td>
            <td>{stars}</td>
        </> 
    );
}



export { FilmsView };