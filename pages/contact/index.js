import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    fax_number: '',
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (formData.fax_number) {
      console.warn('[SPAM BOT TRAPPED] Contact form submission blocked via honeypot field.');
      setFormData({ name: '', message: '', fax_number: '' });
      return;
    }
    // Handle form submission logic here (e.g., sending data to the server)
    // run mailto: link
    window.open(`mailto: ${process.env.CONFIG.email}?subject=Message from ${formData.name}&body=${formData.message}`);

    console.log('Form data submitted:', formData);
    // Reset the form after submission
    setFormData({
      name: '',
      message: '',
      fax_number: '',
    });
  };

  return (
    <Container className='contact'>
      <h1>Get in Touch</h1>
      <h6 className='text-secondary mb-3'>
        Hello there! I believe that every interaction holds the potential to spark creativity, forge new partnerships, and foster a genuine exchange of ideas. So, whether you&apos;re a fellow enthusiast in the same field, an aspiring artist, a tech wizard, or just someone looking to explore new horizons, don&apos;t hesitate to reach out!
      </h6>
      <p className='text-secondary mb-3'>
        You can contact me at <strong>pai DOT kunal05 AT gmail DOT com</strong> or <strong>kunpai AT ucla DOT edu</strong> or simply fill out the form below to redirect to an email client to send me a message directly.
      </p>
      <Form onSubmit={handleSubmit}>
        {/* Invisible Honeypot Field for Spam Bots */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <Form.Group controlId="formFaxNumber">
            <Form.Label>Fax Number</Form.Label>
            <Form.Control
              type="text"
              name="fax_number"
              value={formData.fax_number}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </Form.Group>
        </div>

        <Form.Group controlId="formName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formMessage">
          <Form.Label>Message</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="secondary" type="submit" className='mt-3'>
          Submit
        </Button>
      </Form>
    </Container>
  );
};
