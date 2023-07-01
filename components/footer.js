import Link from "next/link";
import { Button, Col, Row } from "react-bootstrap";

/**
 * @component
 * @description This component returns a footer section containing three columns with links to various resources related to gem5.
 * Along with that, it also creates a contributing to gem5 component below these columns.
 * @returns {JSX.Element} The JSX element representing the footer section.
 */
export default function Footer() {

  return (
    <footer>
      <div className="d-flex flex-column justify-content-center align-items-center bg-light mt-5">
        <Row className="h-100 w-75">
          <Col className="text-center primary d-flex flex-column h-100 pt-2 pb-2 gap-1 footer-col align-items-center">
            <span className="text-muted main-text-regular">Connect with Me</span>
            <Link href="https://scholar.google.com/citations?hl=en&user=-0ZTuE4AAAAJ">
              Google Scholar
            </Link>
            <Link href="https://github.com/kunpai">
              GitHub
            </Link>
            <Link href="https://www.linkedin.com/in/kunpai/">
              LinkedIn
            </Link>
            <Link href="https://www.instagram.com/datboikunalpai/">
              Instagram
            </Link>
          </Col>
        </Row>
        <Row className="w-100">
            <div className="w-100 d-flex flex-column align-items-center justify-content-center pb-3">
                <hr className="w-100" />
                <p className="main-text-regular text-center">
                    This website was created by Kunal Pai, Parth Shah and Harshil Patel.
                </p>
            </div>
        </Row>
      </div>
    </footer>
  );
}