import Seo from '@/components/seo';
import React from 'react';
import { Row, Col } from "react-bootstrap";
import Experience from "@/components/experience";
import Containter from "react-bootstrap/Container";
import workExperience from "/public/jsons/work-experience.json";

export default function WorkExperiences() {
  return (
    <Containter className='work-experiences'>
      <Seo title="Experience" path="/work-experiences" description="Research and professional experience of Kunal Pai across the DavSec, DArchR, and DECAL labs at UC Davis." />
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