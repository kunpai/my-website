import { Row, Col, Button, Badge, Popover, OverlayTrigger } from "react-bootstrap";
import publicationsRaw from "/public/jsons/publications.json";
const publications = publicationsRaw.filter(p => p.show_on_website !== false);
import { generateMLACitation, generateChicagoCitation, generateIEEECitation, generateBibtexCitation } from "@/pages/api/citation";
import CopyIcon from "./copyIcon";
import { useRef, useEffect, useMemo, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Micro-icons for modernized publication action pill buttons
const CiteQuoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="me-1" viewBox="0 0 16 16" style={{ transform: 'rotate(180deg)' }}>
        <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z" />
    </svg>
);

const ExternalArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" className="ms-1 external-arrow opacity-75" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0v-6z" />
    </svg>
);

const getLinkMeta = (key, url = '') => {
    const lowerKey = key.toLowerCase();
    const lowerUrl = url.toLowerCase();

    // 1. Pre-print / arXiv
    if (lowerKey.includes('pre-print') || lowerKey.includes('preprint') || lowerUrl.includes('arxiv.org')) {
        return {
            label: lowerUrl.includes('arxiv.org') ? 'arXiv' : 'Preprint',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                    <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v3.5a.5.5 0 0 0 .5.5H13.5L9.5 1zM3 2a1 1 0 0 1 1-1h5v3.5A1.5 1.5 0 0 0 10.5 6H14v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2z"/>
                </svg>
            )
        };
    }

    // 2. Publication / Paper / PDF
    if (lowerKey.includes('publication') || lowerKey.includes('paper') || lowerUrl.endsWith('.pdf')) {
        return {
            label: 'Paper',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                    <path d="M4.5 9a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
                </svg>
            )
        };
    }

    // 3. Source / Code / GitHub
    if (lowerKey.includes('source') || lowerKey.includes('code') || lowerUrl.includes('github.com')) {
        return {
            label: 'Code',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
            )
        };
    }

    // 4. Artifact / Zenodo / Data
    if (lowerKey.includes('artifact') || lowerKey.includes('data') || lowerUrl.includes('zenodo.org')) {
        return {
            label: 'Artifact',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l6.29 2.516a.5.5 0 0 1 .303.46v9.68a.5.5 0 0 1-.303.46l-6.5 2.6a1.5 1.5 0 0 1-1.114 0l-6.5-2.6A.5.5 0 0 1 .5 12.84V3.16a.5.5 0 0 1 .303-.46L7.443.184z"/>
                </svg>
            )
        };
    }

    // 5. Slides / Presentation
    if (lowerKey.includes('slide') || lowerKey.includes('presentation')) {
        return {
            label: 'Slides',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8.5v1.5H10a.5.5 0 0 1 0 1H6a.5.5 0 0 1 0-1h1.5V12H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2z"/>
                </svg>
            )
        };
    }

    // 6. Poster
    if (lowerKey.includes('poster')) {
        return {
            label: 'Poster',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                    <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                </svg>
            )
        };
    }

    // 7. Talk / Video
    if (lowerKey.includes('talk') || lowerKey.includes('video')) {
        return {
            label: 'Talk',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
                </svg>
            )
        };
    }

    // 8. Project / Website
    if (lowerKey.includes('project') || lowerKey.includes('website')) {
        return {
            label: 'Project',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.67A6.958 6.958 0 0 0 1 8c0 .338.026.67.076 1h2.234c-.174-.782-.282-1.623-.312-2.5zm.312 3.5c-.174-.782-.282-1.623-.312-2.5H1.67c.338 1.547 1.144 2.876 2.24 3.755-.306-.35-.558-.75-.75-1.255zm1.53 2.845a7.97 7.97 0 0 0 1.068 1.078V12H5.613a7.97 7.97 0 0 0-.263.923zm2.15 1.078c.67-.204 1.335-.82 1.887-1.855.143-.268.27-.557.382-.868H8.5v2.723zm2.5-3.923H8.5V9h2.97a9.42 9.42 0 0 0 .03-1c0-.342-.01-.676-.03-1H8.5V4h2.5c.24.717.388 1.554.43 2.5h2.395A6.96 6.96 0 0 0 15 8c0 .338-.026.67-.076 1h-2.395c-.042.946-.19 1.783-.43 2.5z"/>
                </svg>
            )
        };
    }

    // Default fallback
    const cleanedLabel = key.replace(/^view\s+/i, '').trim() || key;
    return {
        label: cleanedLabel,
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337l-1.829 1.828a2 2 0 1 1-2.828-2.828l1.372-1.371a2 2 0 0 1 1.056-.56V6.542z"/>
                <path d="M6.542 4.715 7.914 3.343a3 3 0 0 1 4.243 4.243l-1.829 1.828A3 3 0 0 1 9.414 8.5l.586-.586a1.002 1.002 0 0 0 .154-.199 2 2 0 0 1-.861-3.337l1.829-1.828a2 2 0 1 1 2.828 2.828l-1.372 1.371a2 2 0 0 1-1.056.56V4.715z"/>
            </svg>
        )
    };
};

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

