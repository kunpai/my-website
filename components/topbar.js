'use client'

import { Container, Navbar, Nav, Offcanvas } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Topbar() {
    const [show, setShow] = useState(false);
    const [visible, setVisible] = useState(false);
    const pageYOffsetTrigger = 150;

    useEffect(() => {
        function toggleVisibility() {
            window.pageYOffset > pageYOffsetTrigger ? setVisible(true) : setVisible(false)
        }

        window.addEventListener("scroll", toggleVisibility);
        return () => { window.removeEventListener("scroll", toggleVisibility) }
    }, []);

    return (
        <>
            <Navbar
                className={"topbar" + (visible ? " shadow-sm bg-dark" : " bg-white")}
                variant={visible ? "dark" : "light"}
                expand="lg"
                sticky="top"
                style={{ transition: "all 0.5s ease" }}
            >
                <Container fluid>
                    <Navbar.Brand href="/" as={Link}>
                        <svg width="70" height="70" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M498.029 723H383.798L202.699 541.592H146.048V460.484H202.699L383.798 279.076H498.029L269.876 501.038L498.029 723ZM113.853 723H33.3643V279.076H113.853V723Z" fill={visible ? "#FFFFFF" : "#000000"} />
                            <path d="M990.865 464.818C990.865 483.186 988.595 499.593 984.055 514.04C979.514 528.487 973.323 541.282 965.48 552.427C957.844 563.365 948.97 572.755 938.857 580.598C928.745 588.44 918.116 594.838 906.972 599.791C896.034 604.744 884.889 608.356 873.538 610.626C862.394 612.896 851.868 614.031 841.962 614.031H659.935V533.543H841.962C852.281 532.717 861.568 530.654 869.823 527.352C878.285 523.843 885.508 519.2 891.493 513.421C897.478 507.642 902.122 500.729 905.424 492.68C908.726 484.424 910.377 475.137 910.377 464.818V428.289C909.345 418.176 907.178 408.889 903.876 400.428C900.574 391.966 896.034 384.743 890.255 378.758C884.683 372.773 877.872 368.129 869.823 364.827C861.774 361.319 852.487 359.564 841.962 359.564H660.554C649.822 359.564 641.67 362.351 636.098 367.923C630.525 373.495 627.739 381.544 627.739 392.069V723H547.251V392.069C547.251 371.431 550.966 353.889 558.396 339.442C566.032 324.996 575.422 313.335 586.566 304.461C597.917 295.587 610.197 289.189 623.405 285.268C636.614 281.14 648.79 279.076 659.935 279.076H841.962C860.123 279.076 876.427 281.45 890.874 286.196C905.321 290.737 918.013 296.928 928.951 304.771C940.096 312.407 949.486 321.281 957.122 331.394C964.965 341.506 971.362 352.135 976.315 363.279C981.475 374.217 985.19 385.362 987.46 396.713C989.73 407.857 990.865 418.383 990.865 428.289V464.818Z" fill={visible ? "#FFFFFF" : "#000000"} />
                        </svg>
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
                                Kunal Pai
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