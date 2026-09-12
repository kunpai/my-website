import Seo from '@/components/seo';
import React from 'react';
import { Row, Col } from "react-bootstrap";
import Experience from "@/components/experience";
import Containter from "react-bootstrap/Container";
import projects from "/public/jsons/projects.json";

export default function Projects() {
  return (
    <Containter className='projects'>
      <Seo title="Projects" path="/projects" description="Research and software projects by Kunal Pai, including NAAMSE, HASHIRU, MARS, and gem5 Vision." />
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