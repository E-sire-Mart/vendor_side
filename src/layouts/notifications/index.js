import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import NotificationService from '../../services/notification-service.js';

function Notifications() {

  const [notifications, setNotifications] = useState([]);

  const sampleNotifications = [
    { userName: "thomasjack1995525@gmail.com", message: "Delivered order_P4AfbwjoJvlHt0 by", color: "#5fb563", isNew: true, notificationId: "orderId1" },
    { userName: "thomasjack1995525@gmail.com", message: "Ordered order_P4AfbwjoJvlHt0 by", color: "#5fb563", isNew: true, notificationId: "orderId2" },
    { userName: "thomasjack1995525@gmail.com", message: "Requested registration by", color: "#3d97ef", isNew: true, notificationId: null },
    { userName: "thomasjack1995525@gmail.com", message: "Cancelled order_P4AfbwjoJvlHt0 by", color: "#ed4e4a", isNew: true, notificationId: "orderId3" },
  ];

  const fetchNotifications = async () => {
    try {
      // const response = await NotificationService.getAll();
      // setNotifications(response);
      setNotifications(sampleNotifications);
    } catch (error) {
      console.error('Fetch Notifications Error:', error);
    }
  };

  const handleViewNotification = (index, notificationId) => {
    const updatedNotifications = [...notifications];
    updatedNotifications[index].isNew = false;
    setNotifications(updatedNotifications);
  }

  useEffect(() => {
    fetchNotifications();
  }, []);


  const renderNotifications = () => {
    return notifications.map((notification, index) => (
      <div key={index} style={{ position: 'relative', marginBottom: '10px', display: "flex" }}>
        {notification.isNew && (
          <div style={{
            backgroundColor: "red",
            width: 10,
            height: 10,
            borderRadius: "50%",
            // fontWeight: 'bold',
            fontSize: 15,
            zIndex: 1,
          }}>
            
          </div>
        )}
        <div style={{
          padding: "10px 15px",
          background: notification.color,
          borderRadius: 5,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 15,
          flex: 1
          }}
        >
          <div>{notification.message + " " + notification.userName}</div>
          <div style={{display: "flex", gap: "15px"}}>
            <button style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: 15,
                // padding: "5px 10px",
                // border: '1px solid white',
                borderRadius: 5
              }}
              onClick={() => handleViewNotification(index, notification.notificationId)}
            >
              view
            </button>
            <button style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: 18,
                fontWeight: "bold"
              }}
            >
              ×
            </button>
          </div>
        </div>
      </div>
    ));
  };

  const alertContent = (name) => (
    <MDTypography variant="body2" color="white">
      {name}
    </MDTypography>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={6} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={8}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h5">Notification</MDTypography>
              </MDBox>
              <MDBox pt={2} px={2}>
                {renderNotifications()}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Notifications;
