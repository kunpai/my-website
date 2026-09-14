import Seo from '@/components/seo';
import config, { featureGate, labels } from '@/lib/content';

export const getStaticProps = featureGate('experience');
import React from 'react';
import { Row, Col } from "react-bootstrap";
import Experience from "@/components/experience";
import Container from "react-bootstrap/Container";
import workExperience from "@/content/data/work-experience.json";

export default function WorkExperiences() {
  return (
    <Container className='work-experiences'>
      <Seo title="Experience" path="/work-experiences" description={`Research and professional experience of ${config.name}.`} />
      <Row>
        <div className="content">
          <Row>
            <Experience jsonExperiences={workExperience} title={labels.experienceTitle} isExperience />
          </Row>
        </div>
      </Row>
    </Container>
  );
}