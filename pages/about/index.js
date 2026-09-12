import Seo from '@/components/seo';
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
            <Seo title="About" path="/about" description="About Kunal Pai: background, education at UC Davis and UCLA, and research interests in LLMs for software engineering and computer architecture." />
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