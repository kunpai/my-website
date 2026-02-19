import React from 'react';
import { Row, Col } from "react-bootstrap";
import Experience from "@/components/experience";
import Containter from "react-bootstrap/Container";
import projects from "/public/jsons/projects.json";

export default function Projects() {
  return (
    <Containter className='projects'>
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