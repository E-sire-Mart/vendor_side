import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import Alert from "@mui/material/Alert";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// @mui icons
import Icon from "@mui/material/Icon";

function SendComments() {
  const [commentData, setCommentData] = useState({
    title: "",
    message: "",
    type: "general",
    priority: "medium",
    rating: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const commentTypes = [
    { value: "general", label: "General Feedback", icon: "feedback" },
    { value: "bug", label: "Bug Report", icon: "bug_report" },
    { value: "feature", label: "Feature Request", icon: "lightbulb" },
    { value: "complaint", label: "Complaint", icon: "report_problem" },
    { value: "compliment", label: "Compliment", icon: "thumb_up" }
  ];

  const priorityLevels = [
    { value: "low", label: "Low", color: "success" },
    { value: "medium", label: "Medium", color: "warning" },
    { value: "high", label: "High", color: "error" },
    { value: "urgent", label: "Urgent", color: "error" }
  ];

  const handleInputChange = (field, value) => {
    setCommentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!commentData.title.trim() || !commentData.message.trim()) {
      setSubmitStatus({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus({ 
        type: "success", 
        message: "Your comment has been sent successfully! We'll review it and get back to you soon." 
      });
      
      // Reset form after successful submission
      setCommentData({
        title: "",
        message: "",
        type: "general",
        priority: "medium",
        rating: 0
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const isFormValid = commentData.title.trim() && commentData.message.trim();

  return (
    <Card>
      <MDBox p={3}>
        {/* Header */}
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
              Send Comments
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Share your feedback, report issues, or request features
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Status Alert */}
        {submitStatus && (
          <MDBox mb={3}>
            <Alert severity={submitStatus.type} onClose={() => setSubmitStatus(null)}>
              {submitStatus.message}
            </Alert>
          </MDBox>
        )}

        {/* Comment Type Selection */}
        <MDBox mb={3}>
          <MDTypography variant="body2" fontWeight="medium" mb={2}>
            Comment Type
          </MDTypography>
          <Grid container spacing={1}>
            {commentTypes.map((type) => (
              <Grid item key={type.value}>
                <Chip
                  icon={<Icon>{type.icon}</Icon>}
                  label={type.label}
                  onClick={() => handleInputChange("type", type.value)}
                  color={commentData.type === type.value ? "primary" : "default"}
                  variant={commentData.type === type.value ? "filled" : "outlined"}
                  sx={{ cursor: "pointer" }}
                />
              </Grid>
            ))}
          </Grid>
        </MDBox>

        {/* Priority Selection */}
        <MDBox mb={3}>
          <MDTypography variant="body2" fontWeight="medium" mb={2}>
            Priority Level
          </MDTypography>
          <Grid container spacing={1}>
            {priorityLevels.map((priority) => (
              <Grid item key={priority.value}>
                <Chip
                  label={priority.label}
                  onClick={() => handleInputChange("priority", priority.value)}
                  color={commentData.priority === priority.value ? priority.color : "default"}
                  variant={commentData.priority === priority.value ? "filled" : "outlined"}
                  sx={{ cursor: "pointer" }}
                />
              </Grid>
            ))}
          </Grid>
        </MDBox>

        {/* Rating */}
        <MDBox mb={3}>
          <MDTypography variant="body2" fontWeight="medium" mb={1}>
            Overall Experience Rating
          </MDTypography>
          <Rating
            value={commentData.rating}
            onChange={(event, newValue) => handleInputChange("rating", newValue)}
            size="large"
          />
          {commentData.rating > 0 && (
            <MDTypography variant="caption" color="text" ml={1}>
              {commentData.rating === 1 ? "Poor" : 
               commentData.rating === 2 ? "Fair" : 
               commentData.rating === 3 ? "Good" : 
               commentData.rating === 4 ? "Very Good" : "Excellent"}
            </MDTypography>
          )}
        </MDBox>

        {/* Title Input */}
        <MDBox mb={3}>
          <TextField
            fullWidth
            label="Title"
            placeholder="Brief summary of your comment"
            value={commentData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            variant="outlined"
            size="medium"
            required
          />
        </MDBox>

        {/* Message Input */}
        <MDBox mb={3}>
          <TextField
            fullWidth
            label="Message"
            placeholder="Please provide detailed information about your comment, issue, or request..."
            value={commentData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            variant="outlined"
            multiline
            rows={4}
            required
          />
        </MDBox>

        {/* Submit Button */}
        <MDBox display="flex" justifyContent="flex-end">
          <MDButton
            variant="gradient"
            color="primary"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            startIcon={isSubmitting ? <Icon>hourglass_empty</Icon> : <Icon>send</Icon>}
          >
            {isSubmitting ? "Sending..." : "Send Comment"}
          </MDButton>
        </MDBox>

        {/* Additional Info */}
        <MDBox mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
          <MDTypography variant="caption" color="text" display="flex" alignItems="center">
            <Icon sx={{ fontSize: 16, mr: 1, color: "info.main" }}>info</Icon>
            Your comments help us improve our service. We typically respond within 24-48 hours.
          </MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default SendComments;


