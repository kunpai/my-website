import Link from "next/link";
import { Button, Col, Row } from "react-bootstrap";
import { useEffect, useState } from "react";

export default function Footer() {

  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const date = new Date(process.env.LAST_UPDATED);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    setLastUpdated(date.toLocaleDateString(undefined, options));
  }, []);

  return (
    <footer>
      <div className="d-flex flex-column justify-content-center align-items-center bg-light mt-5">
        <Row className="h-100 w-75">
          <Col className="text-center primary d-flex flex-column h-100 pt-2 pb-2 gap-1 footer-col align-items-center">
            <span className="text-muted main-text-regular">Connect with Me</span>
            {
                process.env.CONFIG.footerLinks ? Object.keys(process.env.CONFIG.footerLinks).map((key, index) => {
                    return (
                        <Link key={index} href={process.env.CONFIG.footerLinks[key]}>{key}</Link>
                    );
                }
                ) : null
            }
          </Col>
        </Row>
        <Row className="w-100">
          <div className="w-100 d-flex flex-column align-items-center justify-content-center pb-3">
            <hr className="w-100" />
            <p className="main-text-regular text-center">
              This website was created by Kunal Pai, Parth Shah and Harshil Patel.
            </p>
            <p>
              Last updated on {lastUpdated}
            </p>
          </div>
        </Row>
      </div>
    </footer>
  );
}