'use client'

import { Container, Navbar, Nav, Offcanvas } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Topbar() {
    const [show, setShow] = useState(false);
    const [visible, setVisible] = useState(false);
    const pageYOffsetTrigger = 150;
    const name = process.env.CONFIG.name;

    useEffect(() => {

        function returnDarkMode() {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        }

        function toggleVisibility() {
            window.pageYOffset > pageYOffsetTrigger ? setVisible(true) : setVisible(false)
            // reverse in dark mode
            if (returnDarkMode()) {
                window.pageYOffset > pageYOffsetTrigger ? setVisible(false) : setVisible(true)
            }
        }

        window.addEventListener("scroll", toggleVisibility);
        return () => { window.removeEventListener("scroll", toggleVisibility) }
    }, []);

    return (
        <>
            <Navbar
                className={"topbar" + ((visible) ? " shadow-sm bg-dark" : " bg-white")}
                variant={(visible) ? "dark" : "light"}
                expand="lg"
                sticky="top"
                style={{ transition: "all 0.5s ease" }}
            >
                <Container fluid>
                    <Navbar.Brand href="/" as={Link}>
                        <h1>
                            {name.split(" ").map((word, index) => {
                                return word[0].toUpperCase();
                            })}
                        </h1>
                    </Navbar.Brand>
                    <Navbar.Toggle
                        aria-controls={`offcanvasNavbar-expand-sm`}
                        onClick={() => setShow(true)}
                    />
                    <Navbar.Offcanvas
                        id={`offcanvasNavbar-expand-sm`}
                        aria-labelledby={`offcanvasNavbarLabel-expand-sm`}
                        show={show}
                        onHide={() => setShow(false)}
                        placement="end"
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-sm`}>
                                {name}
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="justify-content-end flex-grow-1 pe-3">
                                <Nav.Link href="/" as={Link} className="main-text-regular" onClick={() => setShow(false)}>
                                    Home
                                </Nav.Link>
                                <Nav.Link href="/about" as={Link} className="main-text-regular" onClick={() => setShow(false)}>
                                    About
                                </Nav.Link>
                                <Nav.Link href="/blogs" as={Link} className="main-text-regular" onClick={() => setShow(false)}>
                                    Blogs
                                </Nav.Link>
                                <Nav.Link href="/publications" as={Link} className="main-text-regular" onClick={() => setShow(false)}>
                                    Publications
                                </Nav.Link>
                                <Nav.Link href="/contact" as={Link} className="main-text-regular" onClick={() => setShow(false)}>
                                    Contact Me
                                </Nav.Link>
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>
        </>
    )
}