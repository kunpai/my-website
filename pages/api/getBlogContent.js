import path from 'path';
import fs from 'fs';
import parseMD from 'parse-md'

export default function handler(req, res) {
    // check if post request
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }
    const blogName = req.body.name;
    // get the blog content from /public/blogs/blogName.md
    const blogContent = fs.readFileSync(path.join(process.cwd(), 'public', 'blogs', blogName + '.md'), 'utf8');
    // return the blog content
    const { metadata, content } = parseMD(blogContent)
    res.status(200).json({
        content: content,
        metadata: metadata
    });
}