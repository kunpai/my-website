import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import BlogTile from '@/components/blogTile';
import Image from 'next/image';
import { useRouter } from "next/router";

export default function Blogs() {
    const [blogs, setBlogs] = useState([]);
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!router.isReady) return;
        // get query from url ?query=
        const query = router.query.query;
        setQuery(query);
        setSearch(query);
    }, [router.isReady]);

    useEffect(() => {
        setLoading(true);
        fetch('/api/getBlogNames', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'query': query,
            }),
        })
            .then(res => res.json()).then(data => {
                setLoading(false);
                setBlogs(data);
            });
    }, [query]);

    function handleSubmit(e) {
        e.preventDefault();
        const data = new FormData(e.target);
        const search = data.get('search');
        setQuery(search);
        setSearch(search);
        router.push({
            pathname: '/blogs',
            query: { query: search },
            shallow: true,
        });
    }
    return (
        <Container className="blogs">
            <h1 className="text-center mt-5" style={{ fontSize: '3rem' }}>
                Blogs
            </h1>
            <Form className={"search-form w-100"} onSubmit={handleSubmit}>
                <Form.Control type="search" name="search" placeholder="Search Blogs" className="main-text-regular" value={search} onChange={(e) => setSearch(e.target.value)} />
                <div id="search-icon" className="d-flex align-items-center justify-content-center" onClick={() => document.getElementById("submit").click()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                    </svg>
                </div>
                <Button type="submit" style={{ display: "none" }} id="submit" role="button" >
                    Search
                </Button>
            </Form>
            <hr />
            {
                loading ? <div className='d-flex flex-column align-items-center justify-content-center p-5'>
                    <Spinner animation="border" />
                </div> :
                    blogs.length === 0 ? <h2 className="text-center mt-5">No Blogs Found</h2> :
                        blogs.map(blog => {
                            return (
                                <>
                                    <BlogTile blog={blog} />
                                    <hr />
                                </>
                            );
                        })
            }
        </Container>
    );
}