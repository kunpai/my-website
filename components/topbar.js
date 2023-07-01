'use client'

import { Container, Navbar, Nav, Offcanvas } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

/**
 * @component
 * @description This component returns the top navigation bar for the gem5 website.
 * It includes a logo, a toggle button for small screens, and an offcanvas menu with links to Home, About, and Documentation pages.
 * @returns {JSX.Element} The JSX element representing the top navigation bar.
*/
export default function Topbar() {
    const [show, setShow] = useState(false);

    return (
        <>
            <Navbar bg="light" className="shadow-sm" expand="lg" sticky="top">
                <Container fluid>
                    <Navbar.Brand href="/" as={Link}>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-sm`} />
                    <Navbar.Offcanvas
                        id={`offcanvasNavbar-expand-sm`}
                        aria-labelledby={`offcanvasNavbarLabel-expand-sm`}
                        placement="end"
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-sm`}>
                                Kunal's website
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="justify-content-end flex-grow-1 pe-3">
                                <Nav.Link href="/" as={Link} className="main-text-regular">Home</Nav.Link>
                                <Nav.Link href="/about" as={Link} className="main-text-regular">About</Nav.Link>
                                <Nav.Link href="/blogs" as={Link} className="main-text-regular">Blogs</Nav.Link>
                                <Nav.Link href="/help" as={Link} className="main-text-regular">Help</Nav.Link>
                                {/* <Nav.Link href="https://www.gem5.org/documentation/general_docs/gem5_resources/" as={Link} className="main-text-regular">Documentation</Nav.Link> */}
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>
        </>
    )
}