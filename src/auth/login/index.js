import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import { notification } from "antd";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayoutLanding from "layouts/authentication/components/BasicLayoutLanding";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import AuthService from "services/auth-service";
import ShopService from "services/shop-service";
import { AuthContext } from "context";
import axios from "axios";

function Login() {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ emailError: false, passwordError: false });
  const [credentialsErrors, setCredentialsError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [shopId, setShopId] = useState("");

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const changeHandler = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (inputs.email.trim().length === 0 || !inputs.email.trim().match(mailFormat)) {
      setErrors({ ...errors, emailError: true });
      setLoading(false);
      return;
    }

    if (inputs.password.trim().length < 6) {
      setErrors({ ...errors, passwordError: true });
      setLoading(false);
      return;
    }

    const myData = {
      data: {
        type: "token",
        attributes: { email: inputs.email, password: inputs.password },
      },
    };

    try {
      const response = await AuthService.login(myData);

      // Temporarily store token so we can call protected endpoints before final redirect
      const accessToken = response?.access_token;
      if (accessToken) {
        localStorage.setItem("token", accessToken);
      }

      // Default success toast
      notification.success({
        message: "Sign in successful!",
        description: "You have signed in successfully.",
        placement: "topRight",
      });

      // Post-login validations for supplier
      let shouldRedirectToProfile = false;
      let postLoginNotice = null;
      try {
        const profileRes = await AuthService.getProfile();
        const isOwner = Boolean(profileRes?.data?.attributes?.is_owner);
        if (isOwner) {
          const shopRes = await ShopService.get();
          const shop = Array.isArray(shopRes?.shop) ? shopRes.shop[0] : undefined;

          if (!shop) {
            shouldRedirectToProfile = true;
            postLoginNotice = {
              message: "Please submit your supplier proposal",
              description: (
                <span>
                  You have not created your shop yet. Go to Profile to submit your proposal for admin approval.
                </span>
              ),
            };
          } else {
            const notApproved =
              shop?.isApproved === false ||
              shop?.approved === false ||
              shop?.approval === false ||
              shop?.status === "PENDING" ||
              shop?.approvalStatus === "PENDING";
            if (notApproved) {
              shouldRedirectToProfile = true;
              postLoginNotice = {
                message: "Your proposal is pending approval",
                description: (
                  <span>
                    Your shop is awaiting admin approval. You can review or update your details in Profile.
                  </span>
                ),
              };
            }
          }
        }
      } catch (ignored) {
        // If any of the extra checks fail, do not block login; proceed with default navigation.
      }

      // Finalize login in context (persists token and navigates to dashboard by default)
      authContext.login(accessToken);

      // If validations require action, redirect to profile and show a notice
      if (shouldRedirectToProfile && postLoginNotice) {
        navigate("/profile", { replace: true });
        notification.info({
          message: postLoginNotice.message,
          description: postLoginNotice.description,
          placement: "topRight",
        });
      }
    } catch (res) {
      if (res?.message) {
        setCredentialsError(res.message);
      } else if (Array.isArray(res?.errors) && res.errors.length > 0) {
        setCredentialsError(res.errors[0].detail);
      } else {
        setCredentialsError("An unknown error occurred.");
      }

      const errorText = res?.message || res?.errors?.[0]?.detail || "";
      // Prompt unregistered users to register
      if (/not\s*found|no\s*account|unregister/i.test(errorText)) {
        notification.warning({
          message: "No account found",
          description: (
            <span>
              It looks like you don’t have an account yet. <Link to="/auth/register">Register now</Link>.
            </span>
          ),
          placement: "topRight",
        });
      }
      // If backend signals unapproved directly
      if (/not\s*approved|pending\s*approval/i.test(errorText)) {
        notification.info({
          message: "Supplier not approved",
          description: (
            <span>
              Please submit your proposal for admin approval in <Link to="/profile">Profile</Link>.
            </span>
          ),
          placement: "topRight",
        });
      }
    } finally {
      setLoading(false);
      setInputs({ email: "", password: "" });
      setErrors({ emailError: false, passwordError: false });
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenParam = queryParams.get("token");
    const shopIdParam = queryParams.get("shopId");
    setToken(tokenParam);
    setShopId(shopIdParam);

    const sendDataToBackend = async () => {
      try {
        const base = process.env.REACT_APP_API_URL || "/";
        const url = base.endsWith("/") ? `${base}api/v1/auth/loginAsAdmin` : `${base}/api/v1/auth/loginAsAdmin`;
        const response = await axios.post(url, {
          token: tokenParam,
          shopId: shopIdParam,
        });

        // Persist token and go straight to dashboard
        authContext.login(response.data.access_token);

        // Optionally remember the shop context for later requests/screens
        if (shopIdParam) {
          localStorage.setItem("impersonatedShopId", shopIdParam);
        }

        // Clean sensitive params from the URL
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (error) {
        console.error("Admin SSO login failed:", error?.response?.data || error?.message);
        // Surface a concise message to the user
        try {
          const detail = error?.response?.data?.message || "Invalid or expired admin token";
          setCredentialsError(detail);
        } catch (_) {}
      }
    };

    if (tokenParam && shopIdParam) {
      sendDataToBackend();
    }
  }, [authContext]);

  return (
    <BasicLayoutLanding image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign in
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
            {[FacebookIcon, GitHubIcon, GoogleIcon].map((Icon, index) => (
              <Grid item xs={2} key={index}>
                <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                  <Icon color="inherit" />
                </MDTypography>
              </Grid>
            ))}
          </Grid>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" method="POST" onSubmit={submitHandler}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={inputs.email}
                name="email"
                onChange={changeHandler}
                error={errors.emailError}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                name="password"
                value={inputs.password}
                onChange={changeHandler}
                error={errors.passwordError}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" justifyContent="space-between" ml={-1}>
              <MDBox>
                <Switch checked={rememberMe} onChange={handleSetRememberMe} />
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color="text"
                  onClick={handleSetRememberMe}
                  sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                >
                  &nbsp;&nbsp;Remember me
                </MDTypography>
              </MDBox>

              <MDTypography
                component={Link}
                to="/auth/register"
                variant="button"
                fontWeight="bold"
                color="info"
                sx={{ textDecoration: "none", mr: 1 }}
              >
                Go to the Register...
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </MDButton>
            </MDBox>
            {credentialsErrors && (
              <MDTypography variant="caption" color="error" fontWeight="light">
                {credentialsErrors}
              </MDTypography>
            )}
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Forgot your password? Reset it{" "}
                <MDTypography
                  component={Link}
                  to="/auth/forgot-password"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  here
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayoutLanding>
  );
}

export default Login;
