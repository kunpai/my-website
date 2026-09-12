import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import remarkSlug from "remark-slug";
import remarkFrontmatter from 'remark-frontmatter';
import Head from 'next/head';
import Metadata from '@/components/metadata'
import Seo, { SITE_URL, DEFAULT_IMAGE } from '@/components/seo'
import { Container } from 'react-bootstrap'

export async function getStaticPaths() {
    const { readAllBlogs } = await import('@/lib/blogs');
    return {
        paths: readAllBlogs().map((b) => ({ params: { name: b.name } })),
        fallback: false,
    };
}

export async function getStaticProps({ params }) {
    const { readBlog } = await import('@/lib/blogs');
    const blog = readBlog(params.name);
    return { props: { blog } };
}

export default function Page({ blog }) {
    const { content, ...metadata } = blog;
    const url = `${SITE_URL}/blogs/${blog.name}`;
    const blogImage = blog.image
        ? (blog.image.startsWith('http') ? blog.image : `${SITE_URL}${blog.image.startsWith('/') ? blog.image : `/${blog.image}`}`)
        : DEFAULT_IMAGE;
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": blog.title,
        "description": blog.description,
        "url": url,
        "mainEntityOfPage": url,
        "datePublished": blog.isoDate ?? undefined,
        "image": blogImage,
        "keywords": (blog.tags ?? []).join(', '),
        "author": (blog.authors ?? []).map((name) => ({ "@type": "Person", "name": name })),
        "publisher": { "@type": "Person", "name": "Kunal Pai", "url": SITE_URL },
    };

    return (
        <div className="container">
            <Seo
                title={blog.title}
                description={blog.description}
                path={`/blogs/${blog.name}`}
                image={blog.image}
                type="article"
                publishedTime={blog.isoDate ?? undefined}
                authors={blog.authors}
                tags={blog.tags}
            />
            <Head>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            </Head>
            <div className='mt-5 mb-5'>
                <Metadata metadata={metadata} />
            </div>
            <Container style={{ width: '85%' }}>
                <ReactMarkdown
                    className="markdown-body"
                    remarkPlugins={[remarkGfm, remarkToc, remarkFrontmatter, remarkSlug]}
                    rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }], rehypeSlug, rehypeRaw]}
                >
                    {content}
                </ReactMarkdown>
            </Container>
        </div>
    )
}
