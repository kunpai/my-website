import { Row, Col, Button, Badge } from "react-bootstrap";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { getLinkMeta, ExternalArrowIcon } from "./linkMeta";
import ReactMarkdown from "react-markdown";
gsap.registerPlugin(ScrollTrigger);

// Description bullets are markdown: render inline (no <p> wrapper) and open links in a new tab.
const descriptionMarkdownComponents = {
    p: ({ children }) => <>{children}</>,
    a: ({ href, children }) => (
        <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
    ),
};

export default function Experience({ jsonExperiences, title, isExperience }) {
    return (
        <div className="mt-5">
            <h1 className="mb-3" id={title.toLowerCase().replace(' ', '-')}>
                {title}
            </h1>
            {
                jsonExperiences.filter(exp => exp.show_on_website !== false).map((experience, index) => {
                    return (
                        <ExperienceTile key={index} experience={experience} isExperience={isExperience} />
                    )
                })
            }
        </div>
    )
}

function ExperienceTile({ isExperience, experience }) {
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
        <Row className="mb-3 p-2 experience" ref={ref}>
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
                {experience.links && Object.keys(experience.links).length > 0 && (
                    <div className="project-actions-group my-2 justify-content-center">
                        {Object.keys(experience.links).map((key, index) => {
                            const meta = getLinkMeta(key, experience.links[key]);
                            return (
                                <Button
                                    key={index}
                                    variant="outline-secondary"
                                    size="sm"
                                    href={experience.links[key]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="project-action-btn d-inline-flex align-items-center"
                                >
                                    {meta.icon}
                                    <span>{meta.label}</span>
                                    <ExternalArrowIcon />
                                </Button>
                            );
                        })}
                    </div>
                )}
                <Row>
                <h6 className="mt-2">
                    {experience.collaborators ? 'Collaborators: ' : null}
                    {experience.collaborators && experience.collaborators.map((collaborator, index) => (
                        <span key={index}>
                            <a href={collaborator.link} target="_blank" rel="noopener noreferrer">
                                {collaborator.name}
                            </a>
                            {index < experience.collaborators.length - 1 ? ', ' : ''}
                        </span>
                    ))}
                </h6>
                </Row>
            </Col>
            <Col className="d-flex justify-content-center flex-column">
                <ul>
                    {experience.description != "" ? experience.description.split('\n').map((line, index) => (
                        <li key={index}>
                            <ReactMarkdown components={descriptionMarkdownComponents}>{line}</ReactMarkdown>
                        </li>
                    )) : <li>In progress</li>}
                </ul>
            </Col>
        </Row>
    );
}