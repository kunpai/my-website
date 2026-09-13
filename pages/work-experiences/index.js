import Seo from '@/components/seo';
import config from '@/website.config.json';
import React from 'react';
import { Row, Col } from "react-bootstrap";
import Experience from "@/components/experience";
import Containter from "react-bootstrap/Container";
import workExperience from "/public/jsons/work-experience.json";

export default function WorkExperiences() {
  return (
    <Containter className='work-experiences'>
      <Seo title="Experience" path="/work-experiences" description={`Research and professional experience of ${config.name}.`} />
      <Row>
        <div className="content">
          <Row>
            <Experience jsonExperiences={workExperience} title={"Research & Professional Experience"} isExperience />
          </Row>
        </div>
      </Row>
    </Containter>
  );
}