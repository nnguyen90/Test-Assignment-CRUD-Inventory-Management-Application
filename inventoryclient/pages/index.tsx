import useSWR, {mutate}  from 'swr';
import { Pagination, Card, Table, Button, Dropdown } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { readToken } from '@/lib/authenticate';
import FormModal from '@/components/Modal';
import Product from '@/components/Product';
import productService from './productService';

const API_URL = 'http://localhost:8080';

const Home = () => {
    const fetcher = (url) => fetch(url).then((res) => res.json());
    const [page, setPage] = useState(1);
    const [pageData, setPageData] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [isAdd,setIsAdd] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [totalQuantity, setTotalQuantity] = useState(0);
    
    const { data, error } = useSWR(`${API_URL}/items?page=${page}&perPage=5`, fetcher);
     
    //To update the data
    useEffect(() => {  
        if (data) setPageData(data);
    },[data]);

    //To check if the user is admin
    useEffect(() => {
        const token = readToken();
        if (token && token.role === 'admin') setIsAdmin(true);
        else setIsAdmin(false);
    }, []);

    useEffect(() => {
        calculateTotalQuantity();
    }, [pageData]);
  
    // To open the Add Form Modal
    const handleAdd = () => {
        setModalData(null);
        setIsAdd(true);
        setModalShow(true);
    };

    // To open the Edit Form Modal
    const handleEdit = (id) => {
        const product = pageData.find((product) => product.id === id);
        if (product) {
          setModalData(product); 
          setIsAdd(false);
          setModalShow(true);
        }   
    };
    
    const handleDelete = async(id) => {
        console.log('Delete item id', id);
        try {
            await productService.deleteProduct(id);
            mutate(`${API_URL}/items?page=${page}&perPage=5`);
            setPageData((prevData) => prevData.filter((product) => product.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    // Sort the products by quantity
    const handleSort = (order) => {
        const sortedProducts = sortProducts(pageData, order);
        setPageData(sortedProducts);
    };

    function sortProducts(products, order) {
        const sortedProducts = [...products];
        const n = sortedProducts.length;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (order === 'asc' ? sortedProducts[j].quantity > sortedProducts[j + 1].quantity : sortedProducts[j].quantity < sortedProducts[j + 1].quantity) {
                    const temp = sortedProducts[j];
                    sortedProducts[j] = sortedProducts[j + 1];
                    sortedProducts[j + 1] = temp;
                }
            }
        }
        return sortedProducts;
    }
    
    const calculateTotalQuantity = () => {
        let total = 0;
        for (let i = 0; i < pageData.length; i++) {
            total += pageData[i].quantity;
        }
        setTotalQuantity(total);
    };

    // Pagination ==> Switching between pages
    const previous = () => {
        if (page > 1) setPage((prevPage) => prevPage - 1);
    };

    const next = () => {
        setPage((prevPage) => prevPage + 1);
    };

    // Update the new Data after add/edit ==> to reload the table
    const updatePageData = (updatedData) => {
        if (updatedData.error) {
            console.error(updatedData.error);
            return;
        }
        mutate(`${API_URL}/items?page=${page}&perPage=5`, async (data) => {
            const updatedDataArray = data.filter(product => product.id !== updatedData.id);
            return [...updatedDataArray, updatedData];
        });     
    };

  return (
    <div>
        <Card className="bg-light">
            <Card.Body>Inventory</Card.Body>
        </Card>
        <br />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {isAdmin && <Button variant="primary" onClick={handleAdd}>Add</Button>}
            <h5 style={{ marginLeft: 'auto' }}>Total Quantity: {totalQuantity} kg</h5>
        </div>
        <br /><br />
        <Table className="table" striped bordered hover responsive>   
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Quantity (kg)                         
                        <Dropdown style={{ display: 'inline', marginLeft: '10px', padding: 0, border: 'none', backgroundColor: 'transparent' }}>
                            <Dropdown.Toggle variant="link" id="dropdown-basic">
                                ▼
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleSort('asc')}>Ascending</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleSort('desc')}>Descending</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </th>
                </tr>
            </thead>
            <tbody>
                {pageData.map((product) => (
                    <Product key={product.id} {...product} onEdit={handleEdit} onDelete={() => handleDelete(product.id)} isAdmin={isAdmin}/>
                ))}             
            </tbody>
        </Table>
        
        <FormModal  
            key={modalData?.id}
            show={modalShow} 
            onClose={() => setModalShow(false)} 
            initialData={modalData} 
            onSubmit={isAdd  ? productService.add : productService.edit} 
            onUpdate={updatePageData} 
        />
        <Pagination>
        <Pagination.Prev onClick={previous} />
        <Pagination.Item>{page}</Pagination.Item>
        <Pagination.Next onClick={next} />
        </Pagination>
    </div>
  );
}

export default Home;
