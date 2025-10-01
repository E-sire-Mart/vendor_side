import Grid from "@mui/material/Grid";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import MembershipCard from "examples/Cards/StatisticsCards/MembershipCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

// New comment component
import SendComments from "layouts/dashboard/components/SendComments";

// @mui icons
import Icon from "@mui/material/Icon";

import UserService from "../../services/users-service";
import OrderService from "../../services/order-service";
import ProductService from "../../services/product-service";

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;
  const [users, setUsers] = useState(0);
  const [orders, setOrders] = useState(0);
  const [products, setProducts] = useState(0);

  const getUsersCounts = async () => {
    const response = await UserService.getAllCounts();
    setUsers(response.counts)
  };

  const getOrderCounts = async () => {
    const response = await OrderService.getAllCounts();
    setOrders(response.counts)
  };

  const getProductCounts = async () => {
    const response = await ProductService.getAllCounts();
    setProducts(response.counts)
  };

  useEffect(() => {
    getUsersCounts();
    getOrderCounts();
    getProductCounts();
  }, []);


  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="weekend"
                title="Orders"
                count={orders}
                percentage={{
                  color: "success",
                  amount: "+55%",
                  label: "than lask week",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="leaderboard"
                title="Today's Users"
                count={users}
                percentage={{
                  color: "success",
                  amount: "+3%",
                  label: "than last month",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="store"
                title="Products"
                count={products}
                percentage={{
                  color: "success",
                  amount: "+1%",
                  label: "than yesterday",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <MembershipCard
                color="warning"
                icon="workspace_premium"
                title="Current Plan"
                plan="Professional"
                price="39.90"
                features={[
                  "Up to 300 product listings",
                  "Advanced store analytics",
                  "Daily payout requests",
                  "Priority support",
                  "Unlimited order processing",
                  "15 featured products per month"
                ]}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="website views"
                  description="Last Campaign Performance"
                  date="campaign sent 2 days ago"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="daily sales"
                  description={
                    <>
                      (<strong>+15%</strong>) increase in today sales.
                    </>
                  }
                  date="updated 4 min ago"
                  chart={sales}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="completed orders"
                  description="Last Campaign Performance"
                  date="just updated"
                  chart={tasks}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>



        {/* Comments Section */}
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" alignItems="center" mb={3}>
                    <MDBox
                      sx={{
                        bgcolor: "info.main",
                        borderRadius: "50%",
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2
                      }}
                    >
                      <Icon sx={{ color: "white" }}>comment</Icon>
                    </MDBox>
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="bold">
                        Quick Comments
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        Send feedback or report issues quickly
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                  
                  <MDBox mb={3}>
                    <TextField
                      fullWidth
                      label="Quick Message"
                      placeholder="Type your message here..."
                      variant="outlined"
                      multiline
                      rows={3}
                    />
                  </MDBox>
                  
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <MDButton
                      variant="outlined"
                      color="primary"
                      startIcon={<Icon>send</Icon>}
                    >
                      Send Quick Message
                    </MDButton>
                    <MDButton
                      variant="text"
                      color="info"
                      onClick={() => window.location.href = '/comments'}
                    >
                      Full Comment Form →
                    </MDButton>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Need Help?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Use the comment form to reach out to our support team. We're here to help!
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Icon>support_agent</Icon>}
                    onClick={() => window.location.href = '/comments'}
                  >
                    Go to Comments
                  </Button>
                </Paper>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
