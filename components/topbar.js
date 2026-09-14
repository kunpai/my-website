'use client'

import { Container, Navbar, Nav, Offcanvas, ButtonGroup, ToggleButton, NavDropdown } from "react-bootstrap";
import Link from "next/link";
import { useEffect, useState } from "react";
import SearchBar from './search';
import config, { features } from '@/lib/content';

export default function Topbar() {
    const [show, setShow] = useState(false);
    const [visible, setVisible] = useState(false);
    const pageYOffsetTrigger = 150;
    const name = config.name || "";
    const [isLightMode, setIsLightMode] = useState(false);
    const [theme, setTheme] = useState('auto');

    function toggleMode(isDarkMode) {
        if (isDarkMode) {
            setIsLightMode(false);
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        }
        else {
            setIsLightMode(true);
            document.documentElement.setAttribute('data-bs-theme', 'light');
        }
    }
    useEffect(() => {
        // check local storage for preference
        const theme = localStorage.getItem('theme');
        if (theme) {
            setTheme(theme);
        } else {
            setTheme('auto');
            localStorage.setItem('theme', 'auto');
        }
        if (theme === 'dark') {
            toggleMode(true);
        }
        else if (theme === 'light') {
            toggleMode(false);
        }
        else {
            toggleMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                toggleMode(e.matches);
            });

            return () => {
                window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', (e) => {
                    toggleMode(e.matches);
                });
            }
        }
    }, []);

    useEffect(() => {
        function toggleVisibility() {
            window.pageYOffset > pageYOffsetTrigger ? setVisible(true) : setVisible(false)
        }

        window.addEventListener("scroll", toggleVisibility);
        return () => { window.removeEventListener("scroll", toggleVisibility) }
    }, []);

    function getClassName(visible) {
        if (isLightMode) {
            if (visible) {
                return "topbar shadow-sm bg-dark";
            } else {
                return "topbar bg-white";
            }
        } else {
            if (visible) {
                return "topbar shadow-sm bg-dark-grey";
            } else {
                return "topbar bg-dark";
            }
        }
    }

    function getVariant(visible) {
        if (isLightMode) {
            if (visible) {
                return "dark";
            } else {
                return "light";
            }
        } else {
            if (visible) {
                return "dark";
            } else {
                return "dark";
            }
        }
    }

    const modes = [
        { name: 'Light', value: 'light' },
        { name: 'Dark', value: 'dark' },
        { name: 'Auto', value: 'auto' },
    ];

    return (
        <>
            <Navbar
                className={getClassName(visible)}
                variant={getVariant(visible)}
                expand="lg"
                sticky="top"
                style={{
                    transition: "all 0.5s ease",
                }}
            >
                <Container fluid>
                    <Navbar.Brand href="/" as={Link}>
                        <h1>
                            {config.initials || name.split(" ").map((word) => word[0].toUpperCase()).join("")}
                        </h1>
                    </Navbar.Brand>
                    <div className="d-none d-lg-flex flex-grow-1 justify-content-center">
                        {features.publications && <SearchBar />}
                    </div>
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
                            {features.publications && (
                                <div className="d-lg-none mb-3">
                                    <SearchBar />
                                </div>
                            )}
                            <Nav className="justify-content-end flex-grow-1 pe-3">
                                <Nav.Link href="/" as={Link} className="main-text-regular" onClick={() => setShow(false)}>
                                    Home
                                </Nav.Link>
                                {features.about && (
                                    <Nav.Link href="/about" as={Link} className="main-text-regular" onClick={() => setShow(false)}>
                                        About
                                    </Nav.Link>
                                )}
                                {features.projects && (
                                    <Nav.Link href="/projects" as={Link} className="main-text-regular" onClick={() => setShow(false)}>
                                        Projects
                                    </Nav.Link>
                                )}
                                {features.publications && (
                                    <Nav.Link href="/publications" as={Link} className="main-text-regular" onClick={() => setShow(false)}>
                                        Publications
                                    </Nav.Link>
                                )}
                                {features.experience && (
                                    <Nav.Link href="/work-experiences" as={Link} className="main-text-regular" onClick={() => setShow(false)}>
                                        Experience
                                    </Nav.Link>
                                )}
                                {features.blogs && (
                                    <Nav.Link href="/blogs" as={Link} className="main-text-regular" onClick={() => setShow(false)}>
                                        Blogs
                                    </Nav.Link>
                                )}
                                {features.games && (
                                    <NavDropdown title="Games" id="games-dropdown" className="main-text-regular">
                                        <NavDropdown.Item href="/games/cricket" as={Link} onClick={() => setShow(false)}>
                                            Cricket
                                        </NavDropdown.Item>
                                        <NavDropdown.Item href="/games/hangman" as={Link} onClick={() => setShow(false)}>
                                            Hangman
                                        </NavDropdown.Item>
                                        <NavDropdown.Item href="/games/tictactoe" as={Link} onClick={() => setShow(false)}>
                                            Tic Tac Toe
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                )}
                                {features.contact && (
                                    <Nav.Link href="/contact" as={Link} className="main-text-regular" onClick={() => setShow(false)}>
                                        Contact
                                    </Nav.Link>
                                )}
                            </Nav>
                            <ButtonGroup>
                                {
                                    modes.map((radio, idx) => (
                                        <ToggleButton
                                            key={idx}
                                            id={`radio-${idx}`}
                                            type="radio"
                                            variant={isLightMode ?
                                                (visible ? "outline-light" : "outline-dark") :
                                                (visible ? "outline-light" : "outline-light")
                                            }
                                            name="radio"
                                            value={radio.value}
                                            checked={theme === radio.value}
                                            onChange={(e) => {
                                                localStorage.setItem('theme', e.currentTarget.value);
                                                setTheme(e.currentTarget.value);
                                                if (e.currentTarget.value === 'auto') {
                                                    toggleMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
                                                    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                                                        toggleMode(e.matches);
                                                    });
                                                    return () => {
                                                        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', (e) => {
                                                            toggleMode(e.matches);
                                                        });
                                                    }
                                                } else {
                                                    toggleMode(e.currentTarget.value === 'dark');
                                                }
                                            }}
                                        >
                                            {radio.name}
                                        </ToggleButton>
                                    ))
                                }
                            </ButtonGroup>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar >
        </>
    )
}
