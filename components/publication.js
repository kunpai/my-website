import { Row, Col, Button, Badge, Popover, OverlayTrigger } from "react-bootstrap";
import publications from "/public/jsons/publications.json";
import { generateMLACitation, generateChicagoCitation, generateIEEECitation, generateBibtexCitation } from "@/pages/api/citation";
import CopyIcon from "./copyIcon";
import { useRef, useEffect, useMemo, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export default function Publication({ searchQuery }) {
    const name = process.env.CONFIG?.name || "Kunal Pai";

    const [selectedType, setSelectedType] = useState("conference");

    // Extract unique types, sort them alphabetically, and put "All" first
    const publicationTypes = useMemo(() => {
        const types = publications.map(p => p.type);
        // Create a Set for unique values, convert to array, and sort alphabetically
        const uniqueSortedTypes = [...new Set(types)].sort((a, b) => a.localeCompare(b));
        return ["All", ...uniqueSortedTypes];
    }, []);

    const filteredPublications = useMemo(() => {
        let filtered = publications;

        if (selectedType !== "All") {
            filtered = filtered.filter(publication => publication.type === selectedType);
        }

        if (searchQuery && searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const queryWords = query.split(/\s+/).filter(word => word.length > 0);

            filtered = filtered.filter(publication => {
                const title = (publication.title || '').toLowerCase();
                const description = (publication.description || '').toLowerCase();
                const authors = (publication.authors || []).join(' ').toLowerCase();
                const conference = (publication.conference || '').toLowerCase();
                const tags = (publication.tags || []).join(' ').toLowerCase();

                return queryWords.some(word =>
                    title.includes(word) ||
                    description.includes(word) ||
                    authors.includes(word) ||
                    conference.includes(word) ||
                    tags.includes(word)
                );
            });
        }

        return filtered;
    }, [searchQuery, selectedType]);

    return (
        <div className="publications-container">
            {/* Main Title and Picker inline */}
            <Row className="align-items-center mb-4">
                <Col>
                    {/* Make sure to delete the title from your parent layout so it doesn't double up! */}
                    <h1 className="mb-3" id="publications">
                        Publications
                    </h1>
                    {/* <h2 className="mb-0" style={{ fontWeight: 'bold' }}>Publications</h2> */}
                </Col>
                <Col xs="auto" className="d-flex flex-wrap gap-2 mt-3 mt-md-0">
                    {publicationTypes.map((type, index) => (
                        <Button
                            key={index}
                            variant={selectedType === type ? "secondary" : "outline-secondary"}
                            size="sm"
                            onClick={() => setSelectedType(type)}
                            style={{ 
                                textTransform: "capitalize", 
                                borderRadius: "20px",
                                padding: "0.25rem 1rem"
                            }}
                        >
                            {type}
                        </Button>
                    ))}
                </Col>
            </Row>

            {/* Main Publications Feed */}
            {filteredPublications.length === 0 ? (
                <div className="text-center text-muted mt-5">
                    <p>No publications found {searchQuery ? `matching "${searchQuery}"` : `for type "${selectedType}"`}.</p>
                    <p>Try adjusting your filters or search keywords.</p>
                </div>
            ) : (
                filteredPublications.map((publication, index) => (
                    <PublicationTile key={`${publication.title}-${index}`} publication={publication} name={name} />
                ))
            )}
        </div>
    )
}

function PublicationTile({ publication, name }) {
    const ref = useRef(null);

    function popover(publication) {
        return (
            <Popover id="popover-basic">
                <Popover.Header as="h3">Cite</Popover.Header>
                <Popover.Body>
                    <Col>
                        <Row>
                            <h6>BibTeX</h6>
                            <CopyIcon>
                                <div className="bibtex-container">
                                    <pre className="bibtex-content">
                                        {generateBibtexCitation(publication)}
                                    </pre>
                                </div>
                            </CopyIcon>
                        </Row>
                    </Col>
                </Popover.Body>
            </Popover>
        )
    };

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
            <Col>
                <Row>
                    <Col>
                        <h5>{publication.title}</h5>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <h5>
                            <Badge bg="secondary" style={{ textTransform: "capitalize" }}>
                                {publication.type}
                            </Badge>
                        </h5>
                    </Col>
                </Row>
                <Row>
                    <i>
                        <span variant="secondary">
                            {
                                publication.authors.map((author, index) => {
                                    const isMe = author.includes(name.split(" ")[0]);
                                    return (
                                        <span key={index}>
                                            <span style={{ textDecoration: isMe ? "underline" : "none", fontWeight: isMe ? "bold" : "normal" }}>
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
                        <span variant="secondary">
                            {publication.conference}
                        </span>
                    </b>
                </Row>
                <Row className="mt-2">
                    <span variant="secondary">
                        {publication.description}
                    </span>
                </Row>
                <Row className="mt-3 links">
                    <Col className="d-flex flex-wrap align-items-center">
                        {
                            publication.tags ? publication.tags.map((tag, index) => {
                                return (
                                    <Badge bg="secondary" className="me-2 mb-2" key={index}>
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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-quote" viewBox="0 0 16 16" style={{ transform: 'rotate(180deg)' }}>
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
                        {publication.links && Object.keys(publication.links).map((key, index) => (
                            <Button key={index} variant="outline-secondary" href={publication.links[key]} target="_blank" className="ms-2 mb-2">
                                {key}
                            </Button>
                        ))}
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}