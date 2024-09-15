import { Row, Col, Badge } from 'react-bootstrap';
import educations from '/public/jsons/education.json'
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export default function Education() {
    return (
        <div className="mt-5">
            <h1 className="mb-3" id="publications">
                Education
            </h1>
            {
                educations.map((education, index) => {
                    return (
                        <EducationTile education={education} key={index} />
                    )
                })
            }
        </div >
    );
}

function EducationTile({ education }) {
    const ref = useRef(null);
    useEffect(() => {
        gsap.from(ref.current, {
            y: 24,
            opacity: 0,
            duration: 0.8,
            ease: 'ease',
            scrollTrigger: {
                trigger: ref.current,
                start: 'top 80%',
            },
        });
    }, []);
    return (
        <Row key={education.university} className="mb-3 p-2 experience" ref={ref}>
            <Col>
                <Row>
                    <Col>
                        <h5>{education.university}</h5>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <h5>
                            <Badge bg="secondary">
                                {education.degree}
                            </Badge>
                        </h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <i>
                            <span variant="secondary">
                                {education.major}
                            </span>
                        </i>
                    </Col>
                    <Col>
                        <b>
                            <span className="d-flex justify-content-end" variant="secondary">
                                {education.start} - {education.end}
                            </span>
                        </b>
                    </Col>
                </Row>
                <Row className="mt-2">
                    <div>
                        <li variant="secondary">
                            <b><u>GPA</u></b>: {education.gpa}
                        </li>
                    </div>
                    {education.description && (
                        <div>
                            <li variant="secondary">
                                {education.description}
                            </li>
                        </div>
                    )}
                </Row>
            </Col >
        </Row >
    )
}