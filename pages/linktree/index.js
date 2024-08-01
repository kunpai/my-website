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
                        <h1 className="mb-3" id="linktree">
                            {currentLinks && currentLinks.title}
                        </h1>
                        {currentLinks && <LinkTree links={currentLinks.links} />}
                    </div>
                </Row>
            </Container>
        </>
    );
}

