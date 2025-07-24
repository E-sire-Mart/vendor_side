import React, { useState, useEffect } from 'react';
import MDBox from '../../components/MDBox';
import MDTypography from '../../components/MDTypography';
import MDButton from '../../components/MDButton';
import OrderService from '../../services/order-service.js';
import axios from 'axios';
import { notification } from 'antd';

function OrderStatusForm({ onClose, orderId, deliverPeople }) {
    const [verifiedDeliveryPeople, setVerifiedDeliveryPeople] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState('');

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        // Prepare the new order object with updated status
        const data = JSON.stringify({
            deliveryMan: selectedPerson,
            orderId: orderId
        });

        const token = localStorage.getItem("token");

        try {
            const response = await axios.patch(
                `${process.env.REACT_APP_API_URL}api/v1/orders/ship`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                notification.success({
                    message: response.data.message
                })

                onClose();
            } else {
                notification.error({
                    message: response.data.message
                })
            }

        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    useEffect(() => {
        const fetchPeople = () => {
            const ablePeople = deliverPeople.filter(item => item.isVerified.props.checked == true);
            setVerifiedDeliveryPeople(ablePeople);
        }

        fetchPeople();
    }, [deliverPeople]);

    return (
        <form onSubmit={handleUpdate}>
            <MDBox p={2}>
                <MDBox mb={2}>
                <div>
                    <MDTypography variant="body1" mb={1}>
                        Ship order into delivery man
                    </MDTypography>
                    <select
                        value={selectedPerson}
                        onChange={(e) => setSelectedPerson(e.target.value)}
                        required={true}
                        style={{
                            padding: "12px",
                            width: "100%",
                            borderRadius: "5px",
                            border: "1px solid #d2d6da",
                            color: "#868ba3"
                        }}
                    >
                        <option value="" disabled>
                            Select Delivery Man
                        </option>
                        {verifiedDeliveryPeople.map((item) => (
                            <option key={item.email} value={item.email}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>
                </MDBox>

                <MDButton variant="gradient" color="info" type="submit">
                    Update
                </MDButton>
            </MDBox>
        </form>
    );
}

export default OrderStatusForm;
