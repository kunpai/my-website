import Publication from "@/components/publication";
import { Container, Row } from "react-bootstrap";

export default function PublicationPage(){
    return(
        <>
        <Container>
        <Row>
            <div className="mt-5">
            <h1 className="mb-3" id="publications">
                Publications
            </h1>
            <Publication />
            </div>
        </Row>
      </Container>
        </>
    )
}