import React from 'react';
import { Row, Col } from "react-bootstrap";
import Experience from "@/components/experience";
import Containter from "react-bootstrap/Container";
import Hello from '@/components/hello';
import researchExperience from "/public/jsons/research-experience.json";
import workExperience from "/public/jsons/work-experience.json";
import projects from "/public/jsons/projects.json";
import awards from "/public/jsons/awards.json";
import Image from "next/image";
import trophy from '/public/images/trophy.png';
import Publication from '@/components/publication';
import Education from '@/components/education';

export default function Home() {
  return (
    <Containter>
      <Row>
        <Hello />
      </Row>
      <Row>
        <div className="mt-5">
          <h1 className="mb-3" id="publications">
            Education
          </h1>
          <Education />
        </div>
      </Row>
      <Row>
        <Experience jsonExperiences={researchExperience} title={"Research Experience"} isExperience />
      </Row>
      <Row>
        <Experience jsonExperiences={workExperience} title={"Work Experience"} isExperience />
      </Row>
      <Row>
        <Experience jsonExperiences={projects} title={"Projects"} />
      </Row>
      <Row>
        <div className="mt-5">
          <h1 className="mb-3" id="publications">
            Publications
          </h1>
          <Publication />
        </div>
      </Row>
      <Row>
        <div className="mt-5">
          <h1 className="mb-3" id="awards">
            Awards
          </h1>
          {
            awards.map((award, index) => {
              return (
                <Row key={index} className="mb-3">
                  <Col xs={1} className="d-flex align-items-center">
                    <Image src={trophy} roundedCircle width={50} height={50} />
                  </Col>
                  <Col>
                    <div key={index}>
                      <h3>{award.title}</h3>
                      <span>{award.date}</span>
                    </div>
                  </Col>
                </Row>
              )
            })
          }
        </div>
      </Row>
    </Containter>
  );
}
