import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container, Form, Button } from 'react-bootstrap';
import BlogTile from '@/components/blogTile';
import Image from 'next/image';
import searchImage from '@/public/images/search.png'
import { useRouter } from "next/router";

export default function Blogs() {
    const [blogs, setBlogs] = useState([]);
    const router = useRouter();
    const [query, setQuery] = useState('');

    useEffect(() => {
        // get query from url ?query=
        const query = router.query.query;
        setQuery(query);
    }, [router.query.query]);

    useEffect(() => {
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
                setBlogs(data);
            });
    }, [query]);

    function handleSubmit(e) {
        e.preventDefault();
        const data = new FormData(e.target);
        const search = data.get('search');
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
                <Form.Control type="search" name="search" placeholder="Search Blogs" className="main-text-regular" />
                <div id="search-icon" className="d-flex align-items-center justify-content-center" onClick={() => document.getElementById("submit").click()}>
                    <Image
                        src={searchImage}
                        alt="Search Icon"
                        height="20"
                        type="submit"
                    />
                </div>
                <Button type="submit" style={{ display: "none" }} id="submit" role="button" >
                    Search
                </Button>
            </Form>
            <hr />
            {
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