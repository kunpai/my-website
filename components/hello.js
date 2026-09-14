import { Col, Row } from 'react-bootstrap';
import Image from 'next/image';
import { gsap } from 'gsap';
import SplitType from 'split-type';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import config, { labels } from '@/lib/content';

export default function Hello() {
  const name = config.name || '';

  useEffect(() => {
    try {
      const heading = new SplitType('.name', { types: 'words' });
      const words = heading.words || [];
      const desc = document.querySelector('.description');
      const buttons = Array.from(document.querySelectorAll('.hello a.btn'));

      const elements = [...words, desc, ...buttons].filter(Boolean);

      if (elements.length > 0) {
        gsap.from(elements, {
          y: 20,
          opacity: 0,
          duration: 0.7,
          delay: 0.2,
          stagger: 0.06,
          ease: 'power2.out',
          // Only clear what we animate; 'all' would strip SplitType's inline-block on words.
          clearProps: 'transform,opacity',
        });
      }
    } catch (e) {
      console.warn('Hero animation bypassed:', e);
    }
  }, []);

  return (
    <Row className='mt-5 mb-5 hello'>
      <Col xs={5}>
        <div className='animate'>
          <Image src={config.image || '/images/placeholder.png'}
            alt={name}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      </Col>
      <Col className='d-flex justify-content-center flex-column ms-5'>
        <Row>
          <h1 className='name'>
            {name}
          </h1>
        </Row>
        <Row>
          <div className='description'>
            <ReactMarkdown>{config.intro || ''}</ReactMarkdown>
          </div>
        </Row>
        {(config.resume || config.resume_short) && (
          <Row className='mt-3'>
            <Col className='d-flex justify-content-start gap-4 flex-wrap'>
              {config.resume && (
                <a className='btn btn-outline-secondary' href={config.resume} target='_blank' rel='noopener noreferrer' role='button'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-down me-2" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M3.5 10a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 0 0 1h2A1.5 1.5 0 0 0 14 9.5v-8A1.5 1.5 0 0 0 12.5 0h-9A1.5 1.5 0 0 0 2 1.5v8A1.5 1.5 0 0 0 3.5 11h2a.5.5 0 0 0 0-1h-2z" />
                    <path fillRule="evenodd" d="M7.646 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V5.5a.5.5 0 0 0-1 0v8.793l-2.146-2.147a.5.5 0 0 0-.708.708l3 3z" />
                  </svg>
                  <span>{labels.resumeButton}</span>
                </a>
              )}
              {config.resume_short && (
                <a className='btn btn-outline-secondary' href={config.resume_short} target='_blank' rel='noopener noreferrer' role='button'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-down me-2" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M3.5 10a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 0 0 1h2A1.5 1.5 0 0 0 14 9.5v-8A1.5 1.5 0 0 0 12.5 0h-9A1.5 1.5 0 0 0 2 1.5v8A1.5 1.5 0 0 0 3.5 11h2a.5.5 0 0 0 0-1h-2z" />
                    <path fillRule="evenodd" d="M7.646 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V5.5a.5.5 0 0 0-1 0v8.793l-2.146-2.147a.5.5 0 0 0-.708.708l3 3z" />
                  </svg>
                  <span>{labels.resumeShortButton}</span>
                </a>
              )}
            </Col>
          </Row>
        )}
      </Col>
    </Row>
  );
}