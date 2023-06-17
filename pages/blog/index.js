'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Blogs() {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        fetch('/api/getBlogNames').then(res => res.json()).then(data => {
            setBlogs(data);
        }
        );
    }, []);
    return (
        <div>
            <h1>Blog</h1>
            <ul>
                {blogs.map(blog => (
                    <li key={blog.name}>
                        <Link href={`/blog/${blog.name}`}>
                            {blog.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}