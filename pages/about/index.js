import Seo from '@/components/seo';
import config, { featureGate } from '@/lib/content';
import { Container } from "react-bootstrap";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import remarkFrontmatter from 'remark-frontmatter';
import fs from 'fs';
import path from 'path';
import { ABOUT_PATH, ROOT_DIR } from '@/lib/content-paths';
import { markdownComponents } from '@/lib/markdown';

export const getStaticProps = featureGate('about', async () => {
    // content/about.md, or the generic page shipped in lib/ when it doesn't exist.
    const source = fs.existsSync(ABOUT_PATH) ? ABOUT_PATH : path.join(ROOT_DIR, 'lib', 'default-about.md');
    const content = fs.readFileSync(source, 'utf8');
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
                components={markdownComponents}
            >
                {content}
            </ReactMarkdown>
        </Container>
    )
}