import { useState, useEffect, useMemo } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';
import BlogTile from '@/components/blogTile';
import Seo from '@/components/seo';
import { filterBlogs } from '@/lib/blogFilter';

// Posts are read at build time so the list is in the HTML crawlers see
// (previously fetched client-side, which rendered "No Blogs Found" to bots).
export async function getStaticProps() {
    const { readAllBlogs } = await import('@/lib/blogs');
    const blogs = readAllBlogs().map(({ content, ...rest }) => ({
        ...rest,
        content: content.length > 1200 ? content.slice(0, 1200).replace(/\s+\S*$/, '') : content,
    }));
    return { props: { blogs } };
}

export default function Blogs({ blogs }) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!router.isReady) return;
        const q = router.query.query ?? '';
        setQuery(q);
        setSearch(q);
    }, [router.isReady, router.query.query]);

    const shown = useMemo(() => filterBlogs(blogs, query), [blogs, query]);

    function handleSubmit(e) {
        e.preventDefault();
        const data = new FormData(e.target);
        const s = data.get('search') ?? '';
        setQuery(s);
        setSearch(s);
        router.push({ pathname: '/blogs', query: s ? { query: s } : {} }, undefined, { shallow: true });
    }

    return (
        <Container className="blogs">
            <Seo
                title="Blog"
                path="/blogs"
                description="Posts by Kunal Pai on computer architecture simulation, LLMs for software engineering, and side projects."
            />
            <h1 className="text-center mt-5" style={{ fontSize: '3rem' }}>
                Blogs
            </h1>
            <Form className={"search-form w-100"} onSubmit={handleSubmit}>
                <Form.Control type="search" name="search" placeholder="Search Blogs" className="main-text-regular" value={search} onChange={(e) => setSearch(e.target.value)} />
                <div id="search-icon" className="d-flex align-items-center justify-content-center" onClick={() => document.getElementById("submit").click()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                    </svg>
                </div>
                <Button type="submit" style={{ display: "none" }} id="submit" role="button">
                    Search
                </Button>
            </Form>
            <hr />
            {
                shown.length === 0 ? <h2 className="text-center mt-5">No Blogs Found</h2> :
                    shown.map((blog) => (
                        <div key={blog.name}>
                            <BlogTile blog={blog} />
                            <hr />
                        </div>
                    ))
            }
        </Container>
    );
}
