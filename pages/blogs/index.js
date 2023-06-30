import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container } from 'react-bootstrap';
import BlogTile from '@/components/blogTile';

export default function Blogs() {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        fetch('/api/getBlogNames').then(res => res.json()).then(data => {
            setBlogs(data);
        }
        );
    }, []);
    return (
        <Container>
            <h1 className="text-center mt-5" style={{ fontSize: '3rem' }}>
                Blogs
            </h1>
            <hr />
            {blogs.map(blog => {
                return (
                    <>
                        <BlogTile blog={blog} />
                        <hr />
                    </>
                );
            }
            )}
        </Container>
    );
}