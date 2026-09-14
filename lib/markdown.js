// Shared react-markdown component overrides for Markdown that allows raw HTML (rehype-raw).

// React never attaches event handlers written as HTML strings (onclick="..."), so drop them.
export function withoutStringHandlers(props) {
    return Object.fromEntries(
        Object.entries(props).filter(([key, value]) => !(key.startsWith('on') && typeof value === 'string')),
    );
}

const HREF_IN_HANDLER = /location\.href\s*=\s*['"]([^'"]+)['"]/;

/**
 * <button onclick="location.href='…'"> is a common way to write a link button in Markdown. The
 * inline handler would never run under React, so render it as a real link with the same classes.
 */
export function MarkdownButton({ node, ...props }) {
    const href = typeof props.onClick === 'string' ? (props.onClick.match(HREF_IN_HANDLER) || [])[1] : null;
    const rest = withoutStringHandlers(props);
    return href ? <a {...rest} href={href} role="button" /> : <button {...rest} />;
}

export const markdownComponents = { button: MarkdownButton };
