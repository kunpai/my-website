// components/linktree.js
import React from 'react';
import styled from 'styled-components';

const LinkButton = styled.a`
  display: block;
  width: 100%;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f0f0f0;
  border-radius: 50px;
  color: #333;
  text-align: center;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #e0e0e0;
  }
`;

const LinkContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

export function LinkTree({ links }) {
  return (
    <LinkContainer>
      {links.map((link, index) => (
        <LinkButton key={index} href={link.url}>
          {link.label}
        </LinkButton>
      ))}
    </LinkContainer>
  );
}