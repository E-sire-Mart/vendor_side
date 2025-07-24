// @mui material components
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import MDButton from '../../components/MDButton';
// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import Header from "layouts/profile/components/Header";

import { useNavigate } from "react-router-dom";
import ShopService from '../../services/shop-service.js';
function Overview() {

  const [shops, setShops] = useState([]);
  const links = [
    // {name: '11111', href: '11111'},
  ]
  const navigate = useNavigate();
  const fetchData = async () => {
    try {
      const response = await ShopService.get();
      setShops(response?.shop[0]);
    } catch (error) {
      console.error('Error fetching shop data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenUpdateProfile = () => {
    fetchData();
    // notification.success({
    //   message: 'Shop Update successfully',
    // });
  };

  const handleDeleteShop = async () => {
    await ShopService.delete(shops._id);
    localStorage.removeItem("token");
   // setIsAuthenticated(false);
    navigate("/auth/login");
    // notification.success({
    //   message: 'Shop Delepted successfully',
    // });
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header owner={shops?.owner}>
        <MDBox mt={5} mb={8}>
          <Grid container spacing={1}>
            <Grid item xs={4} md={4} xl={8} sx={{ display: "flex" }}>
              <Divider orientation="vertical" sx={{ ml: -2, mr: 1 }} />
              {shops &&
                <ProfileInfoCard
                  title="Shop Description"
                  shopName={shops?.name}
                  description={shops?.description}
                  info={{
                    fullName: shops?.name,
                    mobile: shops?.owner?.phone_number,
                    email: shops?.owner?.email,
                  }}
                  social={[
                    {
                      link: "#",
                      icon: <FacebookIcon />,
                      color: "facebook",
                    },
                    {
                      link: "#",
                      icon: <TwitterIcon />,
                      color: "twitter",
                    },
                    {
                      link: "#",
                      icon: <InstagramIcon />,
                      color: "instagram",
                    },
                  ]}
                  action={{ route: "", tooltip: "Edit Profile" }}
                  shadow={false}
                  shop={shops}
                  handleOpenUpdateProfile={handleOpenUpdateProfile}
                />
              }

            </Grid>
            <Grid item xs={8} md={8} xl={4}>
              {/* Delete shop button */}
              <MDButton variant="contained" color="error" onClick={handleDeleteShop}>
                Delete Shop
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>
      </Header>
      <Footer links={links}/>
    </DashboardLayout>
  );
}

export default Overview;
