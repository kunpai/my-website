import { Row, Col, Button, Badge, Popover, OverlayTrigger } from "react-bootstrap";
import publicationsRaw from "/public/jsons/publications.json";
const publications = publicationsRaw.filter(p => p.show_on_website !== false);
import { generateMLACitation, generateChicagoCitation, generateIEEECitation, generateBibtexCitation } from "@/pages/api/citation";
import CopyIcon from "./copyIcon";
import { useRef, useEffect, useMemo, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Coordinates for the Interactive SVG Research Graph
// Function to dynamically discover topics and calculate SVG coordinates at runtime
const generateGraphData = (pubs) => {
    const coreCategoryTags = ["Computer Architecture", "Large Language Models (LLMs)", "Software Engineering"];
    
    // Extract unique tags across all publications
    const allTags = new Set();
    pubs.forEach(pub => {
        if (pub.tags) {
            pub.tags.forEach(t => allTags.add(t));
        }
    });
    
    // Sub-topics are all tags that are not main categories
    const subtopicTags = Array.from(allTags).filter(t => !coreCategoryTags.includes(t));
    
    const width = 680;
    const height = 460;
    const xc = width / 2;
    const yc = height / 2;
    
    // Position categories in a central triangle layout
    const rCategory = 85;
    const categoryDescriptions = {
        "Computer Architecture": "Hardware simulation, cryogenic systems, and reproducibility.",
        "Large Language Models (LLMs)": "Vulnerabilities in agentic systems, prompt injections, and multi-agents.",
        "Software Engineering": "Code documentation, repository mining, and model calibration."
    };
    
    const categoryNodes = coreCategoryTags.map((tag, i) => {
        const angle = (2 * Math.PI * i) / coreCategoryTags.length - Math.PI / 2;
        return {
            id: tag,
            label: tag,
            x: xc + rCategory * Math.cos(angle),
            y: yc + rCategory * Math.sin(angle),
            size: 24,
            type: "category",
            className: tag === "Computer Architecture" ? "category-arch" : tag === "Large Language Models (LLMs)" ? "category-llm" : "category-se",
            description: categoryDescriptions[tag] || `Core research in ${tag}.`,
            matches: [tag]
        };
    });
    
    // Group sub-topics under core categories based on co-occurrence in papers
    const tagToCategoryMap = {};
    pubs.forEach(pub => {
        if (!pub.tags) return;
        
        const paperCategories = pub.tags.filter(t => coreCategoryTags.includes(t));
        const paperSubtopics = pub.tags.filter(t => !coreCategoryTags.includes(t));
        
        paperSubtopics.forEach(subtopic => {
            if (!tagToCategoryMap[subtopic]) {
                tagToCategoryMap[subtopic] = new Set();
            }
            paperCategories.forEach(cat => {
                tagToCategoryMap[subtopic].add(cat);
            });
        });
    });
    
    // Build connection links
    const links = [];
    Object.keys(tagToCategoryMap).forEach(subtopic => {
        tagToCategoryMap[subtopic].forEach(catId => {
            links.push({ source: catId, target: subtopic });
        });
    });
    
    // Position subtopic nodes in a wider outer circle, fanning them out symmetrically around parent angles
    const rSubtopic = 210;
    
    // Group subtopics by their parent categories combination to spread them symmetrically
    const parentGroupTags = {};
    subtopicTags.forEach(tag => {
        const parents = Array.from(tagToCategoryMap[tag] || []).sort();
        const groupKey = parents.join(",");
        if (!parentGroupTags[groupKey]) {
            parentGroupTags[groupKey] = [];
        }
        parentGroupTags[groupKey].push(tag);
    });
    
    const tagNodes = [];
    Object.keys(parentGroupTags).forEach(groupKey => {
        const tagsInGroup = parentGroupTags[groupKey];
        const parents = groupKey.split(",").filter(Boolean);
        
        let baseAngle = 0;
        if (parents.length > 0) {
            let sumCos = 0;
            let sumSin = 0;
            parents.forEach(pId => {
                const parentNode = categoryNodes.find(n => n.id === pId);
                if (parentNode) {
                    const dx = parentNode.x - xc;
                    const dy = parentNode.y - yc;
                    const len = Math.sqrt(dx*dx + dy*dy);
                    sumCos += dx / len;
                    sumSin += dy / len;
                }
            });
            baseAngle = Math.atan2(sumSin, sumCos);
        } else {
            baseAngle = 0;
        }
        
        const K = tagsInGroup.length;
        const deltaTheta = 0.28; // Spacing in radians (about 16 degrees)
        
        tagsInGroup.forEach((tag, j) => {
            // Symmetrical offset calculation: e.g. for K=3, offsets are -delta, 0, +delta
            const offset = (j - (K - 1) / 2) * deltaTheta;
            const angle = baseAngle + offset;
            
            tagNodes.push({
                id: tag,
                label: tag,
                x: xc + rSubtopic * Math.cos(angle),
                y: yc + rSubtopic * Math.sin(angle),
                size: 10,
                type: "tag",
                parent: parents.length > 0 ? parents[0] : null,
                matches: [tag],
                parents: parents
            });
        });
    });
    
    return {
        nodes: [...categoryNodes, ...tagNodes],
        links: links,
        tagNodes: tagNodes
    };
};

const { nodes, links, tagNodes } = generateGraphData(publications);

// Interactive SVG Mind Map Graph Component
function ResearchGraph({ activeFilter, onSelectFilter }) {
    const [hoveredNode, setHoveredNode] = useState(null);

    const isConnectionActive = (link) => {
        if (!hoveredNode) return false;
        return link.source === hoveredNode.id || link.target === hoveredNode.id;
    };

    const handleNodeClick = (node) => {
        if (node.type === "category") {
            const childTags = tagNodes.filter(t => t.parent === node.id).flatMap(t => t.matches);
            onSelectFilter({
                type: "tag",
                value: childTags,
                name: node.label
            });
        } else {
            onSelectFilter({
                type: "tag",
                value: node.matches,
                name: node.label
            });
        }
    };

    return (
        <div className="text-center p-3">
            <svg 
                viewBox="0 0 680 460" 
                width="100%" 
                height="100%" 
                className="research-graph-svg"
                style={{ maxWidth: "680px" }}
            >
                {/* Connections (Links) */}
                <g>
                    {links.map((link, index) => {
                        const sourceNode = nodes.find(n => n.id === link.source);
                        const targetNode = nodes.find(n => n.id === link.target);
                        if (!sourceNode || !targetNode) return null;

                        const active = isConnectionActive(link);
                        const dimmed = hoveredNode && !active;

                        return (
                            <line
                                key={index}
                                x1={sourceNode.x}
                                y1={sourceNode.y}
                                x2={targetNode.x}
                                y2={targetNode.y}
                                className={`graph-link ${active ? 'active-link' : ''} ${dimmed ? 'dimmed-link' : ''}`}
                            />
                        );
                    })}
                </g>

                {/* Nodes */}
                <g>
                    {nodes.map((node) => {
                        const isHovered = hoveredNode && hoveredNode.id === node.id;
                        const isDimmed = hoveredNode && hoveredNode.id !== node.id && 
                            !links.some(l => 
                                (l.source === node.id && l.target === hoveredNode.id) || 
                                (l.target === node.id && l.source === hoveredNode.id)
                            );
                        
                        const isSelected = activeFilter && activeFilter.type === "tag" && activeFilter.name === node.label;
                        
                        return (
                            <g
                                key={node.id}
                                transform={`translate(${node.x}, ${node.y})`}
                                className={`graph-node ${node.className || 'tag-node'} ${isSelected ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`}
                                onMouseEnter={() => setHoveredNode(node)}
                                onMouseLeave={() => setHoveredNode(null)}
                                onClick={() => handleNodeClick(node)}
                            >
                                <circle 
                                    r={node.size + (isHovered ? 3 : 0)} 
                                    strokeWidth={isHovered ? 2.5 : 1}
                                />
                                <text
                                    y={node.type === "category" ? node.size + 15 : 20}
                                    textAnchor="middle"
                                >
                                    {node.label}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>
            
            <div className="mt-3 text-center" style={{ minHeight: "44px" }}>
                {hoveredNode ? (
                    <div>
                        <strong className="text-secondary" style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                            {hoveredNode.type === "category" ? "Research Field" : "Subtopic"}
                        </strong>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                            {hoveredNode.type === "category" ? hoveredNode.description : `Click to view publications related to "${hoveredNode.label}"`}
                        </p>
                    </div>
                ) : (
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                        💡 Hover over nodes to highlight connections. Click to filter the papers list.
                    </span>
                )}
            </div>
        </div>
    );
}

// Main Publication Component
export default function Publication({ searchQuery, hideGraph = false }) {
    const name = process.env.CONFIG?.name || "Kunal Pai";

    const [selectedType, setSelectedType] = useState("All");
    const [activeFilter, setActiveFilter] = useState(null); // { type: "tag"|"keyword", value: [...], name: "" }
    const [viewMode, setViewMode] = useState(hideGraph ? "compact" : "graph"); // "graph" | "compact"
    const [showToast, setShowToast] = useState(false);

    // Watch for custom copied event
    useEffect(() => {
        const handleCopied = () => {
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 2500);
        };
        window.addEventListener('text-copied', handleCopied);
        return () => window.removeEventListener('text-copied', handleCopied);
    }, []);

    // Extract unique types, sort them alphabetically, and put "All" first
    const publicationTypes = useMemo(() => {
        const types = publications.map(p => p.type);
        const uniqueSortedTypes = [...new Set(types)].sort((a, b) => a.localeCompare(b));
        return ["All", ...uniqueSortedTypes];
    }, []);

    const handleSelectFilter = (filter) => {
        setSelectedType("All"); // Reset type filter when tag/keyword is clicked
        setActiveFilter(filter);
    };

    const clearFilters = () => {
        setActiveFilter(null);
        setSelectedType("All");
    };

    const filteredPublications = useMemo(() => {
        let filtered = publications;

        // Apply type filter if active
        if (selectedType !== "All") {
            filtered = filtered.filter(publication => publication.type === selectedType);
        }

        // Apply visual topic filter if active
        if (activeFilter) {
            if (activeFilter.type === "tag") {
                filtered = filtered.filter(publication => 
                    publication.tags && publication.tags.some(tag => 
                        activeFilter.value.includes(tag) || 
                        activeFilter.value.some(v => tag.toLowerCase().includes(v.toLowerCase()))
                    )
                );
            } else if (activeFilter.type === "keyword") {
                const kw = activeFilter.value.toLowerCase();
                filtered = filtered.filter(publication => {
                    const title = (publication.title || '').toLowerCase();
                    const description = (publication.description || '').toLowerCase();
                    const tags = (publication.tags || []).join(' ').toLowerCase();
                    return title.includes(kw) || description.includes(kw) || tags.includes(kw);
                });
            }
        }

        // Apply query search if active
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
    }, [searchQuery, selectedType, activeFilter]);

    return (
        <div className="publications-container">
            {/* Title section */}
            <Row className="align-items-center mb-4">
                <Col>
                    <h1 className="mb-0" id="publications">
                        Publications
                    </h1>
                </Col>
                
                {/* View Mode Switcher */}
                {!hideGraph && (
                    <Col xs="auto" className="d-flex gap-2">
                        <Button
                            variant={viewMode === "graph" ? "secondary" : "outline-secondary"}
                            size="sm"
                            onClick={() => setViewMode("graph")}
                            className="viz-nav-btn"
                        >
                            Topic Graph
                        </Button>
                        <Button
                            variant={viewMode === "compact" ? "secondary" : "outline-secondary"}
                            size="sm"
                            onClick={() => setViewMode("compact")}
                            className="viz-nav-btn"
                        >
                            Standard Feed
                        </Button>
                    </Col>
                )}
            </Row>

            {/* Interactive Panel wrapper */}
            {viewMode === "graph" && (
                <div className="mb-4 viz-card border rounded p-3 shadow-sm">
                    <ResearchGraph activeFilter={activeFilter} onSelectFilter={handleSelectFilter} />
                </div>
            )}

            {/* Active filters display & Standard type buttons */}
            <Row className="align-items-center mb-4">
                <Col>
                    {activeFilter ? (
                        <div className="d-flex align-items-center gap-2">
                            <Badge 
                                bg="secondary" 
                                className="active-filter-badge"
                                onClick={clearFilters}
                            >
                                Active Filter: <strong>{activeFilter.name}</strong> 
                                <i className="bi bi-x-circle ms-2"></i> (Clear)
                            </Badge>
                        </div>
                    ) : (
                        viewMode === "compact" && (
                            <div className="d-flex flex-wrap gap-2">
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
                            </div>
                        )
                    )}
                </Col>
            </Row>

            {/* Main Publications Feed */}
            {filteredPublications.length === 0 ? (
                <div className="text-center text-muted mt-5">
                    <p>No publications found {searchQuery ? `matching "${searchQuery}"` : ''}.</p>
                    <Button variant="outline-secondary" size="sm" onClick={clearFilters} className="mt-2">
                        Clear All Filters
                    </Button>
                </div>
            ) : (
                filteredPublications.map((publication, index) => (
                    <PublicationTile key={`${publication.title}-${index}`} publication={publication} name={name} />
                ))
            )}

            {/* Slide-in notification toast */}
            <div className={`copied-alert ${showToast ? 'show' : ''}`}>
                ✨ Citation copied to clipboard!
            </div>
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