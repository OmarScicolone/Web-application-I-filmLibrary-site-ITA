import { Navbar, Container, Form, FormControl, Button } from "react-bootstrap";
import { BsFillCollectionPlayFill, BsPersonCircle } from 'react-icons/bs';
import { LogoutButton } from './LoginComponents';

function MyNavBar(props){
    return(
        <>
            <Navbar bg="primary" expand="lg">
                <Container fluid>
                    <Navbar.Brand href="#home"><BsFillCollectionPlayFill/> Film Library</Navbar.Brand>
                    <Form className="d-flex">
                        <FormControl type="search" placeholder="Search" className="me-2" aria-label="Search"/>
                        <Button variant="outline-light">Search</Button>
                    </Form>
                    <Navbar.Brand href="#"><BsPersonCircle/> {props.loggedIn ? <LogoutButton logout={props.logout} user={props.user} /> : false}</Navbar.Brand>
                </Container>
            </Navbar>
        </>
    );
}
export { MyNavBar };