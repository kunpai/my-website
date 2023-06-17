import path from 'path';
import parseMD from 'parse-md'
import fs from 'fs';

export default function handler(req, res) {
    let names = []
    const blogDirectory = path.resolve('./public', 'blogs');
    const blogNames = fs.readdirSync(blogDirectory);
    // remove .md from the end of the file name
    blogNames.forEach((name, index) => {
        const content = fs.readFileSync(path.join(blogDirectory, name), 'utf8');
        const { metadata } = parseMD(content);
        names.push({
            name: name.slice(0, -3),
            title: metadata.title,
            date: metadata.date,
        });
    });
    // sort by date
    names.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    console.log(names);
    res.status(200).json(names);
}