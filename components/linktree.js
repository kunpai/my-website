// components/linktree.js
import React from 'react';
import { ListGroup } from 'react-bootstrap';

export function LinkTree({ links }) {
    return (
        <ListGroup>
            {links.map((link, index) => (
                <ListGroup.Item key={index} action href={link.url}>
                    {link.label}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
}
