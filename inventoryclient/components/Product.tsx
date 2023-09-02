import {Button} from 'react-bootstrap';

export default function Product ({ id, name, quantity, onEdit, onDelete, isAdmin}) {
    return (
        <>
            <tr>
                <td>{id}</td>
                <td>{name}</td>
                <td>{quantity}</td>
                <td>
                {isAdmin && <Button variant="primary" onClick={() => onEdit(id)}>Edit</Button>}
                &nbsp;&nbsp;
                {isAdmin && <Button variant="primary" onClick={() => onDelete(id)}>Delete</Button>}
            </td>
            </tr>
        </>
    );

}