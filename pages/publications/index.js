import Seo from '@/components/seo';
import config from '@/lib/content';
import Publication from "@/components/publication";
import { Container, Row } from "react-bootstrap";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function PublicationPage(){
    const router = useRouter();
    const { q } = router.query;
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (q) {
            setSearchQuery(q);
        }
    }, [q]);

    return(
        <>
        <Container>
        <Seo title="Publications" path="/publications" description={`Peer-reviewed papers, preprints, and research publications by ${config.name}, with BibTeX and links.`} />
        <Row>
            <div className="mt-5">
            {searchQuery && (
                <div className="mb-3">
                    <small className="text-muted">Filtered by: &quot;{searchQuery}&quot;</small>
                </div>
            )}
            <Publication searchQuery={searchQuery} />
            </div>
        </Row>
      </Container>
        </>
    )
}