import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

function NotFoundComponent() {
    return ( <>
        <Container>
            <Row>
                <Col md={{ span: 6, offset: 3 }} align="center">
                    <main className="m-3">
                        <Link to='/'><h3>Page not found!!!</h3></Link>
                    </main>
                </Col>
            </Row>
        </Container></>
    );
}

export { NotFoundComponent};