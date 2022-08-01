import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';

function LoginForm(props) {
  const [username, setUsername] = useState('testuser@polito.it');
  const [password, setPassword] = useState('password');
  const [errorMessage, setErrorMessage] = useState('') ;
  
  const handleSubmit = (event) => {
      event.preventDefault();
      setErrorMessage('');
      const credentials = { username, password };
      
      let msg = "";
      let valid = true;
      let email_reg_exp = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-]{2,})+.)+([a-zA-Z0-9]{2,})+$/;
      if(password === '' || password === undefined){
        valid = false;
        msg = "Empty password!";
      }
      if (!email_reg_exp.test(username) || (username === "") || (username === undefined)) {
        valid = false;
        msg = "Invalid username!";
      }
      if(valid){
        props.login(credentials);
      }
      else {
        // show a better error message...
        setErrorMessage("Error: " + msg);
      }
  };

  return (
      <Container>
          <Row>
              <Col>
                  <h2>Login</h2>
                  <Form>
                      {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : ''}
                      <Form.Group controlId='username'>
                          <Form.Label>email</Form.Label>
                          <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                      </Form.Group>
                      <Form.Group controlId='password'>
                          <Form.Label>Password</Form.Label>
                          <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                      </Form.Group>
                      <Button onClick={handleSubmit}>Login</Button>
                  </Form>
              </Col>
          </Row>
      </Container>
    )
}

function LogoutButton(props) {
  return(
    <>
      <span>Welcome, {props.user?.name}</span>{' '}<Button variant="outline-dark" onClick={props.logout}>Logout</Button>
    </>
  )
}

export { LoginForm, LogoutButton };