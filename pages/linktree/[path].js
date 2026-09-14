import LinkTreePage from '@/pages/linktree/index';
import linktree from '@/content/data/linktree.json';
import { features, featureGate } from '@/lib/content';

export async function getStaticPaths() {
    if (!features.linktree) return { paths: [], fallback: false };
    const paths = [...linktree.map((group) => group.path), 'archived-conferences'];
    return { paths: paths.map((path) => ({ params: { path } })), fallback: false };
}

export const getStaticProps = featureGate('linktree');

export default function DynamicLinkTreePage() {
    return <LinkTreePage />;
}
