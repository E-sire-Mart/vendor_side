import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// @mui icons
import Icon from "@mui/material/Icon";

function Membership() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      name: "Basic",
      icon: "workspace_premium",
      iconColor: "info",
      price: isAnnual ? 4.05 : 4.50,
      features: [
        "Up to 50 product listings",
        "Access to store analytics (basic)",
        "Unlimited order processing",
        "Eligible for seasonal promotions",
        "Custom store banner & logo",
        "3 featured products per month",
        "12 promotional discounts per month",
        "Up to 500 store followers"
      ],
      buttonText: "Upgrade",
      buttonColor: "success",
      buttonVariant: "gradient"
    },
    {
      name: "Plus",
      icon: "workspace_premium",
      iconColor: "success",
      price: isAnnual ? 8.01 : 8.90,
      features: [
        "Up to 100 product listings",
        "Customer engagement tools (email campaigns, messaging)",
        "Daily payout requests",
        "Unlimited order processing",
        "Eligible for seasonal promotions",
        "5 featured products per month",
        "25 promotional discounts per month",
        "Up to 1,000 store followers"
      ],
      buttonText: "Start Free Trial",
      buttonColor: "light",
      buttonVariant: "outlined"
    },
    {
      name: "Professional",
      icon: "workspace_premium",
      iconColor: "warning",
      price: isAnnual ? 35.91 : 39.90,
      features: [
        "Up to 300 product listings",
        "Advanced store analytics & insights",
        "Daily payout requests",
        "Priority support",
        "Unlimited order processing",
        "Eligible for seasonal promotions",
        "15 featured products per month",
        "75 promotional discounts per month",
        "Up to 5,000 store followers",
        "15 external invoice downloads"
      ],
      buttonText: "Upgrade",
      buttonColor: "success",
      buttonVariant: "gradient",
      isHighlighted: true
    },
    {
      name: "Premier",
      icon: "workspace_premium",
      iconColor: "warning",
      price: isAnnual ? 71.91 : 79.90,
      features: [
        "Unlimited product listings",
        "Advanced store analytics & insights",
        "Daily payout requests",
        "Priority support",
        "Unlimited order processing",
        "Eligible for seasonal promotions",
        "30 featured products per month",
        "150 promotional discounts per month",
        "Unlimited store followers",
        "Unlimited external invoice downloads"
      ],
      buttonText: "Upgrade",
      buttonColor: "success",
      buttonVariant: "gradient"
    }
  ];

  const handleBillingToggle = () => {
    setIsAnnual(!isAnnual);
  };

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPlan(null);
  };

  const handlePaymentMethodSelection = (paymentMethod) => {
    console.log(`Selected ${paymentMethod} for ${selectedPlan.name} plan`);
    // Here you would integrate with your payment processing system
    handleClosePaymentModal();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={4}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <MDBox display="flex" alignItems="center">
                <Icon fontSize="large" color="success" sx={{ mr: 2 }}>
                  workspace_premium
                </Icon>
                <MDTypography variant="h3" fontWeight="bold">
                  Membership Plans
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item>
              <FormControlLabel
                control={
                  <Switch
                    checked={isAnnual}
                    onChange={handleBillingToggle}
                    color="success"
                  />
                }
                label={
                  <MDBox display="flex" alignItems="center">
                    <MDTypography variant="button" color="text" mr={1}>
                      Monthly
                    </MDTypography>
                    <MDTypography variant="button" color="text" mr={1}>
                      Annual
                    </MDTypography>
                    {isAnnual && (
                      <MDTypography variant="caption" color="success" fontWeight="bold">
                        (Save 10%)
                      </MDTypography>
                    )}
                  </MDBox>
                }
              />
            </Grid>
          </Grid>
        </MDBox>

        <Grid container spacing={3}>
          {plans.map((plan, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <Card
                sx={{
                  border: plan.isHighlighted ? '2px solid #4caf50' : 'none',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {plan.isHighlighted && (
                  <MDBox
                    position="absolute"
                    top={-10}
                    left="50%"
                    transform="translateX(-50%)"
                    bgcolor="success.main"
                    color="white"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    zIndex={1}
                  >
                    <MDTypography variant="caption" fontWeight="bold">
                      RECOMMENDED
                    </MDTypography>
                  </MDBox>
                )}
                
                <MDBox p={3} textAlign="center" flex={1} display="flex" flexDirection="column">
                  <MDBox
                    variant="gradient"
                    bgColor={plan.iconColor}
                    color="white"
                    borderRadius="xl"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="4rem"
                    height="4rem"
                    mx="auto"
                    mb={2}
                  >
                    <Icon fontSize="medium" color="inherit">
                      {plan.icon}
                    </Icon>
                  </MDBox>
                  
                  <MDTypography variant="h4" fontWeight="bold" mb={1}>
                    {plan.name}
                  </MDTypography>
                  
                  <MDBox mb={3}>
                    <MDTypography variant="h3" fontWeight="bold" color="info">
                      ${plan.price}
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      /month
                    </MDTypography>
                  </MDBox>

                  <MDBox flex={1} mb={3}>
                    {plan.features.map((feature, featureIndex) => (
                      <MDBox
                        key={featureIndex}
                        display="flex"
                        alignItems="center"
                        mb={1.5}
                        textAlign="left"
                      >
                        <Icon fontSize="small" color="success" sx={{ mr: 1.5, flexShrink: 0 }}>
                          check_circle
                        </Icon>
                        <MDTypography variant="body2" color="text">
                          {feature}
                        </MDTypography>
                      </MDBox>
                    ))}
                  </MDBox>

                  <MDBox mt="auto">
                    <MDButton
                      variant={plan.buttonVariant}
                      color={plan.buttonColor}
                      fullWidth
                      size="large"
                      onClick={() => handlePlanSelection(plan)}
                      sx={{
                        borderColor: plan.buttonColor === 'light' ? 'grey.400' : 'transparent',
                        color: plan.buttonColor === 'light' ? 'text.primary' : 'white'
                      }}
                    >
                      {plan.buttonText}
                    </MDButton>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MDBox>

             {/* Payment Method Selection Modal */}
       <Modal
         open={isPaymentModalOpen}
         onClose={handleClosePaymentModal}
         closeAfterTransition
         BackdropComponent={Backdrop}
         BackdropProps={{
           timeout: 500,
         }}
         sx={{
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           p: 2
         }}
       >
         <Fade in={isPaymentModalOpen}>
                       <Card
              sx={{
                width: '100%',
                maxWidth: 480,
                bgcolor: '#1f2937',
                borderRadius: 2,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.9)',
                p: 0,
                position: 'relative',
                border: '1px solid #374151'
              }}
            >
              {/* Modal Header */}
              <MDBox
                p={3}
                borderBottom="1px solid"
                borderColor="#374151"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h5" fontWeight="bold" color="white">
                  Choose payment method
                </MDTypography>
                <Icon
                  onClick={handleClosePaymentModal}
                  sx={{
                    cursor: 'pointer',
                    fontSize: 24,
                    color: '#9ca3af',
                    '&:hover': { 
                      color: 'white',
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s ease'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  close
                </Icon>
              </MDBox>

              {/* Modal Content */}
              <MDBox p={3}>
                <MDTypography variant="body1" color="#9ca3af" mb={3} fontWeight="medium">
                  Select Payment Type
                </MDTypography>
                
                <Grid container spacing={2}>
                  {/* PayPal Button */}
                  <Grid item xs={6}>
                    <MDButton
                      variant="outlined"
                      fullWidth
                      size="medium"
                      onClick={() => handlePaymentMethodSelection('PayPal')}
                      sx={{
                        borderColor: '#4b5563',
                        borderWidth: 1.5,
                        bgcolor: '#374151',
                        color: 'white',
                        py: 2.5,
                        px: 1,
                        borderRadius: 1.5,
                        '&:hover': { 
                          borderColor: '#60a5fa',
                          bgcolor: '#4b5563',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 20px rgba(96, 165, 250, 0.25)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <MDBox display="flex" flexDirection="column" alignItems="center">
                        <MDBox
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: '#003087',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1.5
                          }}
                        >
                          <MDTypography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                            P
                          </MDTypography>
                        </MDBox>
                        <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#003087' }}>
                          PayPal
                        </MDTypography>
                      </MDBox>
                    </MDButton>
                  </Grid>

                  {/* Card Button (Selected by default) */}
                  <Grid item xs={6}>
                    <MDButton
                      variant="contained"
                      fullWidth
                      size="medium"
                      onClick={() => handlePaymentMethodSelection('Card')}
                      sx={{
                        bgcolor: '#3b82f6',
                        color: 'white',
                        py: 2.5,
                        px: 1,
                        borderRadius: 1.5,
                        border: '1.5px solid #60a5fa',
                        '&:hover': { 
                          bgcolor: '#2563eb',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <MDBox display="flex" flexDirection="column" alignItems="center">
                        <MDBox
                          sx={{
                            width: 36,
                            height: 24,
                            borderRadius: 0.5,
                            bgcolor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1.5,
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 3,
                              left: 3,
                              width: 18,
                              height: 1.5,
                              bgcolor: '#e5e7eb',
                              borderRadius: 0.5
                            }
                          }}
                        />
                        <MDTypography variant="body2" fontWeight="bold">
                          Card
                        </MDTypography>
                      </MDBox>
                    </MDButton>
                  </Grid>
                </Grid>

                {/* Secure Checkout Section */}
                <MDBox mt={3} p={2.5} bgcolor="#374151" borderRadius={1.5} border="1px solid #4b5563">
                  <MDBox display="flex" alignItems="center" justifyContent="space-between">
                    <MDBox display="flex" alignItems="center">
                      <Icon sx={{ fontSize: 18, mr: 1.5, color: '#10b981' }}>
                        lock
                      </Icon>
                      <MDTypography variant="body2" color="#9ca3af">
                        Secure, fast checkout with{' '}
                        <MDTypography
                          component="span"
                          variant="body2"
                          color="#3b82f6"
                          fontWeight="bold"
                          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        >
                          Link
                        </MDTypography>
                      </MDTypography>
                    </MDBox>
                    <Icon sx={{ fontSize: 18, color: '#3b82f6' }}>
                      expand_more
                    </Icon>
                  </MDBox>
                </MDBox>

                {/* Card Details Section */}
                <MDBox mt={3}>
                  <MDTypography variant="body1" color="white" mb={2.5} fontWeight="medium">
                    Card Details
                  </MDTypography>
                  
                  <Grid container spacing={2}>
                    {/* Card Number */}
                    <Grid item xs={12}>
                      <MDBox>
                        <MDTypography variant="caption" color="#9ca3af" mb={1}>
                          Card number
                        </MDTypography>
                        <MDBox
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: '#374151',
                            border: '1.5px solid #4b5563',
                            borderRadius: 1.5,
                            p: 1.5,
                            '&:focus-within': {
                              borderColor: '#60a5fa',
                              boxShadow: '0 0 0 2px rgba(96, 165, 250, 0.1)'
                            }
                          }}
                        >
                          <MDTypography variant="body2" color="#9ca3af" sx={{ flex: 1 }}>
                            1234 1234 1234 1234
                          </MDTypography>
                          <MDBox display="flex" gap={0.5}>
                            <MDBox
                              sx={{
                                width: 28,
                                height: 18,
                                borderRadius: 0.5,
                                bgcolor: '#ff6b35',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            />
                            <MDBox
                              sx={{
                                width: 28,
                                height: 18,
                                borderRadius: 0.5,
                                bgcolor: '#1e40af',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            />
                            <MDBox
                              sx={{
                                width: 28,
                                height: 18,
                                borderRadius: 0.5,
                                bgcolor: '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            />
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    </Grid>

                    {/* Expiration and Security Code */}
                    <Grid item xs={6}>
                      <MDBox>
                        <MDTypography variant="caption" color="#9ca3af" mb={1}>
                          Expiration date
                        </MDTypography>
                        <MDBox
                          sx={{
                            bgcolor: '#374151',
                            border: '1.5px solid #4b5563',
                            borderRadius: 1.5,
                            p: 1.5,
                            '&:focus-within': {
                              borderColor: '#60a5fa',
                              boxShadow: '0 0 0 2px rgba(96, 165, 250, 0.1)'
                            }
                          }}
                        >
                          <MDTypography variant="body2" color="#9ca3af">
                            MM / YY
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    </Grid>

                    <Grid item xs={6}>
                      <MDBox>
                        <MDTypography variant="caption" color="#9ca3af" mb={1}>
                          Security code
                        </MDTypography>
                        <MDBox
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: '#374151',
                            border: '1.5px solid #4b5563',
                            borderRadius: 1.5,
                            p: 1.5,
                            '&:focus-within': {
                              borderColor: '#60a5fa',
                              boxShadow: '0 0 0 2px rgba(96, 165, 250, 0.1)'
                            }
                          }}
                        >
                          <MDTypography variant="body2" color="#a0aec0" sx={{ flex: 1 }}>
                            CVC
                          </MDTypography>
                          <MDBox
                            sx={{
                              width: 20,
                              height: 14,
                              borderRadius: 0.5,
                              bgcolor: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            <MDTypography variant="caption" color="#6b7280" fontWeight="bold">
                              123
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    </Grid>
                  </Grid>

                  {/* Disclaimer */}
                  <MDBox mt={3} p={2.5} bgcolor="#374151" borderRadius={1.5}>
                    <MDTypography variant="caption" color="#9ca3af" lineHeight={1.5}>
                      By providing your card information, you allow us to charge your card for future payments in accordance with our terms.
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </MDBox>

              {/* Modal Footer */}
              <MDBox
                p={3}
                borderTop="1px solid"
                borderColor="#374151"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDButton
                  variant="outlined"
                  onClick={handleClosePaymentModal}
                  startIcon={<Icon>arrow_back</Icon>}
                  size="small"
                  sx={{
                    borderColor: '#4b5563',
                    color: '#9ca3af',
                    '&:hover': {
                      borderColor: '#60a5fa',
                      color: 'white',
                      bgcolor: '#374151'
                    }
                  }}
                >
                  Back
                </MDButton>
                
                <MDBox display="flex" alignItems="center" sx={{ flex: 1, justifyContent: 'center' }}>
                  <Icon sx={{ fontSize: 16, mr: 1, color: '#10b981' }}>
                    lock
                  </Icon>
                  <MDTypography variant="caption" color="#10b981" fontWeight="medium">
                    Secure
                  </MDTypography>
                </MDBox>

                <MDButton
                  variant="contained"
                  onClick={() => handlePaymentMethodSelection('Card')}
                  size="small"
                  sx={{
                    bgcolor: '#8b5cf6',
                    color: 'white',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      bgcolor: '#7c3aed',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 20px rgba(139, 92, 246, 0.3)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Next
                </MDButton>
              </MDBox>
            </Card>
         </Fade>
       </Modal>

      <Footer />
    </DashboardLayout>
  );
}

export default Membership;
