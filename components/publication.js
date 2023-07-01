import { Row, Col, Button, Badge } from "react-bootstrap";
import publications from "/public/jsons/publications.json";

export default function Publication() {
    return (
        publications.map((publication, index) => {
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
                                            return (
                                                <span key={index}>
                                                    {author}
                                                    {index < publication.authors.length - 1 ? ", " : ""}
                                                </span>
                                            )
                                        }
                                        )
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
                        <Row className="mt-3 ">
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
                            <Col className="d-flex justify-content-end">
                                <Button variant="outline-secondary" href={publication.link} target="_blank">
                                    View Publication
                                </Button>
                            </Col>
                        </Row>
                    </Col >
                </Row >
            )
        }
        ))
}