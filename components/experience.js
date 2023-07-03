import { Row, Col, Button, Badge } from "react-bootstrap";
import Image from "next/image";

export default function Experience({ jsonExperiences, title, isExperience }) {
    return (
        <div className="mt-5">
            <h1 className="mb-3" id={title.toLowerCase().replace(' ', '-')}>
                {title}
            </h1>
            {
                jsonExperiences.map((experience, index) => {
                    return (
                        <Row key={index} className="mb-3 p-2 experience">
                            <Col className="d-flex align-items-center justify-content-center flex-column text-center">
                                <Row style={{ width: isExperience ? '100px' : "100%", height: isExperience ? '100px' : "300px" }}>
                                    <div style={{ position: 'relative' }}>
                                        <Image src={experience.image ?? "/images/placeholder.png"}
                                            fill
                                            style={{
                                                borderRadius: isExperience ? '50%' : "10px",
                                                objectFit: 'cover',
                                            }}
                                            alt={experience.organization}
                                        />
                                    </div>
                                </Row>
                                <Row>
                                    <h6>{experience.organization}</h6>
                                </Row>
                            </Col>
                            <Col className="d-flex align-items-center justify-content-center flex-column">
                                <Row>
                                    <h5>{experience.title}</h5>
                                </Row>
                                <Row className="mb-2 text-muted">
                                    {experience.start} - {experience.end}
                                </Row>
                                <Row className="mb-2 text-muted">
                                    {experience.location}
                                </Row>
                                <Row>
                                    <h6 className="text-center">
                                        {
                                            experience.skills ? experience.skills.map((skill, index) => {
                                                return (
                                                    <Badge key={index} bg="secondary" className="me-1">
                                                        {skill}
                                                    </Badge>
                                                );
                                            }
                                            ) : null
                                        }
                                    </h6>
                                </Row>
                                <Row className="gap-2">
                                    {
                                        experience.links ? Object.keys(experience.links).map((key, index) => {
                                            return (
                                                <Button key={index} variant="outline-secondary" href={experience.links[key]} target="_blank">{key}</Button>
                                            );
                                        }
                                        ) : null
                                    }
                                </Row>
                            </Col>
                            <Col className="d-flex justify-content-center flex-column">
                                <ul>
                                    {experience.description != "" ? experience.description.split('\n').map((line, index) => {
                                        return (
                                            <li key={index}>{line}</li>
                                        );
                                    }) : "In progress"}
                                </ul>
                            </Col>
                        </Row>
                    );
                })
            }
        </div>
    )
}