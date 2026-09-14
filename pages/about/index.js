import Seo from '@/components/seo';
import config, { featureGate } from '@/lib/content';
import defaultAbout from './about.md';
import { Container } from "react-bootstrap";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import remarkFrontmatter from 'remark-frontmatter';
import fs from 'fs';
import { ABOUT_PATH } from '@/lib/content-paths';

export const getStaticProps = featureGate('about', async () => {
    let content = defaultAbout;
    try {
        if (fs.existsSync(ABOUT_PATH)) {
            content = fs.readFileSync(ABOUT_PATH, 'utf8');
        }
    } catch (e) {
        // Fallback to defaultAbout
    }
    return {
        props: {
            content
        }
    };
});

export default function About({ content }) {
    return (
        <Container className='about'>
            <Seo title="About" path="/about" description={`About ${config.name}: background, education, and research interests.`} />
            <ReactMarkdown
                className='markdown-body mt-3'
                rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }], rehypeRaw, rehypeSlug]}
                remarkPlugins={[remarkGfm, remarkToc, remarkFrontmatter]}
            >
                {content || defaultAbout}
            </ReactMarkdown>
        </Container>
    )
}