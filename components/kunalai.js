import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Form, InputGroup } from "react-bootstrap";
import education from "@/public/jsons/education.json";
import skills from "@/public/jsons/skills.json";
import projects from "@/public/jsons/projects.json";
import publications from "@/public/jsons/publications.json";
import workExperience from "@/public/jsons/work-experience.json";
import researchExperience from "@/public/jsons/research-experience.json";
import news from "@/public/jsons/news.json";
import awards from "@/public/jsons/awards.json";
import service from "@/public/jsons/service.json";
import teachingExperience from "@/public/jsons/teaching-experience.json";
import config from "@/website.config.json";

export default function KunalAI() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hi! I am KunalAI. I can help answer questions about Kunal's research, experience, or skills. Ask me anything!"
        }
    ]);
    const [input, setInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const chatEndRef = useRef(null);

    // Scroll to bottom of chat when messages change
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const buildSystemPrompt = () => {
        const pubList = publications
            .filter(p => p.show_on_website !== false)
            .map(p => `- ${p.title} (${p.conference || p.type}). ${p.description ? p.description : ""}`)
            .join("\n");

        const projList = projects
            .map(p => `- ${p.title}: ${p.description ? p.description : ""} (Tech: ${p.tags ? p.tags.join(", ") : ""})`)
            .join("\n");

        const workList = workExperience
            .filter(w => w.show_on_website !== false)
            .map(w => `- ${w.title} at ${w.organization} (${w.start} - ${w.end}): ${w.description ? w.description : ""}`)
            .join("\n");

        const researchList = researchExperience
            .map(r => `- Research: ${r.title} at ${r.organization} (${r.start} - ${r.end}): ${r.description ? r.description : ""}`)
            .join("\n");

        const eduList = education
            .filter(e => e.show_on_website !== false || e.show_in_resume !== false)
            .map(e => `- ${e.degree} in ${e.major} from ${e.university} (${e.start} - ${e.end || e.resume_end}). GPA: ${e.gpa || "N/A"}. ${e.description ? e.description : ""}`)
            .join("\n");

        const skillList = Object.keys(skills.resume_skills || {})
            .map(cat => {
                const val = skills.resume_skills[cat];
                return Array.isArray(val) ? `- ${cat}: ${val.join(", ")}` : null;
            })
            .filter(Boolean)
            .join("\n");

        const newsList = news
            .map(n => `- ${n}`)
            .join("\n");

        const awardList = awards
            .filter(a => a.show_on_website !== false)
            .map(a => `- ${a.title} from ${a.awarder} (${a.date})`)
            .join("\n");

        const serviceList = service
            .join("\n");

        const teachingList = teachingExperience
            .map(t => `- ${t.title} at ${t.organization} (${t.start} - ${t.end}): ${t.description}`)
            .join("\n");

        return `You represent Kunal Pai. Answer questions on behalf of Kunal using the context below. 

Rules:
1. Always speak about Kunal in the third person (e.g. "Kunal is...", "He worked on...").
2. When asked if he is available for a job/internship, explain his current status based on the "Availability" and "Education" sections in the context.
3. If asked for contact details, provide the exact email: ${config.email}.
4. Keep your responses short (1-3 sentences maximum) and friendly.
5. Only answer questions based on the context below. If the context doesn't contain the answer, say you don't know.

Context:
- Intro: ${config.intro}
- Recent News & Updates:
${newsList}
- Availability: Currently a student open to internships, research collaborations, and academic discussions.
- Education:
${eduList}
- Skills:
${skillList}
- Work Experience:
${workList}
- Research Experience:
${researchList}
- Teaching Experience:
${teachingList}
- Publications:
${pubList}
- Projects:
${projList}
- Awards & Honors:
${awardList}
- Professional Service:
${serviceList}
`;
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isGenerating) return;

        const userMessage = input.trim();
        setInput("");
        setIsGenerating(true);

        const newMessages = [...messages, { role: "user", content: userMessage }];
        setMessages(newMessages);

        // Add placeholder message for streaming chunks
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        try {
            const systemPrompt = buildSystemPrompt();
            
            // Format messages for the backend proxy
            const chatHistory = [
                { role: "system", content: systemPrompt },
                ...newMessages.map(msg => ({ role: msg.role, content: msg.content }))
            ];

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: chatHistory
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP error ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let buffer = "";

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    const chunk = decoder.decode(value, { stream: !done });
                    buffer += chunk;

                    // Parse Server-Sent Events (SSE) protocol from buffer
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed) continue;
                        if (trimmed === 'data: [DONE]') continue;
                        if (trimmed.startsWith('data: ')) {
                            try {
                                const parsed = JSON.parse(trimmed.slice(6));
                                const textChunk = parsed.choices?.[0]?.delta?.content || "";
                                if (textChunk) {
                                    setMessages((prev) => {
                                        const next = [...prev];
                                        const lastIndex = next.length - 1;
                                        if (lastIndex >= 0 && next[lastIndex].role === "assistant") {
                                            next[lastIndex] = {
                                                role: "assistant",
                                                content: next[lastIndex].content + textChunk
                                            };
                                        }
                                        return next;
                                    });
                                }
                            } catch (e) {
                                // Incomplete JSON or other chunk errors, skip and let buffer handle it
                            }
                        }
                    }
                }
            }

            setIsGenerating(false);
        } catch (err) {
            console.error("Error generating response:", err);
            setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                    role: "assistant",
                    content: `Sorry, I encountered an error: ${err.message || err}`
                };
                return next;
            });
            setIsGenerating(false);
        }
    };

    return (
        <div className="kunalai-widget">
            {/* Floating Action Button */}
            <Button
                className={`kunalai-fab ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle KunalAI Chatbot"
            >
                {isOpen ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        className="bi bi-x-lg"
                        viewBox="0 0 16 16"
                    >
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        className="bi bi-robot"
                        viewBox="0 0 16 16"
                    >
                        <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 5.176 5.248 3 8 3s5 2.176 5 5.062c0 .98-.291 1.905-.805 2.684a3 3 0 1 1-8.39 0A7.95 7.95 0 0 1 3 8.062Zm8 .894a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z" />
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0ZM1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8Zm11.5-6h-9A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 13.5 2Z" />
                    </svg>
                )}
            </Button>

            {/* Chatbox Window */}
            {isOpen && (
                <Card className="kunalai-chatbox shadow-lg border-0">
                    <Card.Header className="d-flex align-items-center justify-content-between py-3 border-0 bg-transparent">
                        <div className="d-flex align-items-center gap-2">
                            <div className="avatar-pulse"></div>
                            <div>
                                <h6 className="mb-0 fw-bold">KunalAI</h6>
                                <small className="text-muted d-block" style={{ fontSize: "10px" }}>
                                    AI Assistant (NVIDIA NIM Llama-3.1)
                                </small>
                            </div>
                        </div>
                        <Button
                            variant="link"
                            className="p-0 text-muted d-flex align-items-center justify-content-center"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat"
                            style={{ width: "24px", height: "24px", minWidth: "24px" }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                fill="currentColor"
                                className="bi bi-x-lg"
                                viewBox="0 0 16 16"
                            >
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                            </svg>
                        </Button>
                    </Card.Header>

                    <Card.Body className="kunalai-body d-flex flex-column p-0">
                        <div className="chat-messages-container p-3 flex-grow-1 overflow-auto">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`chat-bubble-wrapper d-flex mb-3 ${
                                        msg.role === "user" ? "justify-content-end" : "justify-content-start"
                                    }`}
                                >
                                    <div
                                        className={`chat-bubble px-3 py-2 rounded-4 ${
                                            msg.role === "user" ? "bg-primary text-white" : "bg-body-secondary text-body"
                                        }`}
                                        style={{
                                            maxWidth: "80%",
                                            fontSize: "13px",
                                            lineHeight: "1.4",
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </Card.Body>

                    <Card.Footer className="border-0 bg-transparent p-3">
                        <Form onSubmit={handleSend}>
                            <InputGroup>
                                <Form.Control
                                    placeholder="Ask a question..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={isGenerating}
                                    className="border-end-0 rounded-start-pill py-2 ps-3"
                                    style={{ fontSize: "13px" }}
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={isGenerating || !input.trim()}
                                    className="rounded-end-pill px-3"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        className="bi bi-send-fill"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.26.41.192-.452 5.823-14.887a.5.5 0 0 0-.65-.65z" />
                                    </svg>
                                </Button>
                            </InputGroup>
                        </Form>
                    </Card.Footer>
                </Card>
            )}
        </div>
    );
}
