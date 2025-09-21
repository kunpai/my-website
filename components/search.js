import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button, ListGroup } from 'react-bootstrap';
import { useRouter } from 'next/router';
import publications from '/public/jsons/publications.json';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchInputRef = React.useRef(null);
  const dropdownRef = React.useRef(null);
  const searchContainerRef = React.useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch blogs on component mount
  useEffect(() => {
    setLoading(true);
    // Temporarily disable blog fetching to fix errors
    // fetch('/api/getBlogNames', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ query: '' })
    // })
    //   .then(res => res.json())
    //   .then(data => {
    //     // data is an array of blog objects with name, title, etc.
    //     const blogPromises = data.map(blog =>
    //       fetch('/api/getBlogContent', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ blogName: blog.name })
    //       }).then(res => res.json())
    //       .then(content => ({
    //         name: blog.name,
    //         metadata: blog,
    //         content: content
    //       }))
    //     );

    //     Promise.all(blogPromises).then(blogContents => {
    //       setBlogs(blogContents);
    //       setLoading(false);
    //     });
    //   })
    //   .catch(err => {
    //     console.error('Error fetching blogs:', err);
    //     setLoading(false);
    //   });
    setBlogs([]); // Empty array for now
    setLoading(false);
  }, []);

  // Animate search bar on scroll
  useEffect(() => {
    if (searchContainerRef.current) {
      gsap.from(searchContainerRef.current, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'ease',
        scrollTrigger: {
          trigger: searchContainerRef.current,
          start: 'top 80%',
        },
      });
    }
  }, []);

  // Index content for search
  const searchIndex = React.useMemo(() => {
    const index = [];

    // Index publications
    publications.forEach((pub, idx) => {
      index.push({
        id: `pub-${idx}`,
        type: 'publication',
        title: pub.title,
        content: pub.description || '',
        authors: pub.authors?.join(' ') || '',
        conference: pub.conference || '',
        tags: pub.tags?.join(' ') || '',
        url: '/publications',
        data: pub
      });
    });

        // Index blogs
    blogs.forEach((blog, idx) => {
      if (blog.content) {
        const metadata = blog.metadata || {};
        index.push({
          id: `blog-${idx}`,
          type: 'blog',
          title: metadata.title || blog.name,
          content: blog.content.content || '',
          authors: metadata.authors?.join(' ') || '',
          conference: metadata.conference || '',
          tags: metadata.tags?.join(' ') || '',
          url: `/blogs/${blog.name}`,
          data: blog
        });
      }
    });

    return index;
  }, [blogs]);

  const performSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/).filter(word => word.length > 0);

    const filtered = searchIndex.filter(item => {
      const title = (item.title || '').toLowerCase();
      const content = (item.content || '').toLowerCase();
      const authors = (item.authors || '').toLowerCase();
      const conference = (item.conference || '').toLowerCase();
      const tags = (item.tags || '').toLowerCase();

      // Check if any query word matches in any field
      return queryWords.some(word =>
        title.includes(word) ||
        content.includes(word) ||
        authors.includes(word) ||
        conference.includes(word) ||
        tags.includes(word)
      );
    });

    // Sort by relevance (title matches first, then content, etc.)
    filtered.sort((a, b) => {
      const aTitle = (a.title || '').toLowerCase();
      const bTitle = (b.title || '').toLowerCase();
      const aContent = (a.content || '').toLowerCase();
      const bContent = (b.content || '').toLowerCase();

      // Exact title matches first
      if (aTitle.includes(query) && !bTitle.includes(query)) return -1;
      if (!aTitle.includes(query) && bTitle.includes(query)) return 1;

      // Then content matches
      if (aContent.includes(query) && !bContent.includes(query)) return -1;
      if (!aContent.includes(query) && bContent.includes(query)) return 1;

      return 0;
    });

    setResults(filtered.slice(0, 8)); // Limit to 8 results
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to publications page with search query
      router.push(`/publications?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
      setQuery('');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Only show dropdown if we have a query and it's not just whitespace
    if (value.trim().length > 0) {
      performSearch(value);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleInputFocus = () => {
    if (query.trim().length > 0) {
      setShowDropdown(true);
    }
  };

  const handleResultClick = (result) => {
    setShowDropdown(false);
    setQuery('');
    router.push(result.url);
  };

  const handleViewAllResults = (searchQuery) => {
    setShowDropdown(false);
    setQuery('');
    router.push(`/publications?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <div ref={searchContainerRef}>
        <Form onSubmit={handleSearch} className="d-flex me-2">
          <InputGroup>
            <Form.Control
              ref={searchInputRef}
              type="search"
              placeholder={loading ? "Loading..." : "Search publications... (Ctrl+K)"}
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              disabled={loading}
              style={{ minWidth: '250px' }}
            />
            <Button type="submit" variant="outline-secondary" disabled={loading}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </Button>
          </InputGroup>
        </Form>
      </div>

      {showDropdown && (
        <div
          className="position-absolute bg-white border rounded shadow-sm"
          style={{
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1050,
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {results.length > 0 ? (
            <ListGroup variant="flush" className="mb-0">
              {results.map((result, idx) => (
                <ListGroup.Item
                  key={idx}
                  action
                  onClick={() => handleResultClick(result)}
                  className="d-flex justify-content-between align-items-start border-0 px-3 py-2"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold text-truncate" style={{ maxWidth: '300px' }}>
                      {result.title}
                    </div>
                    <small className="text-muted">
                      {result.type === 'publication' ? '📄 Publication' : '📝 Blog'}
                      {result.authors && ` • ${result.authors.split(' ').slice(0, 2).join(' ')}`}
                      {result.conference && ` • ${result.conference}`}
                    </small>
                  </div>
                </ListGroup.Item>
              ))}
              <ListGroup.Item
                action
                onClick={() => handleViewAllResults(query)}
                className="d-flex justify-content-center border-0 px-3 py-2 text-primary"
                style={{ cursor: 'pointer' }}
              >
                <small>View all matching publications →</small>
              </ListGroup.Item>
            </ListGroup>
          ) : query ? (
            <div className="p-3 text-muted">
              No results found for &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
