// Micro-icons and metadata resolver for publication and project action pill buttons

export const ExternalArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" className="ms-1 external-arrow opacity-75" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0v-6z" />
    </svg>
);

export const getLinkMeta = (key, url = '') => {
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
            label: lowerKey.includes('publication') ? 'Paper' : (key.replace(/^view\s+/i, '').trim() || 'Paper'),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                    <path d="M4.5 9a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
                </svg>
            )
        };
    }

    // 3. Source / Code / GitHub
    if (lowerKey.includes('source') || lowerKey.includes('code') || lowerKey.includes('github') || lowerUrl.includes('github.com')) {
        return {
            label: lowerKey.includes('github') ? 'GitHub' : 'Code',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
            )
        };
    }

    // 4. Live Demo / Demo / Hugging Face Spaces
    if (lowerKey.includes('demo') || lowerUrl.includes('hf.space') || lowerUrl.includes('huggingface.co')) {
        return {
            label: key.replace(/^view\s+/i, '').trim() || 'Demo',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm6.79-6.907A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z"/>
                </svg>
            )
        };
    }

    // 5. Artifact / Zenodo / Data
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

    // 6. Slides / Presentation
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

    // 7. Poster
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

    // 8. Talk / Video
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

    // 9. Blog / Article
    if (lowerKey.includes('blog') || lowerKey.includes('article')) {
        return {
            label: key.replace(/^view\s+/i, '').trim() || 'Blog Post',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                    <path d="M3 4.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                </svg>
            )
        };
    }

    // 10. Project / Website
    if (lowerKey.includes('project') || lowerKey.includes('website')) {
        return {
            label: lowerKey.includes('website') ? 'Website' : 'Project',
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
