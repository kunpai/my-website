import { Row, Col, Badge } from 'react-bootstrap';
import educations from '/public/jsons/education.json'

export default function Education() {
    return (
        educations.map((education, index) => {
            return (
                <Row key={index} className="mb-3 p-2 experience">
                    <Col>
                        <Row>
                            <Col>
                                <h5>{education.university}</h5>
                            </Col>
                            <Col className="d-flex justify-content-end">
                                <h5>
                                    <Badge key={index} bg="secondary">
                                        {education.degree}
                                    </Badge>
                                </h5>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <i>
                                    <span key={index} variant="secondary">
                                        {education.major}
                                    </span>
                                </i>
                            </Col>
                            <Col>
                                <b>
                                    <span key={index} className="d-flex justify-content-end" variant="secondary">
                                        {education.start} - {education.end}
                                    </span>
                                </b>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <li key={index} variant="secondary">
                                <b><u>GPA</u></b>: {education.gpa}
                            </li>
                            {education.description && (
                                <li key={index} variant="secondary">
                                    {education.description}
                                </li>
                            )}
                        </Row>
                    </Col >
                </Row >
            )
        }
        ));
}
