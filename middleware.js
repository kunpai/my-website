import { NextResponse } from 'next/server';

const AI_USER_AGENTS = [
    'gptbot',
    'chatgpt-user',
    'claudebot',
    'claude-web',
    'perplexitybot',
    'bytespider',
    'ccbot',
    'cohere-ai',
    'google-extended',
    'meta-externalagent',
    'diffbot',
    'anthropic-ai',
    'searchgptbot',
    'applebot-extended',
    'llm'
];

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Exclude static assets, images, API routes, and PDF files
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/images') ||
        pathname.startsWith('/assets') ||
        pathname.startsWith('/jsons') ||
        pathname.endsWith('.pdf') ||
        pathname.endsWith('.jpeg') ||
        pathname.endsWith('.jpg') ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.svg') ||
        pathname.endsWith('.ico')
    ) {
        return NextResponse.next();
    }

    const acceptHeader = request.headers.get('accept') || '';
    const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

    const isMarkdownAccept = acceptHeader.includes('text/markdown') || acceptHeader.includes('text/x-markdown');
    const isAiBot = AI_USER_AGENTS.some(bot => userAgent.includes(bot));
    const isMdRoute = pathname.endsWith('.md') || pathname === '/llms.txt' || pathname === '/llms-full.txt';

    if (isMarkdownAccept || isAiBot || isMdRoute) {
        let targetFile = '/llms-full.txt';
        if (pathname === '/llms.txt') {
            targetFile = '/llms.txt';
        }

        const url = request.nextUrl.clone();
        url.pathname = targetFile;
        const response = NextResponse.rewrite(url);
        response.headers.set('Content-Type', 'text/markdown; charset=utf-8');
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/:path*',
    ],
};