const PREFERRED_TYPE_ORDER = ["All", "conference", "workshop", "preprint", "poster"];

const TYPE_LABELS = {
    "All": "All",
    "conference": "Papers",
    "workshop": "Workshops",
    "preprint": "Preprints",
    "poster": "Posters",
};

const TYPE_TO_HASH = {
    "All": "all",
    "conference": "papers",
    "workshop": "workshops",
    "preprint": "preprints",
    "poster": "posters",
};

const HASH_TO_TYPE = {
    "all": "All",
    "papers": "conference",
    "paper": "conference",
    "conference": "conference",
    "conferences": "conference",
    "workshops": "workshop",
    "workshop": "workshop",
    "preprints": "preprint",
    "preprint": "preprint",
    "posters": "poster",
    "poster": "poster",
};

const getTypeLabel = (type) => {
    if (TYPE_LABELS[type]) return TYPE_LABELS[type];
    return type.charAt(0).toUpperCase() + type.slice(1);
};

const getTypeHash = (type) => {
    if (TYPE_TO_HASH[type]) return TYPE_TO_HASH[type];
    return type.toLowerCase().replace(/\s+/g, '-');
};

// Main Publication Component
export default function Publication({ searchQuery, hideGraph = false, defaultType = "All" }) {
    const name = process.env.CONFIG?.name || "Kunal Pai";

    const [selectedType, setSelectedType] = useState(defaultType);
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

    // Extract unique types, sort them by preferred order, and put "All" first
    const publicationTypes = useMemo(() => {
        const types = [...new Set(publications.map(p => p.type))];
        types.sort((a, b) => {
            const idxA = PREFERRED_TYPE_ORDER.indexOf(a);
            const idxB = PREFERRED_TYPE_ORDER.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });
        return ["All", ...types];
    }, []);

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setActiveFilter(null);
        if (typeof window !== 'undefined') {
            const hash = getTypeHash(type);
            if (window.location.hash !== `#${hash}`) {
                window.history.pushState(null, '', `#${hash}`);
            }
        }
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        if (typeof window !== 'undefined') {
            if (mode === "graph") {
                if (window.location.hash !== '#graph') {
                    window.history.pushState(null, '', '#graph');
                }
            } else {
                const hash = getTypeHash(selectedType);
                if (window.location.hash !== `#${hash}`) {
                    window.history.pushState(null, '', `#${hash}`);
                }
            }
        }
    };

    const handleSelectFilter = (filter) => {
        setSelectedType("All"); // Reset type filter when tag/keyword is clicked
        setActiveFilter(filter);
    };

    const clearFilters = () => {
        setActiveFilter(null);
        setSelectedType("All");
        if (typeof window !== 'undefined') {
            if (window.location.hash !== '#all') {
                window.history.pushState(null, '', '#all');
            }
        }
    };

    // Synchronize selectedType with URL hash (#all, #workshops, #papers, etc.)
    useEffect(() => {
        const onHashChange = () => {
            if (typeof window === 'undefined') return;
            const rawHash = window.location.hash ? window.location.hash.replace(/^#/, '').toLowerCase() : '';
            if (rawHash === 'graph') {
                if (!hideGraph) {
                    setViewMode('graph');
                }
                return;
            }

            if (rawHash && HASH_TO_TYPE[rawHash]) {
                const matchedType = HASH_TO_TYPE[rawHash];
                setSelectedType(matchedType);
                setActiveFilter(null);
                if (!hideGraph) {
                    setViewMode('compact');
                }
            } else if (!rawHash) {
                setSelectedType(defaultType);
                setActiveFilter(null);
                if (!hideGraph) {
                    setViewMode('graph');
                }
            }
        };

        // Check on initial load if hash is present
        if (typeof window !== 'undefined' && window.location.hash) {
            const rawHash = window.location.hash.replace(/^#/, '').toLowerCase();
            if (rawHash === 'graph') {
                if (!hideGraph) setViewMode('graph');
            } else if (HASH_TO_TYPE[rawHash]) {
                setSelectedType(HASH_TO_TYPE[rawHash]);
                setActiveFilter(null);
                if (!hideGraph) setViewMode('compact');
                setTimeout(() => {
                    const pubElement = document.getElementById('publications');
                    if (pubElement) {
                        pubElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 250);
            }
        }

        window.addEventListener('hashchange', onHashChange);
        window.addEventListener('popstate', onHashChange);

        return () => {
            window.removeEventListener('hashchange', onHashChange);
            window.removeEventListener('popstate', onHashChange);
        };
    }, [defaultType, hideGraph]);

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

    useEffect(() => {
        // Refresh ScrollTrigger when filteredPublications changes (e.g. on switching tabs)
        // to ensure any scroll-triggered elements below recalculate their positions.
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);
        return () => clearTimeout(timer);
    }, [filteredPublications]);

    return (
        <div className="publications-container">
            {/* Hidden anchor targets for native deep linking */}
            <div id="all" className="pub-hash-anchor" />
            <div id="papers" className="pub-hash-anchor" />
            <div id="conference" className="pub-hash-anchor" />
            <div id="conferences" className="pub-hash-anchor" />
            <div id="workshops" className="pub-hash-anchor" />
            <div id="workshop" className="pub-hash-anchor" />
            <div id="preprints" className="pub-hash-anchor" />
            <div id="preprint" className="pub-hash-anchor" />
            <div id="posters" className="pub-hash-anchor" />
            <div id="poster" className="pub-hash-anchor" />

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
                            onClick={() => handleViewModeChange("graph")}
                            className="viz-nav-btn"
                        >
                            Topic Graph
                        </Button>
                        <Button
                            variant={viewMode === "compact" ? "secondary" : "outline-secondary"}
                            size="sm"
                            onClick={() => handleViewModeChange("compact")}
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
                                style={{ cursor: "pointer" }}
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
                                        onClick={() => handleTypeSelect(type)}
                                        style={{ 
                                            borderRadius: "20px",
                                            padding: "0.25rem 1rem"
                                        }}
                                    >
                                        {getTypeLabel(type)}
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
        const anim = gsap.from(ref.current, {
            y: 24,
            opacity: 0,
            duration: 0.8,
            ease: 'ease',
            scrollTrigger: {
                trigger: ref.current,
                start: 'top 80%',
            },
        });
        return () => {
            if (anim.scrollTrigger) {
                anim.scrollTrigger.kill();
            }
            anim.kill();
        };
    }, []);

    return (
        <Row className="mb-3 p-2 experience" ref={ref}>
            <Col>
                <Row>
                    <Col>
                        <h5>{publication.title}</h5>
                    </Col>
                    <Col className="d-flex justify-content-end align-items-start gap-2">
                        {(publication.badge || publication.spotlight) && (
                            <h5>
                                <Badge className="spotlight-badge">
                                    {publication.badge || (typeof publication.spotlight === "string" ? publication.spotlight : "Spotlight")}
                                </Badge>
                            </h5>
                        )}
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
                <div className="mt-3 pub-footer-row">
                    <div className="pub-tags-group">
                        {
                            publication.tags ? publication.tags.map((tag, index) => {
                                return (
                                    <Badge bg="secondary" className="pub-tag-badge" key={index}>
                                        {tag}
                                    </Badge>
                                )
                            }) : null
                        }
                    </div>
                    <div className="pub-actions-group">
                        <OverlayTrigger
                            rootClose
                            trigger="click"
                            placement="bottom"
                            overlay={popover(publication)}
                        >
                            <Button variant="outline-secondary" size="sm" className="pub-action-btn d-inline-flex align-items-center">
                                <CiteQuoteIcon />
                                <span>Cite</span>
                            </Button>
                        </OverlayTrigger>

                        {publication.links && Object.keys(publication.links).map((key, index) => {
                            const meta = getLinkMeta(key, publication.links[key]);
                            return (
                                <Button
                                    key={index}
                                    variant="outline-secondary"
                                    size="sm"
                                    href={publication.links[key]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="pub-action-btn d-inline-flex align-items-center"
                                >
                                    {meta.icon}
                                    <span>{meta.label}</span>
                                    <ExternalArrowIcon />
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </Col>
        </Row>
    )
}