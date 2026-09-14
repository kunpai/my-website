import Seo from '@/components/seo';
import config, { features, labels } from '@/lib/content';
import React from 'react';
import { Row, Col, Badge } from "react-bootstrap";
import Experience from "@/components/experience";
import Containter from "react-bootstrap/Container";
import Hello from '@/components/hello';
import researchExperience from "@/content/data/research-experience.json";
import workExperience from "@/content/data/work-experience.json";
import teachingExperience from "@/content/data/teaching-experience.json";
import projects from "@/content/data/projects.json";
import awards from "@/content/data/awards.json";
import Image from "next/image";
import Publication from '@/components/publication';
import Education from '@/components/education';
import Link from 'next/link';
import skills from "@/content/data/skills.json"
import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import news from "@/content/data/news.json";
import ReactMarkdown from 'react-markdown';
import linktree from "@/content/data/linktree.json";
import service from "@/content/data/service.json";
import talks from "@/content/data/talks.json";
gsap.registerPlugin(ScrollTrigger);

// Entries opt out of the homepage with "show_on_homepage": false; the full pages list everything.
const onHomepage = (entry) => entry.show_on_homepage !== false;
const workExperienceFiltered = workExperience.filter(onHomepage);
const projectsFiltered = projects.filter(onHomepage);

