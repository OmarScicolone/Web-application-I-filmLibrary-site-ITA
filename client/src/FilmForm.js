import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';

function FilmForm(props) { 
    const { filmId } = useParams();
    //commento per evitare il warning su == (con === il risultato dell'uguaglianza è errato)
    // eslint-disable-next-line      
    const filmToEdit = props.films.find( f => f.id == filmId );
    //const [id, setId] = useState(filmToEdit ? filmToEdit.id : 0);
    const [title, setTitle] = useState(filmToEdit ? filmToEdit.title : '');
    const [fav, setFav] = useState(filmToEdit ? filmToEdit.fav : false);
    const [date, setDate] = useState(filmToEdit ? filmToEdit.date : dayjs()); 
    const [rating, setRating] = useState(filmToEdit ? filmToEdit.rating : 0);

    const [unseen, setUnseen] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');  // stringa vuota '' => non c'e' errore

    const navigate = useNavigate();
    //univocità id <= id del nuovo film è il massimo della lista + 1
    const nextId = filmToEdit ? Number(filmId) : props.films.map(f => f.id).sort((a,b) => b-a)[0] + 1;
    const handleSubmit = (event) => {
        event.preventDefault();
        // validation
        if (rating >=0 && rating <= 5 && title && (date===undefined || date.isValid())) {
            const newFilm = { id: nextId, title: title, fav: fav, date: date, rating: rating }
            //console.log(newFilm);
            props.addFilm(newFilm); 
            navigate('/');         
        } else {
            if(!title)
                setErrorMsg('Title must not be empty!');
            else if(date!==undefined && !date.isValid())
                setErrorMsg('Invalid date!');
            else
                setErrorMsg('Invalid rating: ' + rating);
        }
    }
    //se il film non è ancora stato visto non deve essere visualizzata nessuna data
    const setUnseenFilm = (event) => {
        setUnseen(event.target.checked);
        setDate(undefined);
    }

    let titolo = filmToEdit ? `Edit film ${filmToEdit.id}` : "Add new film";
    return (
        <>
            <Container>
                <Row>
                    <Col md={{ span: 6, offset: 3 }} align="center">
                        <main className="m-3">
                            <h3>{titolo}</h3>
                        </main>
                    </Col>
                </Row>
            </Container>
            <Container>
                <Row>
                    <Col>
                        <Col md={{ span: 6, offset: 3 }}>
                            {errorMsg ? <Alert variant='danger' onClose={()=> setErrorMsg('')} dismissible>{errorMsg}</Alert> : false}
                        </Col>
                        <Form onSubmit={handleSubmit}>{/*
                            <Form.Group as={Col}>
                                <Row className='mb-2'> 
                                    <Col md={{ span: 1, offset: 3 }}><Form.Label><strong>ID</strong></Form.Label></Col>
                                    <Col md={{ span: 5, offset: 0 }}><Form.Control value={id} onChange={ev => setId(ev.target.value)}></Form.Control></Col>
                                </Row>
                            </Form.Group>*/}
                            <Form.Group as={Col}>
                                <Row className='mb-2'>
                                    <Col md={{ span: 1, offset: 3 }}><Form.Label><strong>Title</strong></Form.Label></Col>
                                    <Col md={{ span: 5, offset: 0 }}><Form.Control value={title} onChange={ev => setTitle(ev.target.value)}></Form.Control></Col>
                                </Row>
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Row className='mb-2'>
                                <Col md={{ span: 1, offset: 3 }}><Form.Check.Label><strong>Favorite</strong></Form.Check.Label></Col>
                                <Col md={{ span: 5, offset: 0 }}><Form.Check type="checkbox" defaultChecked={fav} onChange={ev => setFav(ev.target.checked)}/></Col>
                                </Row>
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Row className='mb-2'>
                                    <Col md={{ span: 1, offset: 3 }}><Form.Label><strong>Date</strong></Form.Label></Col>
                                    <Col md={{ span: 3, offset: 0 }}><Form.Control type='date'disabled={unseen} value={date ? date.format('YYYY-MM-DD') : ""} onChange={ev => setDate(dayjs(ev.target.value))} /></Col>
                                    <Col md={{ span: 2, offset: 0 }}><Form.Check type="checkbox" defaultChecked={unseen} onChange={setUnseenFilm} label="Not seen yet"/></Col>
                                </Row>
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Row className='mb-2'>
                                    <Col md={{ span: 1, offset: 3 }}><Form.Label><strong>Rating</strong></Form.Label></Col>
                                    <Col md={{ span: 5, offset: 0 }}><Form.Control type='number' min={0} max={5} value={rating} onChange={ev => setRating(ev.target.value)} /></Col>
                                </Row>
                            </Form.Group>
                            <div align="center">
                                <Button type='submit' className='ms-10'size='sm' onClick={handleSubmit}>Save</Button>
                                <Button className='m-2' size='sm' variant='secondary' onClick={()  => navigate('/')}>Cancel</Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default FilmForm;