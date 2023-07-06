export function generateMLACitation(data) {
  let authorList;
  if (data.authors.length > 2) {
    authorList = `${formatAuthorName(data.authors[0])}, et al.`;
  } else {
    const formattedAuthors = data.authors.map((author, index) => {
      if (index === 0) {
        return formatAuthorName(author);
      } else {
        return author;
      }
    });
    authorList = formattedAuthors.join(', ');
  }

  const conference = data.conference || data.link.match(/https:\/\/([^/]+)/)[1];

  const citation = `${authorList}. "${data.title}." ${conference}, ${data.link}.`;

  return citation;
}

export function generateChicagoCitation(data) {
  function formatAuthors(authors) {
    if (authors.length === 1) {
      return formatAuthorName(authors[0]);
    } else {
      const lastAuthor = authors.pop();
      let formattedAuthors = authors.map((author, index) => {
        if (index === 0) {
          return formatAuthorName(author);
        } else {
          return author;
        }
      }).join(", ");
      return `${formattedAuthors}, and ${lastAuthor}`;
    }
  }

  function formatDate(date) {
    // If the date is not provided, return "n.d." (no date).
    return date ? date : "n.d.";
  }

  let authorsCopy = [...data.authors];
  const formattedAuthors = formatAuthors(authorsCopy);
  const formattedDate = formatDate(data.date);
  return `${formattedAuthors}. “${data.title}.” ${data.conference}, ${formattedDate}, ${data.link}.`;
}

export function generateIEEECitation(data) {
  function formatAuthorName(author) {
    const nameParts = author.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}. ${nameParts[nameParts.length - 1]}`;
    }
    return author;
  }

  function formatAuthors(authors) {
    if (authors.length === 1) {
      return authors[0];
    } else {
      const lastAuthor = authors.pop();
      const formattedAuthors = authors.join(", ");
      return `${formattedAuthors}, and ${lastAuthor}`;
    }
  }

  let authorsCopy = [...data.authors];
  // Format the authors' names with initials
  const formattedAuthors = formatAuthors(authorsCopy.map(formatAuthorName));

  // Extracting the center portion of the URL
  const conference = data.conference || (data.link && data.link.match(/https:\/\/([^\/]+)\./)?.[1]);

  // Format the citation
  const citation = `[1] ${formattedAuthors}, "${data.title}," ${conference}. Available: ${data.link}`;
  return citation;
}

function formatAuthorName(author) {
  const nameParts = author.split(' ');
  if (nameParts.length > 1) {
    return `${nameParts[nameParts.length - 1]}, ${nameParts.slice(0, nameParts.length - 1).join(' ')}`;
  }
  return author;
}