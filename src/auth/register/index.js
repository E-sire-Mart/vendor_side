import { useState, useEffect } from "react";
// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import IconButton from '@mui/material/IconButton'; // Assuming you're using MUI for IconButton
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

import AuthService from "services/auth-service";
import { AuthContext } from "context";
import { InputLabel } from "@mui/material";
import { notification } from "antd";

function Register() {

  const [showPassword, setShowPassword] = useState(false);
  const [isVendorToken, setIsVendorToken] = useState(null);
  const [inputs, setInputs] = useState({
    name: "",
    last_name: "",
    phone_number: "",
    email: "",
    password: "",
    store_name: "",
    social_media: "",
    agree: false,
  });

  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [errors, setErrors] = useState({
    nameError: false,
    last_nameError: false,
    emailError: false,
    passwordError: false,
    phone_numberError: false,
    store_nameError: false,
    social_mediaError: false,
    agreeError: false,
    error: false,
    errorText: "",
  });

  const changeHandler = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value,
    });
  };

  // Decode JWT payload safely (no verification, UI hint only)
  const decodeJwtPayload = (token) => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = atob(base64);
      return JSON.parse(json);
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    // Read URL parameters to pre-populate form
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const firstName = urlParams.get('firstName');
    const lastName = urlParams.get('lastName');
    const phoneNumber = urlParams.get('phoneNumber');

    if (email || firstName || lastName || phoneNumber) {
      setInputs(prev => ({
        ...prev,
        email: email || prev.email,
        name: firstName || prev.name,
        last_name: lastName || prev.last_name,
        phone_number: phoneNumber || prev.phone_number,
      }));
    }

    const token = localStorage.getItem("token");
    if (!token) return;
    const payload = decodeJwtPayload(token) || {};

    const vendorFlag = Boolean(
      payload.vendor === true ||
      payload.is_vendor === true ||
      /vendor/i.test(String(payload.role || payload.userType || payload.type || "")) ||
      (Array.isArray(payload.roles) && payload.roles.some((r) => /vendor/i.test(String(r))))
    );

    setIsVendorToken(vendorFlag);

    if (vendorFlag) {
      notification.info({
        message: "Vendor sign up",
        description: "Your token indicates a vendor account. Please continue to sign up.",
        placement: "topRight",
        duration: 4,
      });
    } else {
      notification.warning({
        message: "Register as supplier",
        description: "Your token is not vendor. Please register the supplier to proceed.",
        placement: "topRight",
        duration: 5,
      });
    }
  }, []);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await AuthService.resendVerification({ email: registeredEmail });
      notification.success({
        message: "Verification email sent!",
        description: "A new verification link has been sent to your email.",
        placement: "topRight",
        duration: 4,
      });
    } catch (error) {
      notification.error({
        message: "Failed to resend verification",
        description: "Please try again later or contact support.",
        placement: "topRight",
        duration: 4,
      });
      console.error("Resend verification error:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleNewRegistration = () => {
    setIsRegistered(false);
    setRegisteredEmail("");
    setInputs({
      name: "",
      last_name: "",
      phone_number: "",
      email: "",
      password: "",
      store_name: "",
      social_media: "",
      agree: false,
    });
    setErrors({
      nameError: false,
      last_nameError: false,
      emailError: false,
      passwordError: false,
      phone_numberError: false,
      store_nameError: false,
      social_mediaError: false,
      agreeError: false,
      error: false,
      errorText: "",
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (inputs.name.trim().length === 0) {
      setErrors({ ...errors, nameError: true });
      return;
    }

    if (inputs.phone_number.trim().length === 0) {
      setErrors({ ...errors, phone_numberError: true });
      return;
    }

    if (inputs.email.trim().length === 0 || !inputs.email.trim().match(mailFormat)) {
      setErrors({ ...errors, emailError: true });
      return;
    }

    if (inputs.password.trim().length < 8) {
      setErrors({ ...errors, passwordError: true });
      return;
    }

    if (inputs.store_name.trim().length === 0) {
      setErrors({ ...errors, store_nameError: true });
      return;
    }

    if (inputs.social_media.trim().length === 0) {
      setErrors({ ...errors, social_mediaError: true });
      return;
    }

    if (inputs.agree === false) {
      setErrors({ ...errors, agreeError: true });
      return;
    }

    // here will be the post action to add a user to the db
    const newUser = {
      first_name: inputs.name,
      last_name: inputs.last_name,
      email: inputs.email,
      password: inputs.password,
      phone_number: inputs.phone_number,
      store_name: inputs.store_name,
      social_media: inputs.social_media,
      is_owner: true
    };

    const myData = {
      data: {
        type: "users",
        attributes: { ...newUser, password_confirmation: newUser.password, is_owner: true },
        relationships: {
          roles: {
            data: [
              {
                type: "roles",
                id: "1",
              },
            ],
          },
        },
      },
    };

    try {
      console.log("Sending registration data:", JSON.stringify(myData, null, 2));
      const response = await AuthService.register(myData);

      // Show success notification based on response
      const isUpgrade = response.message && response.message.includes("upgraded");
      const isPendingApproval = response.status === "pending_approval";
      
      if (isPendingApproval) {
        notification.warning({
          message: "Store Registration Submitted",
          description: "Your store registration has been submitted and is pending admin approval. You will be notified once approved.",
          placement: "topRight",
          duration: 8,
        });
      } else {
        notification.success({
          message: isUpgrade ? "Account Upgraded!" : "Registration successful!",
          description: isUpgrade 
            ? "Your account has been successfully upgraded to store owner. You can now manage your store."
            : "Please check your email to verify your account.",
          placement: "topRight",
          duration: 5,
        });
      }

      // Set registration success state
      setIsRegistered(true);
      setRegisteredEmail(inputs.email);

      setInputs({
        name: "",
        last_name: "",
        phone_number: "",
        email: "",
        password: "",
        store_name: "",
        social_media: "",
        agree: false,
      });

      setErrors({
        nameError: false,
        last_nameError: false,
        emailError: false,
        phone_numberError: false,
        passwordError: false,
        store_nameError: false,
        social_mediaError: false,
        agreeError: false,
        error: false,
        errorText: "",
      });
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.message || err.error || "Please try again.";
      setErrors({ ...errors, error: true, errorText: errorMessage });
      notification.error({
        message: "Registration failed",
        description: errorMessage,
        placement: "topRight",
        duration: 4,
      });
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            {isVendorToken === false ? "Register Supplier" : "Sign Up"}
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
        {isVendorToken !== null && (
          <MDBox px={3} pb={1}>
            <MDTypography variant="caption" color={isVendorToken ? "success" : "warning"}>
              {isVendorToken
                ? "Vendor detected in token: proceed with sign up."
                : "No vendor in token: you are registering the supplier."}
            </MDTypography>
          </MDBox>
        )}
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" method="POST" onSubmit={submitHandler}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="First Name"
                variant="standard"
                fullWidth
                name="name"
                value={inputs.name}
                onChange={changeHandler}
                error={errors.nameError}
                inputProps={{
                  autoComplete: "name",
                  form: {
                    autoComplete: "off",
                  },
                }}
              />
              {errors.nameError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  The name can not be empty
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Last Name"
                variant="standard"
                fullWidth
                name="last_name"
                value={inputs.last_name}
                onChange={changeHandler}
                error={errors.last_nameError}
                inputProps={{
                  autoComplete: "name",
                  form: {
                    autoComplete: "off",
                  },
                }}
              />
              {errors.last_nameError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  The name can not be empty
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="tel"
                label="Phone Number"
                variant="standard"
                fullWidth
                name="phone_number"
                value={inputs.phone_number}
                onChange={changeHandler}
                error={errors.phone_numberError}
                inputProps={{
                  autoComplete: "tel",
                  form: {
                    autoComplete: "off",
                  },
                }}
              />
              {errors.phone_numberError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  Please enter a valid phone number
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                variant="standard"
                fullWidth
                value={inputs.email}
                name="email"
                onChange={changeHandler}
                error={errors.emailError}
                inputProps={{
                  autoComplete: "email",
                  form: {
                    autoComplete: "off",
                  },
                }}
              />
              {errors.emailError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  The email must be valid
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2} display="flex" alignItems="center">
              <MDInput
                type={showPassword ? "text" : "password"}
                label="Password"
                variant="standard"
                fullWidth
                name="password"
                value={inputs.password}
                onChange={changeHandler}
                error={errors.passwordError}
              />
              <IconButton
                onClick={togglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
              {errors.passwordError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  The password must be of at least 8 characters
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Store Name"
                variant="standard"
                fullWidth
                name="store_name"
                value={inputs.store_name}
                onChange={changeHandler}
                error={errors.store_nameError}
                inputProps={{
                  autoComplete: "organization",
                  form: {
                    autoComplete: "off",
                  },
                }}
              />
              {errors.store_nameError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  Store name is required
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Social Media (Instagram, Facebook, etc.)"
                variant="standard"
                fullWidth
                name="social_media"
                value={inputs.social_media}
                onChange={changeHandler}
                error={errors.social_mediaError}
                inputProps={{
                  autoComplete: "url",
                  form: {
                    autoComplete: "off",
                  },
                }}
              />
              {errors.social_mediaError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  Social media information is required
                </MDTypography>
              )}
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox name="agree" id="agree" onChange={changeHandler} />
              <InputLabel
                variant="standard"
                fontWeight="regular"
                color="text"
                sx={{ lineHeight: "1.5", cursor: "pointer" }}
                htmlFor="agree"
              >
                &nbsp;&nbsp;I agree to the&nbsp;
              </InputLabel>
              <MDTypography
                component={Link}
                to="/auth/login"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Terms and Conditions
              </MDTypography>
            </MDBox>
            {errors.agreeError && (
              <MDTypography variant="caption" color="error" fontWeight="light">
                You must agree to the Terms and Conditions
              </MDTypography>
            )}
            {errors.error && (
              <MDTypography variant="caption" color="error" fontWeight="light">
                {errors.errorText}
              </MDTypography>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit">
                sign up
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/auth/login"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>

      {/* Verification Success Message */}
      {isRegistered && (
        <Card sx={{ mt: 2, p: 3, textAlign: "center" }}>
          <MDBox>
            <MDTypography variant="h6" color="success" fontWeight="medium" mb={2}>
              ✅ Registration Successful!
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={3}>
              We've sent a verification email to <strong>{registeredEmail}</strong>
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={3}>
              Please check your email and click the "Verify" link to activate your account.
            </MDTypography>
            <MDBox mt={3}>
              <MDButton
                variant="outlined"
                color="info"
                onClick={handleResendVerification}
                disabled={isResending}
                sx={{ mr: 2 }}
              >
                {isResending ? "Sending..." : "Resend Verification Email"}
              </MDButton>
              <MDButton
                variant="gradient"
                color="info"
                component={Link}
                to="/auth/login"
                sx={{ mr: 2 }}
              >
                Go to Login
              </MDButton>
              <MDButton
                variant="text"
                color="info"
                onClick={handleNewRegistration}
              >
                Register Another Account
              </MDButton>
            </MDBox>
          </MDBox>
        </Card>
      )}
    </CoverLayout>
  );
}

export default Register;
