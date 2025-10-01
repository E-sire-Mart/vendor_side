/**
=========================================================
* Material Dashboard 2 React - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function MembershipCard({ color, title, plan, price, icon, features }) {
  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" pt={1} px={2}>
        <MDBox
          variant="gradient"
          bgColor={color}
          color={color === "light" ? "dark" : "white"}
          coloredShadow={color}
          borderRadius="xl"
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="4rem"
          height="4rem"
          mt={-3}
        >
          <Icon fontSize="medium" color="inherit">
            {icon}
          </Icon>
        </MDBox>
        <MDBox textAlign="right" lineHeight={1.25}>
          <MDTypography variant="button" fontWeight="light" color="text">
            {title}
          </MDTypography>
          <MDTypography variant="h4">{plan}</MDTypography>
          <MDTypography variant="h6" color="info" fontWeight="bold">
            ${price}/month
          </MDTypography>
        </MDBox>
      </MDBox>
      <Divider />
      <MDBox pb={2} px={2}>
        <MDTypography variant="button" fontWeight="bold" color="text" mb={1}>
          Features:
        </MDTypography>
        {features && features.length > 0 && (
          <MDBox>
            {features.slice(0, 3).map((feature, index) => (
              <MDTypography
                key={index}
                component="p"
                variant="caption"
                color="text"
                display="flex"
                alignItems="center"
                mb={0.5}
              >
                <Icon fontSize="small" color="success" sx={{ mr: 1 }}>
                  check_circle
                </Icon>
                {feature}
              </MDTypography>
            ))}
            {features.length > 3 && (
              <MDTypography
                component="p"
                variant="caption"
                color="info"
                fontWeight="medium"
              >
                +{features.length - 3} more features
              </MDTypography>
            )}
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of MembershipCard
MembershipCard.defaultProps = {
  color: "info",
  features: [],
};

// Typechecking props for the MembershipCard
MembershipCard.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  title: PropTypes.string.isRequired,
  plan: PropTypes.string.isRequired,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  features: PropTypes.arrayOf(PropTypes.string),
};

export default MembershipCard;

