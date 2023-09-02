import { Card, Form, Alert, Button } from "react-bootstrap";
import { useState, useEffect } from 'react';
import { authenticateUser, getToken } from "../lib/authenticate";
import { useRouter } from 'next/router';

export default function Login(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true); 
    const [warning, setWarning] = useState(null);
    const [role, setRole] = useState('guest');
    const [token, setToken] = useState(null);

    const router = useRouter();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setWarning('Please enter both username and password.');
            return;
        }
        const response = await authenticateUser(username, password, isLogin ? null : role);
        if (response.success) {
           setToken(response.token);
           router.push('/', undefined, { shallow: true });           
        } else {
            setWarning(response.message);
        }
    }

  return (
    <div>
      <Card bg="light">
        <Card.Body>
          <h2>Login/ Register</h2>
          Enter your information below:
        </Card.Body>
      </Card>
      <br />
      <Form onSubmit={handleSubmit}>
        <Form.Group>
            <Form.Label>User:</Form.Label>
            <Form.Control type="text" value={username} id="userName" name="userName" onChange={e => setUsername(e.target.value)} />
        </Form.Group>
        <br />
        <Form.Group>
            <Form.Label>Password:</Form.Label>
            <Form.Control type="password" value={password} id="password" name="password" onChange={e => setPassword(e.target.value)} />
        </Form.Group>
        <br />
        <Form.Check
            inline
            label="Choose To Register"
            type="checkbox"
            id="register-checkbox"
            checked={!isLogin}
            onChange={() => setIsLogin(false)}
        />
        <br />
        { !isLogin && <Form.Group>
            <Form.Label>Role:</Form.Label>
            <Form.Control as="select" value={role} onChange={e => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="guest">Guest</option>
            </Form.Control>
        </Form.Group>}
        
        {warning && <>
            <br />
            <Alert variant='danger'>
            {warning}
            </Alert>
        </>}
        <br />
        <br />
        <Button variant="primary" className="pull-right" type="submit">{isLogin ? 'Login' : 'Register'}</Button>     
      </Form>
    </div>
  );
}