import path from 'path';
import parseMD from 'parse-md'
import fs from 'fs';

export default function handler(req, res) {
    const query = req.body.query ?? '';
    const keywords = query.split(' ');
    let names = []
    const blogDirectory = path.resolve('./public', 'blogs');
    const blogNames = fs.readdirSync(blogDirectory);
    // remove .md from the end of the file name
    blogNames.forEach((name, index) => {
        const blogContent = fs.readFileSync(path.join(blogDirectory, name), 'utf8');
        const { metadata, content } = parseMD(blogContent);

        names.push({
            name: name.slice(0, -3),
            title: metadata.title,
            date: metadata.date,
            tags: metadata.tags,
            image: metadata.image,
            authors: metadata.authors,
            content: content
        });
    });

    names = names.filter((name, index) => {
        if (query === '') {
            return true;
        }
        for (let tag of name.tags) {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
                return true;
            }
        }
        for (let author of name.authors) {
            if (author.toLowerCase().includes(query.toLowerCase())) {
                return true;
            }
        }
        let authorDistances = keywords.map((keyword, index) => {
            // split the author name into first and last name
            let authorNames = name.authors.map((author) => author.toLowerCase().split(' '));
            // flatten the array
            authorNames = [].concat.apply([], authorNames);
            // return the minimum distance between the keyword and the author's first and last name
            return Math.min(...authorNames.map((author) => damerauLevenshteinDistance(keyword, author.toLowerCase())));
        });
        if (Math.min(...authorDistances) < 2) {
            return true;
        }
        if (name.title.toLowerCase().includes(query.toLowerCase())) {
            return true;
        }
        let titleDistances = keywords.map((keyword, index) => {
            return Math.min(...name.title.toLowerCase().split(' ').map((word) => damerauLevenshteinDistance(keyword, word)));
        });
        return Math.min(...titleDistances) < 2;
    });

    // sort by date
    names.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    res.status(200).json(names);
}

function damerauLevenshteinDistance(a, b) {
    if (a.length == 0) return b.length;
    if (b.length == 0) return a.length;
    var matrix = [];
    for (var i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (var j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j] + 1 // deletion
                );
                if (
                    i > 1 &&
                    j > 1 &&
                    b.charAt(i - 1) == a.charAt(j - 2) &&
                    b.charAt(i - 2) == a.charAt(j - 1)
                ) {
                    matrix[i][j] = Math.min(
                        matrix[i][j],
                        matrix[i - 2][j - 2] + 1 // transposition
                    );
                }
            }
        }
    }
    return matrix[b.length][a.length];
}