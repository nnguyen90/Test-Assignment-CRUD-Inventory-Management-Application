import React, { useEffect, useState } from 'react';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { useRouter } from "next/router";
import { getToken, removeToken } from '@/lib/authenticate';

export default function MainNav (props) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = getToken();
        setIsLoggedIn(!!token);
    }, [router]);
    
    function logout () {
        removeToken();
        setIsLoggedIn(false);
        window.location.reload();
    }

    return (
        <div>
            <Navbar expand="lg" className="bg-primary text-white">
                <Container>
                    <Navbar.Brand href="#" className="text-white">Inventory</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/"className="text-white" >Home</Nav.Link>
                        {!isLoggedIn && <Nav.Link href="/login"className="text-white">Login</Nav.Link>}
                        {isLoggedIn && <Nav.Link onClick={logout}className="text-white">Logout</Nav.Link>}
                    </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );  
}