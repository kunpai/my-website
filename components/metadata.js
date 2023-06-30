import { Row, Col, Badge } from 'react-bootstrap';

export default function Metadata({ metadata }) {
    return (
        <div style={{ borderRadius: "10px" }}>
            <Row>
                <Col>
                    <h1>{metadata.title}</h1>
                </Col>
            </Row>
            <Row>
                <Col >
                    <h5 className="d-flex align-items-center justify-content-start gap-2 h-100">
                        {metadata.tags ? metadata.tags.map((tag) => (
                            <Badge bg="secondary">
                                {tag}
                            </Badge>
                        )) : null}
                    </h5>
                </Col>
            </Row >
            <hr style={{ borderWidth: "2px", opacity: "0.75" }} />
            <Row>
                <Col className="d-flex align-items-center h-100">
                    <h5 >
                        {"Authors: "}
                        {
                            metadata.authors ? metadata.authors.map((author, index) => {
                                return (
                                    <>
                                        {author}
                                        {index < metadata.authors.length - 1 ? ", " : ""}
                                    </>
                                )
                            }) : null
                        }
                    </h5>
                </Col>
                <Col className="d-flex justify-content-end align-items-center">
                    <Row>
                        <h6>
                            Published: {metadata.date}
                        </h6>
                    </Row>
                </Col>
            </Row>
            <hr style={{ borderWidth: "2px", opacity: "0.75" }} />
        </div >
    )
}