import Seo from '@/components/seo';
import config, { featureGate } from '@/lib/content';

export const getStaticProps = featureGate('projects');
import React from 'react';
import { Row, Col } from "react-bootstrap";
import Experience from "@/components/experience";
import Containter from "react-bootstrap/Container";
import projects from "@/content/data/projects.json";

export default function Projects() {
  return (
    <Containter className='projects'>
      <Seo title="Projects" path="/projects" description={`Research, open-source software, and academic projects by ${config.name}.`} />
      <Row>
        <div className="content">
          <Row>
            <Experience jsonExperiences={projects} title={"Projects"} />
          </Row>
        </div>
      </Row>
    </Containter>
  );
}