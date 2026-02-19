import React from 'react';
import { Row, Col } from "react-bootstrap";
import Experience from "@/components/experience";
import Containter from "react-bootstrap/Container";
import workExperience from "/public/jsons/work-experience.json";

export default function WorkExperiences() {
  return (
    <Containter className='work-experiences'>
      <Row>
        <div className="content">
          <Row>
            <Experience jsonExperiences={workExperience} title={"Work Experience"} isExperience />
          </Row>
        </div>
      </Row>
    </Containter>
  );
}