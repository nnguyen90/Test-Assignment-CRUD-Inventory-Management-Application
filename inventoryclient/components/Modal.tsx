import React, { useState, useEffect } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { getToken } from '@/lib/authenticate';

export default function FormModal({show, initialData, onClose, onSubmit, onUpdate }) {  
    const [formData, setFormData] = useState(initialData || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const token = getToken();

    useEffect(() => {
        setFormData(initialData || {});
    }, [initialData]);

    const handleClose = () => {
        setFormData({});
        onClose();
    };

    const handleSubmit = async (e) => {       
        e.preventDefault();
        setIsSubmitting(true);
        onSubmit(formData);
        if (onUpdate) {
            onUpdate(formData);
        }
        handleClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return(
        <div>
            <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton onClick={handleClose}>
            <Modal.Title>{initialData? 'Edit':'Add'}</Modal.Title>
            </Modal.Header>
    
            <Modal.Body>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>ID</Form.Label>
                <Form.Control
                    type="text"
                    name="id"
                    autoFocus
                    value={formData.id || ''}
                    onChange={handleChange}                
                />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                <Form.Label>Name</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    autoFocus
                    value={formData.name || ''}
                    onChange={handleChange}
                
                />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                    type="number"
                    name="quantity"
                    autoFocus
                    value={formData.quantity || ''}
                    onChange={handleChange}
                />
                </Form.Group>
                <Button variant="secondary" onClick={handleClose}>
                Cancel
                </Button>
                &nbsp;&nbsp;
                <Button variant="primary" type="submit">
                Confirm
                </Button>
            </Form>
            </Modal.Body>
        </Modal>
      </div>
    );
}