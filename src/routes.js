import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Notifications from "layouts/notifications";
import Membership from "layouts/membership";
import Profile from "layouts/profile";

import OrderTables from "layouts/orders_table"
import DeliveryTables from "layouts/delivery_table"
import Comments from "layouts/comments"
import Chat from "layouts/chat"

import Login from "auth/login";
import Register from "auth/register";
import ForgotPassword from "auth/forgot-password";
import ResetPassword from "auth/reset-password";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Product Tables",
    key: "tables/Products",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables/Products",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Order Tables",
    key: "tables/Orders",
    icon: <Icon fontSize="small">grading</Icon>,
    route: "/tables/Orders",
    component: <OrderTables />,
  },
  {
    type: "collapse",
    name: "Delivery boy Tables",
    key: "tables/Deiliverys",
    icon: <Icon fontSize="small">delivery_dining</Icon>,
    route: "/tables/Deiliverys",
    component: <DeliveryTables />,
  },

  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "Membership",
    key: "membership",
    icon: <Icon fontSize="small">workspace_premium</Icon>,
    route: "/membership",
    component: <Membership />,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },

  {
    type: "collapse",
    name: "Comments",
    key: "comments",
    icon: <Icon fontSize="small">comment</Icon>,
    route: "/comments",
    component: <Comments />,
  },
  {
    type: "collapse",
    name: "Chat",
    key: "chat",
    icon: <Icon fontSize="small">question_answer</Icon>,
    route: "/chat",
    component: <Chat />,
  },
  {
    type: "auth",
    name: "Login",
    key: "login",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/auth/login",
    component: <Login />,
  },
  {
    type: "auth",
    name: "Register",
    key: "register",
    icon: <Icon fontSize="small">reigster</Icon>,
    route: "/auth/register",
    component: <Register />,
  },
  {
    type: "auth",
    name: "Forgot Password",
    key: "forgot-password",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/auth/forgot-password",
    component: <ForgotPassword />,
  },
  {
    type: "auth",
    name: "Reset Password",
    key: "reset-password",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/auth/reset-password",
    component: <ResetPassword />,
  },
];

export default routes;
