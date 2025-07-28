import { useState } from "react";
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

function Register() {

  const [showPassword, setShowPassword] = useState(false);
  const [inputs, setInputs] = useState({
    name: "",
    last_name: "",
    phone_number: "",
    email: "",
    password: "",
    agree: false,
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [errors, setErrors] = useState({
    nameError: false,
    last_nameError: false,
    emailError: false,
    passwordError: false,
    phone_number: "",
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
      const response = await AuthService.register(myData);

      setInputs({
        name: "",
        last_name: "",
        phone_number: "",
        email: "",
        password: "",
        agree: false,
      });

      setErrors({
        nameError: false,
        last_nameError: false,
        emailError: false,
        phone_numberError: false,
        passwordError: false,
        agreeError: false,
        error: false,
        errorText: "",
      });
    } catch (err) {
      setErrors({ ...errors, error: true, errorText: err.message });
      console.error(err);
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
            Sign Up
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
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
    </CoverLayout>
  );
}

export default Register;
