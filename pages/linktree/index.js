import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { LinkTree } from '@/components/linktree';
import { useRouter } from 'next/router';
import linktree from '@/public/jsons/linktree.json';

export default function LinkTreePage() {
    const router = useRouter();
    const { path } = router.query;

    const links = linktree;
    const currentLinks = links.find(linkGroup => linkGroup.path === path);

    return (
        <>
            <Container>
                <Row>
                    <div className="mt-5">
                        <h1 className="mb-3" id="linktree" style={{ textAlign: 'center' }}>
                            {currentLinks && currentLinks.title}
                        </h1>
                        <h2 style= {{
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

