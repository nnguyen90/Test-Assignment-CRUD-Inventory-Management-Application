import {getToken} from '../lib/authenticate';

const API_URL = 'http://localhost:8080';

const add = async (formData) => {
    console.log("Add function in Client")
    const token = getToken(); 
    try {
        const response = await fetch(`${API_URL}/items/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });
        const data = await response.json();
        console.log(response);
        return data;
    } catch (error) {
        console.error('Error adding item:', error);
        return { error: error.message };
    }
}

const edit = async (formData) => {
    const token = getToken(); 
    try{
    const res = await fetch(`${API_URL}/items/edit/${formData._id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
    });

    if (!res.ok) {
        console.log(res); 
        const data = await res.json();
        throw new Error(data.error);
    }
    const data = await res.json();
    return data;
    }catch(error){
        console.error('Error editing item:', error);    
        return { error: error.message };
    }
    // .then(response => response.json())
    // .catch(error => console.error('Error:', error));   
}

const deleteProduct = async (id) => {
    const token = getToken(); 
    try{
        const res = await fetch(`${API_URL}/items/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                //'Authorization': `Bearer ${token}`,
            },
        });
        const data = await res.json();
        return data;
        }catch(error){
            console.error('Error delete item:', error);    
            return { error: error.message };
        } 
}

export default {
    add,
    edit,
    deleteProduct 
};

    
 





