// examples/Forms/DeliveryPeopleForm.jsx
import { notification } from "antd";
import { useEffect, useState } from "react";
import MDBox from "../../components/MDBox";
import MDButton from "../../components/MDButton";
import MDInput from "../../components/MDInput";
import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL;

function DeliveryPeopleForm({ onClose, initialPerson }) {
  const [email, setEmail] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [actionName, setActionName] = useState("Create");

  useEffect(() => {
    if (initialPerson) {
      setActionName("Update");
      setEmail(initialPerson.email || "");
      setFirstName(initialPerson.firstname || "");
      setLastName(initialPerson.lastname || "");
      setPhoneNumber(initialPerson.phonenumber || "");
    }
  }, [initialPerson]);

  const handleSubmit = async (e) => {
    if (!email || !firstname || !lastname || !phoneNumber) {
      notification.error({
          message: "Please input all fields.",
      });
      return;
    }

    if (!initialPerson && !password) {
      notification.error({
        message: "Please input all fields."
      })
    }

    try {
        if (initialPerson) {
            // If initialPerson exists, update the existing product
            
        } else {
            // Otherwise, create a new product
            const data = JSON.stringify({
                email: email,
                first_name: firstname,
                last_name: lastname,
                phone_number: phoneNumber,
                password: password
            });

            const token = localStorage.getItem("token");

            const response = await axios.post(
                `${API_BASE_URL}api/v1/auth/deliverymanRegisterWithOwner`,
                data,
                {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                }
            );

            notification.success({
              message: "Person created successfully",
            });
            
            onClose();
        }
    } catch (error) {
      console.error("Error updating/saving product:", error);
    }
  };

  return (
    <div onSubmit={handleSubmit}>
      <MDBox p={2} style={{width: "400px"}}>
        <MDBox mb={2}>
          <MDInput
            type="text"
            label="First Name"
            fullWidth
            value={firstname}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            type="text"
            label="Last Name"
            fullWidth
            value={lastname}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            type="text"
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            type="number"
            label="Phone Number"
            fullWidth
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </MDBox>
        {!initialPerson ? <MDBox mb={2}>
          <MDInput
            type="text"
            label="Password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </MDBox> : null}
        <MDButton
          variant="gradient"
          color="info"
          type="submit"
          onClick={(e) => {
            handleSubmit(e);
          }}
        >
          {actionName}
        </MDButton>
      </MDBox>
    </div>
  );
}

export default DeliveryPeopleForm;
