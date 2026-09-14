// BibTeX for a publication entry: its own `bibtex` field when present, otherwise a generated entry.

function formatAuthorName(author) {
  const nameParts = author.split(' ');
  if (nameParts.length > 1) {
    return `${nameParts[nameParts.length - 1]}, ${nameParts.slice(0, nameParts.length - 1).join(' ')}`;
  }
  return author;
}

export function generateBibtexCitation(data) {
  if (data.bibtex) {
    return data.bibtex.replace(/\\n/g, '\n');
  }
  const authors = (data.authors || []).map(formatAuthorName).join(' and ');
  const url = data.link || Object.values(data.links || {})[0] || '';
  const year = (String(data.date || '').match(/\d{4}/) || [''])[0];
  const key = (data.title || 'untitled').replace(/\W/g, '');
  const fields = [
    `  author = {${authors}}`,
    `  title = {${data.title || ''}}`,
    data.conference && `  booktitle = {${data.conference}}`,
    year && `  year = {${year}}`,
    url && `  url = {${url}}`,
  ].filter(Boolean);
  return `@inproceedings{${key},\n${fields.join(',\n')}\n}`;
}
