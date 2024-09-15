import React, { useRef, useEffect } from 'react';
import { Container, Row, ListGroup } from 'react-bootstrap';
import { LinkTree } from '@/components/linktree';
import { useRouter } from 'next/router';
import linktree from '@/public/jsons/linktree.json';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function LinkTreePage() {
    const router = useRouter();
    const { path } = router.query;

    const links = linktree;
    const currentLinks = links.find(linkGroup => linkGroup.path === path);

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

    // 404 logic: If the currentLinks is not found, redirect to a 404 page
    useEffect(() => {
        if (!currentLinks && path !== 'archived-conferences') {
            router.replace('/404');
        }
    }, [currentLinks, path]);

    // if path is "archived-conferences", then currentLinks should be set to a list of all the conferences of the JSON objects in linktree.json and link each conference to the corresponding linktree
    if (path === 'archived-conferences') {
        // Collect all the conference links
        const conferences = links.map(linkGroup => ({
            ...linkGroup,
            links: linkGroup.links.filter(link => link.conference),
            url: `/linktree/${linkGroup.path}`,
        }));

        console.log(conferences);

        return (
            <Container>
                <Row>
                    <div className="mt-5" ref={ref}>
                        <h1 className="mb-3" id="linktree" style={{ textAlign: 'center' }}>
                            Archived Conferences
                        </h1>
                        <h2 style={{
                            textAlign: 'center',
                            fontStyle: 'italic',
                            marginBottom: '15px'
                        }}>
                            Click on a conference to view its LinkTree
                        </h2>
                        <ListGroup>
                            {conferences.map((conference, index) => (
                                <ListGroup.Item key={index} action href={`/linktree/${conference.path}`}>
                                    {conference.conference}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                </Row>
            </Container>
        );
    }

    return (
        <>
            <Container>
                <Row>
                    <div className="mt-5" ref={ref}>
                        <h1 className="mb-3" id="linktree" style={{ textAlign: 'center' }}>
                            {currentLinks && currentLinks.title}
                        </h1>
                        <h2 style={{
                            textAlign: 'center',
                            fontStyle: 'italic',
                            marginBottom: '15px'
                        }}>
                            {currentLinks && currentLinks.authors && currentLinks.authors.join(', ')}
                        </h2>
                        <h3
                            style={{
                                textAlign: 'center',
                                fontWeight: '400',
                                fontSize: '1.1rem',
                                marginBottom: '30px',
                                borderBottom: '2px solid #e0e0e0',
                                paddingBottom: '10px'
                            }}>
                            {currentLinks && currentLinks.conference}
                        </h3>
                        {currentLinks && <LinkTree links={currentLinks.links} />}
                    </div>
                </Row>
            </Container>
        </>
    );
}
