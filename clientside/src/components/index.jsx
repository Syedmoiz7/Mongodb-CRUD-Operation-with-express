import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from "axios";
import { useEffect } from 'react';
import { useState } from 'react';
import './index.css'



function Render() {

    const [products, setProducts] = useState([]);
    const [loadProduct, setLoadProduct] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)

    const getAllProducts = async () => {
        try {
            const response = await axios.get(`${baseUrl}/products`)
            console.log("response: ", response.data);
            setProducts(response.data.data)

        } catch (error) {
            console.log("error in getting products ", error);
        }
    }

    const deleteProduct = async (id) => {
        try {
            const response = await axios.delete(`${baseUrl}/product/${id}`)
            console.log("response: ", response.data);
            setLoadProduct(!loadProduct)

        } catch (error) {
            console.log("error in deleting products ", error);
        }
    }

    const editMode =  (product) => {
        setIsEditMode(!isEditMode)
        setEditingProduct(product)

        editFormik.setFieldValue("productName", product.name)
        editFormik.setFieldValue("productPrice", product.price)
        editFormik.setFieldValue("productDescription", product.description)
    }

    useEffect(() => {
        getAllProducts()
    }, [loadProduct])

    let baseUrl = "";
    if (window.location.href.split(":")[0] === "http") {
        baseUrl = "http://localhost:5000";
    }

    const myFormik = useFormik({
        initialValues: {
            productName: '',
            productPrice: '',
            productDescription: ''
        },
        validationSchema:
            yup.object({
                productName: yup
                    .string('Enter your product name')
                    .required('Product name is required')
                    .min(3, "please enter more then 3 characters ")
                    .max(20, "please enter within 20 characters "),

                productPrice: yup
                    .number('Enter your product price')
                    .positive("Enter positive product price ")
                    .required('Product price is required'),

                productDescription: yup
                    .string('Enter your product description')
                    .required('Product description is required')
                    .min(3, "please enter more then 3 characters ")
                    .max(500, "please enter within 500 characters "),

            }),
        onSubmit: (values) => {
            console.log("values: ", values);

            axios.post(`${baseUrl}/product`, {
                name: values.productName,
                price: values.productPrice,
                description: values.productDescription
            })
                .then(response => {
                    console.log("response: ", response.data);
                    setLoadProduct(!loadProduct)
                })
                .catch(err => {
                    console.log("error: ", err);
                })
        },
    });

    const editFormik = useFormik({
        initialValues: {
            productName: '',
            productPrice: '',
            productDescription: ''
        },
        validationSchema:
            yup.object({
                productName: yup
                    .string('Enter your product name')
                    .required('Product name is required')
                    .min(3, "please enter more then 3 characters ")
                    .max(20, "please enter within 20 characters "),

                productPrice: yup
                    .number('Enter your product price')
                    .positive("Enter positive product price ")
                    .required('Product price is required'),

                productDescription: yup
                    .string('Enter your product description')
                    .required('Product description is required')
                    .min(3, "please enter more then 3 characters ")
                    .max(500, "please enter within 500 characters "),

            }),
        onSubmit: (values) => {
            console.log("values: ", values);

            axios.put(`${baseUrl}/product/${editingProduct.id}`, {
                name: values.productName,
                price: values.productPrice,
                description: values.productDescription
            })
                .then(response => {
                    console.log("response: ", response.data);
                    setLoadProduct(!loadProduct)
                })
                .catch(err => {
                    console.log("error: ", err);
                })
        },
    });

    return (
        <div className='main'>
            <form onSubmit={myFormik.handleSubmit}>
                <input
                    id="productName"
                    placeholder="Product Name"
                    value={myFormik.values.productName}
                    onChange={myFormik.handleChange}
                />
                {
                    (myFormik.touched.productName && Boolean(myFormik.errors.productName)) ?
                        <span style={{ color: "red" }}>{myFormik.errors.productName}</span>
                        :
                        null
                }

                <br />

                <input
                    id="productPrice"
                    placeholder="Product Price"
                    value={myFormik.values.productPrice}
                    onChange={myFormik.handleChange}
                />
                {
                    (myFormik.touched.productPrice && Boolean(myFormik.errors.productPrice)) ?
                        <span style={{ color: "red" }}>{myFormik.errors.productPrice}</span>
                        :
                        null
                }

                <br />

                <input
                    id="productDescription"
                    placeholder="Product Description"
                    value={myFormik.values.productDescription}
                    onChange={myFormik.handleChange}
                />
                {
                    (myFormik.touched.productDescription && Boolean(myFormik.errors.productDescription)) ?
                        <span style={{ color: "red" }}>{myFormik.errors.productDescription}</span>
                        :
                        null
                }

                <br />
                <button type="submit"> Add Product </button>
            </form>

            <br />
            <br />

            <div>
                {products.map((eachProduct, i) => (
                    <div key={eachProduct.id} className="productCont">
                        <h2>{eachProduct.name}</h2>
                        <p>{eachProduct.id}</p>
                        <h5>{eachProduct.price}</h5>
                        <p>{eachProduct.description}</p>

                        <button onClick={() => {
                            deleteProduct(eachProduct.id)
                        }}>Delete</button>

                        <button onClick={() => {
                            editMode(eachProduct)
                        }}>Edit</button>

                        {(isEditMode && editingProduct.id === eachProduct.id) ?
                            <div>
                                <form onSubmit={editFormik.handleSubmit}>
                                    <input
                                        id="productName"
                                        placeholder="Product Name"
                                        value={editFormik.values.productName}
                                        onChange={editFormik.handleChange}
                                    />
                                    {
                                        (editFormik.touched.productName && Boolean(editFormik.errors.productName)) ?
                                            <span style={{ color: "red" }}>{editFormik.errors.productName}</span>
                                            :
                                            null
                                    }

                                    <br />

                                    <input
                                        id="productPrice"
                                        placeholder="Product Price"
                                        value={editFormik.values.productPrice}
                                        onChange={editFormik.handleChange}
                                    />
                                    {
                                        (editFormik.touched.productPrice && Boolean(editFormik.errors.productPrice)) ?
                                            <span style={{ color: "red" }}>{editFormik.errors.productPrice}</span>
                                            :
                                            null
                                    }

                                    <br />

                                    <input
                                        id="productDescription"
                                        placeholder="Product Description"
                                        value={editFormik.values.productDescription}
                                        onChange={editFormik.handleChange}
                                    />
                                    {
                                        (editFormik.touched.productDescription && Boolean(editFormik.errors.productDescription)) ?
                                            <span style={{ color: "red" }}>{editFormik.errors.productDescription}</span>
                                            :
                                            null
                                    }

                                    <br />
                                    <button type="submit"> Submit </button>
                                </form>
                            </div>
                            :
                            null}



                    </div>
                ))}
            </div>




        </div>
    )
}

export default Render;