import Link from "next/link"
import { Row, Col, Containter, Badge } from "react-bootstrap"
import Image from "next/image"
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import remarkSlug from "remark-slug";
import remarkFrontmatter from 'remark-frontmatter';
import placeholder from "/public/images/placeholder.png"

export default function BlogTile({ blog }) {
    function readingTime(text) {
        const wpm = 225;
        const words = text.trim().split(/\s+/).length;
        const time = Math.ceil(words / wpm);
        return time;
    }
    return (
        <div className="blog-tile" key={blog.name}>
            <Link href={`/blogs/${blog.name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Row>
                    <Col className="w-50">
                        <Row>
                            <h6 className="main-text-title-bold">
                                {
                                    blog.authors ? blog.authors.map((author, index) => {
                                        return (
                                            <>
                                                {author}
                                                {index < blog.authors.length - 1 ? ", " : ""}
                                            </>
                                        )
                                    }) : null
                                }
                                <span style={{ fontWeight: 'normal' }}>
                                    {" • "}
                                    <DateConvert date={blog.date} />
                                </span>
                            </h6>
                        </Row>
                        <Row className="mb-3">
                            <h4 className="main-text-title-bold">
                                {blog.title}
                            </h4>
                        </Row>
                        <Row className="mb-3">
                            <div
                                className="content-text"
                                style={{
                                    height: '150px',
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkToc, remarkFrontmatter, remarkSlug]}
                                    rehypePlugins={[rehypeHighlight, { ignoreMissing: true }, rehypeSlug, rehypeRaw]}
                                >
                                    {blog.content}
                                </ReactMarkdown>
                            </div>
                        </Row>
                        <Row>
                            <p>
                                {
                                    blog.tags ? blog.tags.map((tag, index) => {
                                        return (
                                            <Badge bg="secondary" className="me-2">
                                                {tag}
                                            </Badge>
                                        )
                                    }) : null
                                }
                                {" • "}
                                {readingTime(blog.content) + " min read"}
                            </p>
                        </Row>
                    </Col>
                    <Col>
                        <Row className="justify-content-end w-100 h-100">
                            <div style={{ width: '60%', height: '100%', position: 'relative' }}>
                                <Image
                                    src={blog.image ?? placeholder}
                                    alt={blog.title}
                                    fill
                                    style={{
                                        borderRadius: '10px',
                                        objectFit: 'cover',
                                    }} />
                            </div>
                        </Row>
                    </Col>
                </Row>
            </Link>
        </div>
    )
}

function DateConvert({ date }) {
    // Create a new Date object from the given string
    const dateObj = new Date(date);

    // Define an array of month names
    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Extract day and month values from the date object
    const day = dateObj.getDate();
    const month = dateObj.getMonth();

    // Convert the date to format
    const formattedDate = `${day} ${monthNames[month]}`;

    return formattedDate;
}