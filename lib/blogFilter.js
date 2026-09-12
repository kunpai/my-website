// Pure (no fs) blog search used client-side on the statically rendered list.
export function damerauLevenshteinDistance(a, b) {
    if (a.length == 0) return b.length;
    if (b.length == 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                if (i > 1 && j > 1 && b.charAt(i - 1) == a.charAt(j - 2) && b.charAt(i - 2) == a.charAt(j - 1)) {
                    matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
                }
            }
        }
    }
    return matrix[b.length][a.length];
}

export function filterBlogs(blogs, query) {
    const q = (query ?? '').trim().toLowerCase();
    if (q === '') return blogs;
    const keywords = q.split(/\s+/).filter(Boolean);
    return blogs.filter((blog) => {
        const tags = blog.tags ?? [];
        const authors = blog.authors ?? [];
        if (tags.some((t) => t.toLowerCase().includes(q))) return true;
        if (authors.some((a) => a.toLowerCase().includes(q))) return true;
        const authorNames = [].concat(...authors.map((a) => a.toLowerCase().split(/\s+/).filter(Boolean)));
        if (authorNames.length) {
            const d = Math.min(...keywords.map((k) => Math.min(...authorNames.map((n) => damerauLevenshteinDistance(k, n)))));
            if (d < 2) return true;
        }
        const title = (blog.title ?? '').toLowerCase();
        if (title.includes(q)) return true;
        const words = title.split(/\s+/).filter(Boolean);
        const longKeywords = keywords.filter((k) => k.length >= 4);
        if (longKeywords.length > 0) {
            const d = Math.min(...longKeywords.map((k) => Math.min(...words.map((w) => damerauLevenshteinDistance(k, w)))));
            if (d < 3) return true;
        }
        return false;
    });
}
