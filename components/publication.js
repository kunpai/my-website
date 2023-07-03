import { Row, Col, Button, Badge, Popover, OverlayTrigger } from "react-bootstrap";
import publications from "/public/jsons/publications.json";
import { generateMLACitation, generateChicagoCitation, generateIEEECitation } from "@/pages/api/citation";
import CopyIcon from "./copyIcon";

export default function Publication() {

    function popover(publication) {
        return (
            <Popover id="popover-basic">
                <Popover.Header as="h3">Cite</Popover.Header>
                <Popover.Body>
                    <Col>
                        <Row>
                            <h6>MLA</h6>
                            <CopyIcon>
                                <p className="pe-2">
                                    {generateMLACitation(publication)}
                                </p>
                            </CopyIcon>
                        </Row>
                        <Row>
                            <h6>Chicago</h6>
                            <CopyIcon>
                                <p className="pe-2">
                                    {generateChicagoCitation(publication)}
                                </p>
                            </CopyIcon>
                        </Row>
                        <Row>
                            <h6>IEEE</h6>
                            <CopyIcon>
                                <p className="pe-2">
                                    {generateIEEECitation(publication)}
                                </p>
                            </CopyIcon>
                        </Row>
                    </Col>
                </Popover.Body>
            </Popover>
        )
    };

    return (
        <>
            {publications.map((publication, index) => {
                return (
                    <Row key={index} className="mb-3 p-2 experience">
                        <Col>
                            <Row>
                                <Col>
                                    <h5>{publication.title}</h5>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <h5>
                                        <Badge key={index} bg="secondary">
                                            {publication.type}
                                        </Badge>
                                    </h5>
                                </Col>
                            </Row>
                            <Row>
                                <i>
                                    <span key={index} variant="secondary">
                                        {
                                            publication.authors.map((author, index) => {
                                                const isParth = author.includes("Parth");
                                                return (
                                                    <span key={index}>
                                                        <span style={{ textDecoration: isParth ? "underline" : "none" }}>
                                                            {author}
                                                        </span>
                                                        {index < publication.authors.length - 1 ? ", " : ""}
                                                    </span>
                                                );
                                            })
                                        }
                                    </span>
                                </i>
                            </Row>
                            <Row>
                                <b>
                                    <span key={index} variant="secondary">
                                        {publication.conference}
                                    </span>
                                </b>
                            </Row>
                            <Row className="mt-2">
                                <span key={index} variant="secondary">
                                    {publication.description}
                                </span>
                            </Row>
                            <Row className="mt-3 links">
                                <Col className="d-flex align-items-center">
                                    {
                                        publication.tags ? publication.tags.map((tag, index) => {
                                            return (
                                                <Badge bg="secondary" className="me-2" key={index}>
                                                    {tag}
                                                </Badge>
                                            )
                                        }) : null
                                    }
                                </Col>
                                <Col className="d-flex justify-content-center align-items-center">
                                    <OverlayTrigger
                                        rootClose
                                        trigger="click"
                                        placement="bottom"
                                        overlay={popover(publication)}
                                    >
                                        <Button variant="outline-secondary">
                                            <span style={{ position: 'relative', top: '-2px' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-quote" viewBox="0 0 16 16" style={{ transform: 'rotate(180deg)' }}>
                                                    <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z" />
                                                </svg>
                                            </span>
                                            <span>
                                                Cite
                                            </span>
                                        </Button>
                                    </OverlayTrigger>
                                </Col>

                                <Col className="d-flex justify-content-end align-items-center">
                                    <Button variant="outline-secondary" href={publication.link} target="_blank">
                                        View Publication
                                    </Button>
                                </Col>
                            </Row>
                        </Col >
                    </Row >
                )
            }
            )}
        </>
    )

}