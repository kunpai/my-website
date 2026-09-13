import Seo from '@/components/seo';
import config from '@/website.config.json';
import about from './about.md';
import { Container } from "react-bootstrap";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import remarkFrontmatter from 'remark-frontmatter';

export default function About() {
    return (
        <Container className='about'>
            <Seo title="About" path="/about" description={`About ${config.name}: background, education, and research interests.`} />
            <ReactMarkdown
                className='markdown-body mt-3'
                rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }], rehypeRaw, rehypeSlug]}
                remarkPlugins={[remarkGfm, remarkToc, remarkFrontmatter]}
            >
                {about}
            </ReactMarkdown>
        </Container>
    )
}