export default function Home() {
  const newsRef = useRef(null);
  const serviceRef = useRef(null);
  const talksRef = useRef(null);
  const workViewAllRef = useRef(null);
  const projectsViewAllRef = useRef(null);

  useEffect(() => {
    const headings = document.querySelectorAll('.content h1');
    headings.forEach((heading) => {
      gsap.from(heading, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        stagger: { amount: 1 },
        ease: 'ease',
        scrollTrigger: {
          trigger: heading,
          start: 'top 80%',
        },
      });
    });

    if (newsRef.current) {
      gsap.from(newsRef.current, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'ease',
        scrollTrigger: {
          trigger: newsRef.current,
          start: 'top 80%',
        },
      });
    }

    if (serviceRef.current) {
      gsap.from(serviceRef.current, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'ease',
        scrollTrigger: {
          trigger: serviceRef.current,
          start: 'top 80%',
        },
      });
    }

    if (talksRef.current) {
      gsap.from(talksRef.current, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'ease',
        scrollTrigger: {
          trigger: talksRef.current,
          start: 'top 80%',
        },
      });
    }

    if (workViewAllRef.current) {
      gsap.from(workViewAllRef.current, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'ease',
        scrollTrigger: {
          trigger: workViewAllRef.current,
          start: 'top 80%',
        },
      });
    }

    if (projectsViewAllRef.current) {
      gsap.from(projectsViewAllRef.current, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'ease',
        scrollTrigger: {
          trigger: projectsViewAllRef.current,
          start: 'top 80%',
        },
      });
    }
  }, []);
  return (
    <Containter className='home'>
      <Seo path="/" noTitleSuffix title={config.homepageTitle || (config.title ? `${config.name} — ${config.title}` : config.name)} />
      <Row>
        <Hello />
      </Row>
      <div className="content">
        {features.news && news && news.length > 0 && (
          <Row>
            <div ref={newsRef} className="mt-5">
              <h1 className="mb-3" id="news">
                News
              </h1>
              <ul className="list-unstyled">
                {
                  news.map((item, index) => {
                    return (
                      <NewsItem key={index} item={item} index={index} />
                    )
                  })
                }
              </ul>
            </div>
          </Row>
        )}
        {features.education && (
          <Row>
            <Education />
          </Row>
        )}
        {/* <Row>
          <Experience jsonExperiences={researchExperience} title={"Research Experience"} isExperience />
        </Row> */}
        {/* <Row>
          <Experience jsonExperiences={teachingExperience} title={"Teaching Experience"} isExperience />
        </Row> */}
        {features.experience && (
          <Row>
            <Experience jsonExperiences={workExperienceFiltered} title={labels.experienceTitle} isExperience />
            <div ref={workViewAllRef}>
              <Link href="/work-experiences" className="btn btn-outline-secondary btn-lg d-block mx-auto mt-3">
                View All {labels.experienceTitle} <i className="bi bi-arrow-right ms-2"></i>
              </Link>
            </div>
          </Row>
        )}
        {features.publications && (
          <Row>
            <div className="mt-5">
              {/* <h1 className="mb-3" id="publications">
                Publications
              </h1> */}
              <Publication hideGraph defaultType="conference" />
            </div>
          </Row>
        )}
        {features.talks && talks && talks.length > 0 && (
          <Row>
            <div ref={talksRef} className="mt-5">
              <h1 className="mb-3" id="talks-presentations">
                Talks & Presentations
              </h1>
              <ul className="list-unstyled">
                {
                  talks.map((item, index) => {
                    return (
                      <NewsItem key={index} item={item} index={index} />
                    )
                  })
                }
              </ul>
            </div>
          </Row>
        )}
        {features.projects && (
          <Row>
            <Experience jsonExperiences={projectsFiltered} title={"Projects"} />
            <div ref={projectsViewAllRef}>
              <Link href="/projects" className="btn btn-outline-secondary btn-lg d-block mx-auto mt-3">
                View All Projects <i className="bi bi-arrow-right ms-2"></i>
              </Link>
            </div>
          </Row>
        )}
        {features.services && service && service.length > 0 && (
          <Row>
            <div ref={serviceRef} className="mt-5">
              <h1 className="mb-3" id="service">
                Academic Services
              </h1>
              <div className="ps-2">
                {
                  service.map((cat, index) => {
                    return (
                      <div key={index} className="mb-4">
                        <h3 className="h5 mb-2 font-weight-bold" style={{ fontWeight: 600 }}>
                          {cat.category}
                        </h3>
                        <ul className="list-unstyled">
                          {
                            cat.items.map((item, idx) => (
                              <ServiceItem
                                key={idx}
                                name={item.name}
                                years={item.years}
                                link={item.link}
                                index={idx}
                              />
                            ))
                          }
                        </ul>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </Row>
        )}
        {features.skills && skills && (
          <Row>
            <div className="mt-5">
              <h1 className="mb-3" id="skills">
                Skills
              </h1>
              {
                Object.keys(skills).filter(key => key !== "resume_skills").map((skill, index) => {
                  const displayName = labels.skillCategories[skill] || skill.split("-").map(toTitleCase).join(" ");
                  return (
                    <React.Fragment key={index}>
                      <h1>{displayName}</h1>
                      <Skill skill={skills[skill]} />
                    </React.Fragment>
                  )
                })
              }
            </div>
          </Row>
        )}
        {features.awards && awards && (
          <Row>
            <div className="mt-5">
              <h1 className="mb-3" id="awards">
                Awards
              </h1>
              {
                awards.filter(award => award.show_on_website !== false).map((award, index) => {
                  return (
                    <Award key={index} award={award} />
                  )
                })
              }
            </div>
          </Row>
        )}
        {/* <Row>
          <div className="mt-5">
            <h1 className="mb-3" id="linktree">
              LinkTree
            </h1>
            <div className="text-center">
              <Link href="/linktree" className="btn btn-primary">
                View LinkTree
              </Link>
            </div>
          </div>
        </Row> */}
      </div>
    </Containter>
  );
}

function Award({ award }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.from(ref.current, {
      y: 24,
      opacity: 0,
      duration: 0.8,
      ease: 'ease',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 80%',
      },
    });
  }, []);

  return (
    <Row className="mb-3" ref={ref}>
      <Col xs={1} className="d-flex align-items-center" style={{ width: 'auto' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" className={`bi bi-trophy-fill ${(award.badge || award.spotlight) ? 'spotlight-trophy' : ''}`} viewBox="0 0 16 16">
        <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5zm.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935z"/>
      </svg>
      </Col>
      <Col>
        <div>
          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
            <h3 className="mb-0">{award.title}</h3>
            {(award.badge || award.spotlight) && (
              <Badge className="spotlight-badge" style={{ fontSize: '0.7rem', padding: '0.25em 0.5em' }}>
                {award.badge || (typeof award.spotlight === "string" ? award.spotlight : "Spotlight")}
              </Badge>
            )}
          </div>
          <h5>
            {award.link ? <Link href={award.link}>{award.awarder}</Link> :
              award.awarder
            }
          </h5>
          <span>{award.date}</span>
        </div>
      </Col>
    </Row>
  )
}

function NewsItem({ item, index }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.from(ref.current, {
      y: 24,
      opacity: 0,
      duration: 0.8,
      delay: index * 0.1,
      ease: 'ease',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 80%',
      },
    });
  }, [index]);

  return (
    <li ref={ref} className="mb-2 p-2 experience">
      <ReactMarkdown>{item}</ReactMarkdown>
    </li>
  );
}

// function to display skills.json
function Skill({skill}) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.from(ref.current, {
      y: 24,
      opacity: 0,
      duration: 0.8,
      ease: 'ease',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 80%',
      },
    });
  }, []);
  return (
    <Row className="mb-3" ref={ref}>
      <Col xs={1} className="d-flex align-items-center" style={{ width: 'auto' }}>
        {skill.join(', ')}
      </Col>
    </Row>
  )
}

function ServiceItem({ name, years, link, index }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.from(ref.current, {
      y: 12,
      opacity: 0,
      duration: 0.6,
      delay: index * 0.05,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 90%',
      },
    });
  }, [index]);

  const yearStr = years && years.length > 0 ? ` (${years.join(", ")})` : "";

  return (
    <li ref={ref} className="mb-2" style={{ listStyleType: 'disc', listStylePosition: 'outside', marginLeft: '1.5rem' }}>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer">
          <ReactMarkdown components={{ p: 'span' }}>{name}</ReactMarkdown>
        </a>
      ) : (
        <ReactMarkdown components={{ p: 'span' }}>{name}</ReactMarkdown>
      )}
      {yearStr}
    </li>
  );
}

const toTitleCase = (word) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};