export default function generateMLACitation({data}) {
    let authorList;
    if (data.authors.length > 2) {
      authorList = `${data.authors[0]} et al.`;
    } else {
      authorList = data.authors.join(', ');
    }
    const citation = `${authorList}. "${data.title}." ${data.conference}, ${data.link}.`;

    return citation;
}

export function generateChicagoCitation ({data}) {
    function formatAuthors (authors) {
        return authors.join(", ");
    };

    function formatDate (date) {
        // If the date is not provided, return "n.d." (no date).
        return date ? date : "n.d.";
    };

    const formattedAuthors = formatAuthors(data.authors);
    const formattedDate = formatDate(data.date);

    return `${formattedAuthors}. “${data.title}.” ${data.conference}, ${formattedDate}, ${data.link}.`;
}

function generateIEEECitation({data}) {
    function formatAuthorName(author) {
        const nameParts = author.split(' ');
        if (nameParts.length > 1) {
          return `${nameParts[0][0]}. ${nameParts[nameParts.length - 1]}`;
        }
        return author;
      }
      // Format the authors' names with initials
    const formattedAuthors = data.authors.map(formatAuthorName).join(', ');

    // Format the citation
    const citation = `[1] ${formattedAuthors} "${data.title}," ${data.conference}. Available: ${data.link}`;
    return citation;
}
