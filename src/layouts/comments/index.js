import { useState, useEffect } from "react";
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
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import WarningIcon from "@mui/icons-material/Warning";
// Ant Design Upload for multi-image attachments
import { Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

function Comments() {
  const [storeComments, setStoreComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [commentData, setCommentData] = useState({
    title: "",
    message: "",
    type: "general",
    priority: "medium",
    rating: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState([]);
  const [sendFiles, setSendFiles] = useState([]);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [showAntiNotification, setShowAntiNotification] = useState(false);
  const [antiNotificationMessage, setAntiNotificationMessage] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  // Admin threads (vendor → admin) - view only
  const [adminThreads, setAdminThreads] = useState([]);
  const [loadingAdminThreads, setLoadingAdminThreads] = useState(false);
  // Edit modal for vendor→admin thread
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);

  const formatDateTime = (iso) => {
    try { return new Date(iso).toLocaleString(); } catch { return ''; }
  };

  // Anti-design notification function
  const triggerAntiNotification = (message) => {
    setAntiNotificationMessage(message);
    setShowAntiNotification(true);
    setTimeout(() => setShowAntiNotification(false), 5000);
  };

  // Delete comment function
  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).access_token : localStorage.getItem('token');
      const base = (process.env.REACT_APP_SERVER_URL || 'http://localhost:3003').replace(/\/+$/,'');
      
      const res = await fetch(`${base}/api/v1/comments/${commentToDelete._id || commentToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        // Remove comment from local state (both store comments and admin threads)
        const deletedId = (commentToDelete._id || commentToDelete.id);
        setStoreComments(prev => prev.filter(c => (c._id || c.id) !== deletedId));
        setAdminThreads(prev => prev.filter(c => (c._id || c.id) !== deletedId));
        // Show anti-design notification
        triggerAntiNotification('Comment deleted! 🗑️');
        // Close modal
        setDeleteModalOpen(false);
        setCommentToDelete(null);
      } else {
        const errorData = await res.json();
        console.error('Failed to delete comment:', errorData);
        triggerAntiNotification(`Failed to delete comment: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      triggerAntiNotification('Failed to delete comment. Please try again.');
    }
  };

  // polling helper
  const refreshAdminThreads = async () => {
    try {
      setLoadingAdminThreads(true);
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).access_token : localStorage.getItem('token');
      const base = (process.env.REACT_APP_SERVER_URL || 'http://localhost:3003').replace(/\/+$/,'');
      const res = await fetch(`${base}/api/v1/comments?role=admin`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setAdminThreads(Array.isArray(data?.data) ? data.data : []);
    } catch (_) {
      setAdminThreads([]);
    } finally {
      setLoadingAdminThreads(false);
    }
  };

  useEffect(() => {
    // Load comments for current vendor's store
    const loadComments = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem('user');
        const token = userData ? JSON.parse(userData).access_token : localStorage.getItem('token');
        const base = (process.env.REACT_APP_SERVER_URL || 'http://localhost:3003').replace(/\/+$/,'');

        // Try direct vendor shop endpoint; avoid trailing slashes causing // in URL
        let storeId = null;
        try {
          const shopRes = await fetch(`${base}/api/v1/shop`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (shopRes.ok) {
            const shopJson = await shopRes.json();
            const shop = Array.isArray(shopJson?.shop) ? shopJson.shop[0] : shopJson?.shop;
            storeId = shop?._id || shop?.id || null;
          }
        } catch (_) {}

        if (storeId) {
          const res = await fetch(`${base}/api/v1/comments?role=vendor&storeId=${storeId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          setStoreComments(Array.isArray(data?.data) ? data.data : []);
        } else {
          setStoreComments([]);
        }
      } catch (e) {
        setStoreComments([]);
      } finally {
        setLoading(false);
      }
    };
    loadComments();
    refreshAdminThreads();
    const intervalId = setInterval(refreshAdminThreads, 30000);
    return () => clearInterval(intervalId);
  }, []);

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
    try {
      setIsSubmitting(true);
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).access_token : localStorage.getItem('token');
      const base = (process.env.REACT_APP_SERVER_URL || 'http://localhost:3003').replace(/\/+$/,'');

      const formData = new FormData();
      formData.append('title', commentData.title.trim());
      formData.append('content', commentData.message.trim());
      formData.append('type', commentData.type);
      formData.append('priority', commentData.priority);
      formData.append('rating', String(commentData.rating || 0));
      formData.append('toRole', 'admin');
      (sendFiles || []).slice(0,5).forEach((f) => {
        const fileObj = f.originFileObj || f;
        if (fileObj) formData.append('attachments', fileObj);
      });

      const res = await fetch(`${base}/api/v1/comments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const json = await res.json();
      if (res.ok) {
        setSubmitStatus({ type: 'success', message: 'Your message has been sent to Admin.' });
        triggerAntiNotification('Message sent to Admin! ✉️');
        setCommentData({ title: '', message: '', type: 'general', priority: 'medium', rating: 0 });
        setSendFiles([]);
        // Optimistically prepend to adminThreads so it renders immediately
        setAdminThreads(prev => [{
          _id: json?.data?._id || Math.random().toString(36).slice(2),
          id: json?.data?.id,
          title: commentData.title.trim(),
          content: commentData.message.trim(),
          type: commentData.type,
          priority: commentData.priority,
          rating: commentData.rating || 0,
          fromName: (JSON.parse(localStorage.getItem('user')||'{}').first_name || '') + ' ' + (JSON.parse(localStorage.getItem('user')||'{}').last_name || ''),
          createdAt: new Date().toISOString(),
          isResolved: false,
          attachments: [],
          replies: []
        }, ...prev]);
        // Also re-fetch to ensure server state matches
        refreshAdminThreads();
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus({ type: 'error', message: json.message || 'Failed to send. Please try again.' });
        triggerAntiNotification(`Failed to send: ${json.message || 'Unknown error'}`);
      }
    } catch (e) {
      setSubmitStatus({ type: 'error', message: 'Failed to send. Please try again.' });
      triggerAntiNotification('Failed to send. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = commentData.title.trim() && commentData.message.trim();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDBox mb={3}>
              <Typography variant="h4" gutterBottom>
                Comments & Feedback
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Share your feedback, report issues, or request new features. We value your input!
              </Typography>
            </MDBox>
          </Grid>
          
          <Grid item xs={12} md={8}>
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
                  <MDBox mt={1}>
                    <Upload
                      multiple
                      listType="picture"
                      fileList={sendFiles}
                      onChange={({ fileList }) => setSendFiles(fileList)}
                      beforeUpload={() => false}
                      accept="image/*"
                    >
                      <MDButton variant="outlined" color="info" startIcon={<Icon>cloud_upload</Icon>}>
                        Add Images
                      </MDButton>
                    </Upload>
                  </MDBox>
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

                {/* Store Comments List */}
                <MDBox mt={4}>
                  <MDTypography variant="h6" gutterBottom>
                    Comments for Your Store
                  </MDTypography>
                  {loading ? (
                    <MDTypography variant="body2" color="text.secondary">Loading...</MDTypography>
                  ) : storeComments.length === 0 ? (
                    <MDTypography variant="body2" color="text.secondary">No comments yet.</MDTypography>
                  ) : (
                                         storeComments.map((c) => (
                                           <Card key={c._id || c.id} style={{ marginTop: 12, padding: 12, position: 'relative', overflow: 'hidden' }}>
                      {/* Resolved Indicator - Only for main comments, not replies */}
                      {c.isResolved && !c.isReply && (
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          zIndex: 1,
                          pointerEvents: 'none',
                          maxHeight: '32px',
                          overflow: 'hidden'
                        }}>
                          <Chip 
                            size="small" 
                            color="error" 
                            label="✓ Resolved"
                            style={{
                              backgroundColor: '#fef2f2',
                              color: '#991b1b',
                              border: '1px solid #fecaca',
                              fontWeight: '500',
                              maxHeight: '24px',
                              fontSize: '0.75rem'
                            }}
                          />
                        </div>
                      )}
                        <MDTypography variant="body2" fontWeight="medium" gutterBottom sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {c.title || 'Untitled'}
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary" gutterBottom>
                          {c.content}
                        </MDTypography>
                        <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                          <Rating size="small" value={Number(c.rating) || 0} readOnly />
                          <MDTypography variant="caption" color="text.secondary">{Number(c.rating) || 0} / 5</MDTypography>
                          {(c.fromName || c.fromEmail || c.fromRole) && (
                            <Chip size="small" label={`From: ${c.fromName || c.fromEmail || c.fromRole}`}/>
                          )}
                        </MDBox>
                        <MDBox display="flex" gap={1} alignItems="center" mb={1}>
                          <Chip size="small" label={`Priority: ${c.priority || 'medium'}`} />
                          <Chip size="small" label={`Type: ${c.type || 'general'}`} />
                          {c.fromName && (
                            <Chip size="small" label={`Owner: ${c.fromName}`} />
                          )}
                          {c.createdAt && (
                            <Chip 
                              size="small" 
                              variant="outlined" 
                              label={new Date(c.createdAt).toLocaleString()} 
                              sx={{
                                maxWidth: 180,
                                '& .MuiChip-label': {
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }
                              }}
                            />
                          )}
                        </MDBox>
                        {Array.isArray(c.attachments) && c.attachments.length > 0 && (
                          <MDBox display="flex" gap={1} flexWrap="wrap" mb={1}>
                            {c.attachments.map((p, idx) => {
                              const base = (process.env.REACT_APP_SERVER_URL || 'http://localhost:3003').replace(/\/+$/,'');
                              const src = `${base}/${String(p).replace(/^\/+/, '')}`;
                              return (
                                <img key={idx} src={src} alt="attachment" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                              );
                            })}
                          </MDBox>
                        )}
                        <MDBox display="flex" gap={1}>
                          {/* Reply button - only enabled for unresolved comments */}
                          {!c.isResolved ? (
                            <MDButton size="small" color="info" onClick={() => { setActiveCommentId(c._id || c.id); setReplyText(""); setReplyOpen(true); }}>Reply</MDButton>
                          ) : (
                            <MDButton size="small" color="info" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Reply (Resolved)</MDButton>
                          )}
                          {!c.isResolved && (
                            <MDButton size="small" color="success" onClick={async () => {
                              try {
                                const userData = localStorage.getItem('user');
                                const token = userData ? JSON.parse(userData).access_token : localStorage.getItem('token');
                                const base = (process.env.REACT_APP_SERVER_URL || 'http://localhost:3003').replace(/\/+$/,'');
                                const url = `${base}/api/v1/comments/${c._id || c.id}/resolve`;
                                
                                console.log('Resolving comment:', {
                                  commentId: c._id || c.id,
                                  url: url,
                                  token: token ? 'Present' : 'Missing',
                                  userData: userData ? 'Present' : 'Missing'
                                });
                                
                                const res = await fetch(url, {
                                  method: 'PATCH',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                
                                console.log('Response received:', {
                                  status: res.status,
                                  statusText: res.statusText,
                                  ok: res.ok,
                                  url: res.url
                                });
                                
                                if (res.ok) {
                                  setStoreComments(prev => prev.map(x => (x._id||x.id) === (c._id||c.id) ? { ...x, isResolved: true } : x));
                                  // Show anti-design notification
                                  triggerAntiNotification('Comment resolved! ✅');
                                } else {
                                  const errorData = await res.json();
                                  console.error('Failed to resolve comment:', errorData);
                                  triggerAntiNotification(`Failed to resolve comment: ${errorData.message || 'Unknown error'}`);
                                }
                              } catch {}
                            }}>Mark Resolved</MDButton>
                          )}
                          {c.isResolved && (
                            <MDButton 
                              size="small" 
                              color="error" 
                              onClick={() => {
                                setCommentToDelete(c);
                                setDeleteModalOpen(true);
                              }}
                            >
                              Delete
                            </MDButton>
                          )}
                        </MDBox>

                        {/* Display Replies */}
                        {Array.isArray(c.replies) && c.replies.length > 0 && (
                          <MDBox mt={3} pt={3} borderTop="1px solid #e5e7eb" style={{ position: 'relative', zIndex: 0, overflow: 'hidden' }}>
                            <MDTypography variant="body2" fontWeight="medium" mb={2} color="text.secondary">
                              Replies ({c.replies.length})
                            </MDTypography>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {c.replies.map((reply, idx) => (
                                <div key={idx} style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', position: 'relative' }}>
                                  {/* Ensure no resolved badge appears on replies */}
                                  {false && reply.isResolved && (
                                    <div style={{
                                      position: 'absolute',
                                      bottom: '8px',
                                      right: '8px',
                                      zIndex: 1
                                    }}>
                                      <Chip 
                                        size="small" 
                                        color="error" 
                                        label="✓ Resolved"
                                        style={{
                                          backgroundColor: '#fef2f2',
                                          color: '#991b1b',
                                          border: '1px solid #fecaca',
                                          fontWeight: '500'
                                        }}
                                      />
                                    </div>
                                  )}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                                      {(reply.authorName || reply.authorEmail) ? 
                                        `${reply.authorName || reply.authorEmail} (${reply.authorRole === 'vendor' ? 'Store Admin' : reply.authorRole === 'admin' ? 'Administrator' : 'User'})` : 
                                        (reply.authorRole === 'vendor' ? 'Store Admin' : reply.authorRole === 'admin' ? 'Administrator' : 'User')
                                      }
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                      {new Date(reply.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>{reply.content}</p>
                                  
                                  {/* Reply Attachments */}
                                  {reply.attachments && reply.attachments.length > 0 && (
                                    <div style={{ marginTop: '8px' }}>
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        {reply.attachments.map((attachment, idx2) => (
                                          <img
                                            key={idx2}
                                            src={`${(process.env.REACT_APP_SERVER_URL || 'http://localhost:3003').replace(/\/+$/,'')}/${String(attachment).replace(/^\/+/, '')}`}
                                            alt={`Reply attachment ${idx2 + 1}`}
                                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #d1d5db', cursor: 'pointer' }}
                                            onClick={() => window.open(`${(process.env.REACT_APP_SERVER_URL || 'http://localhost:3003').replace(/\/+$/,'')}/${String(attachment).replace(/^\/+/, '')}`, '_blank')}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </MDBox>
                        )}
                      </Card>
                    ))
                  )}
                </MDBox>

                

                

                {/* Reply Modal */}
                <Dialog open={replyOpen} onClose={() => setReplyOpen(false)} maxWidth="sm" fullWidth>
                  <DialogTitle>Reply to Comment</DialogTitle>
                  <DialogContent>
                    <TextField
                      autoFocus
                      margin="dense"
                      label="Your reply"
                      type="text"
                      fullWidth
                      multiline
                      minRows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <MDBox mt={1}>
                      <Upload
                        multiple
                        listType="picture"
                        fileList={replyFiles}
                        onChange={({ fileList }) => setReplyFiles(fileList)}
                        beforeUpload={() => false}
                        accept="image/*"
                      >
                        <MDButton variant="outlined" color="info" startIcon={<Icon>cloud_upload</Icon>}>
                          Add Images
                        </MDButton>
                      </Upload>
                    </MDBox>
                  </DialogContent>
                  <DialogActions>
                    <MDButton color="secondary" onClick={() => setReplyOpen(false)}>Cancel</MDButton>
                    <MDButton color="info" onClick={async () => {
                      if (!replyText.trim() || !activeCommentId) return;
                      try {
                        const userData = localStorage.getItem('user');
                        const token = userData ? JSON.parse(userData).access_token : localStorage.getItem('token');
                        const base = (process.env.REACT_APP_SERVER_URL || 'http://localhost:3003').replace(/\/+$/,'');
                        const fd = new FormData();
                        fd.append('content', replyText.trim());
                        (replyFiles || []).slice(0,5).forEach(f => {
                          const fileObj = f.originFileObj || f;
                          if (fileObj) fd.append('attachments', fileObj);
                        });
                        const res = await fetch(`${base}/api/v1/comments/${activeCommentId}/replies`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` },
                          body: fd
                        });
                        const json = await res.json();
                        if (res.ok) {
                          const updated = json?.data;
                          if (updated && (updated._id || updated.id)) {
                            setStoreComments(prev => prev.map(x => (x._id||x.id) === (updated._id||updated.id) ? updated : x));
                          } else {
                            const userDataObj = JSON.parse(localStorage.getItem('user') || '{}');
                            const authorName = userDataObj.first_name || userDataObj.last_name ? `${userDataObj.first_name || ''} ${userDataObj.last_name || ''}`.trim() : (userDataObj.username || userDataObj.email || '');
                            setStoreComments(prev => prev.map(x => (x._id||x.id) === activeCommentId ? { 
                              ...x, 
                              replies: [...(x.replies||[]), { 
                                content: replyText.trim(), 
                                authorRole: 'vendor', 
                                authorName: authorName,
                                authorEmail: userDataObj.email || '',
                                createdAt: new Date().toISOString(),
                                attachments: []
                              }] 
                            } : x));
                          }
                          setReplyOpen(false);
                          setReplyFiles([]);
                          triggerAntiNotification('Reply sent! 💬');
                        } else {
                          triggerAntiNotification(`Failed to reply: ${json?.message || 'Unknown error'}`);
                        }
                      } catch {}
                    }}>Send Reply</MDButton>
                  </DialogActions>
                </Dialog>

                {/* Additional Info */}
                <MDBox mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                  <MDTypography variant="caption" color="text" display="flex" alignItems="center">
                    <Icon sx={{ fontSize: 16, mr: 1, color: "info.main" }}>info</Icon>
                    Your comments help us improve our service. We typically respond within 24-48 hours.
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={3}>
              {/* Your Threads with Admin (read-only) - moved to sidebar */}
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDBox display="flex" alignItems="center" gap={1.5} mb={1}>
                      <Icon sx={{
                        fontSize: 32,
                        color: 'white',
                        bgcolor: 'info.main',
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)'
                      }}>forum</Icon>
                      <MDTypography
                        component="div"
                        sx={{
                          fontSize: { xs: '1.2rem', md: '1.35rem' },
                          fontWeight: 800,
                          letterSpacing: 0.4,
                          lineHeight: 1.2,
                          backgroundImage: 'linear-gradient(90deg, #111827, #3b82f6)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        Your Threads with Admin
                      </MDTypography>
                    </MDBox>
                    <MDBox sx={{ width: '100%', height: 3, background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)', borderRadius: 2, mb: 2 }} />
                    {loadingAdminThreads ? (
                      <MDTypography variant="body2" color="text.secondary">Loading...</MDTypography>
                    ) : (adminThreads || []).length === 0 ? (
                      <MDTypography variant="body2" color="text.secondary">No threads found.</MDTypography>
                    ) : (
                      adminThreads.map((c) => (
                        <Card key={c._id || c.id} style={{ marginTop: 12, padding: 14, borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
                          <MDTypography variant="body2" fontWeight="medium" gutterBottom sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {c.title || 'Untitled'}
                          </MDTypography>
                          <MDBox display="flex" gap={1} alignItems="center" mb={1} sx={{ flexWrap: 'wrap', minWidth: 0 }}>
                            <Chip size="small" label={`Priority: ${c.priority || 'medium'}`} />
                            <Chip size="small" label={`Type: ${c.type || 'general'}`} />
                            {c.fromName && (<Chip size="small" label={`Owner: ${c.fromName}`} />)}
                            {c.createdAt && (
                              <Chip
                                size="small"
                                variant="outlined"
                                label={new Date(c.createdAt).toLocaleString()}
                                sx={{
                                  ml: 'auto',
                                  maxWidth: 160,
                                  '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }
                                }}
                              />
                            )}
                            {c.isResolved && (
                              <Chip size="small" color="error" label="✓ Resolved" />
                            )}
                          </MDBox>
                          <MDTypography variant="subtitle2" color="text.primary" sx={{
                            mt: 0.5,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {c.title || 'Untitled'}
                          </MDTypography>
                          <MDTypography variant="body2" color="text.secondary" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>
                            {c.content}
                          </MDTypography>
                          <MDBox display="flex" gap={1} mb={1}>
                            {!c.isResolved && (
                              <MDButton size="small" color="info" onClick={() => { setEditingId(c._id || c.id); setEditData({ title: c.title || '', content: c.content || '' }); setEditOpen(true); }}>Edit</MDButton>
                            )}
                            <MDButton size="small" color="error" onClick={() => { setCommentToDelete({ _id: c._id || c.id, title: c.title, content: c.content, scope: 'admin' }); setDeleteModalOpen(true); }}>Delete</MDButton>
                          </MDBox>
                          {Array.isArray(c.attachments) && c.attachments.length > 0 && (
                            <MDBox display="flex" gap={1} flexWrap="wrap" mb={1}>
                              {c.attachments.map((p, idx) => {
                                const base = (process.env.REACT_APP_SERVER_URL || 'http://localhost:3003').replace(/\/+$/,'');
                                const src = `${base}/${String(p).replace(/^\/+/, '')}`;
                                return (
                                  <img key={idx} src={src} alt="attachment" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                                );
                              })}
                            </MDBox>
                          )}
                          {/* Replies */}
                          {Array.isArray(c.replies) && c.replies.length > 0 && (
                            <MDBox mt={2} pt={2} borderTop="1px solid #e5e7eb">
                              <MDTypography variant="body2" fontWeight="medium" mb={1} color="text.secondary">
                                Replies ({c.replies.length})
                              </MDTypography>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {c.replies.map((reply, idx) => (
                                  <div key={idx} style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                                        {(reply.authorName || reply.authorEmail) ? 
                                          `${reply.authorName || reply.authorEmail} (${reply.authorRole === 'vendor' ? 'Store Admin' : reply.authorRole === 'admin' ? 'Administrator' : 'User'})` : 
                                          (reply.authorRole === 'vendor' ? 'Store Admin' : reply.authorRole === 'admin' ? 'Administrator' : 'User')
                                        }
                                      </span>
                                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#4b5563', margin: 0 }}>{reply.content}</p>
                                    {reply.attachments && reply.attachments.length > 0 && (
                                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                        {reply.attachments.map((p, i2) => (
                                          <img key={i2} src={`${(process.env.REACT_APP_SERVER_URL || 'http://localhost:3003').replace(/\/+$/,'')}/${String(p).replace(/^\/+/, '')}`} alt={`reply-attachment-${i2}`} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }} />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </MDBox>
                          )}
                        </Card>
                      ))
                    )}
                  </MDBox>
                </Card>
              </Grid>
              {/* Edit Dialog */}
              <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Comment</DialogTitle>
                <DialogContent>
                  <TextField
                    fullWidth
                    label="Title"
                    value={editData.title}
                    onChange={(e) => setEditData(v => ({ ...v, title: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Message"
                    value={editData.content}
                    onChange={(e) => setEditData(v => ({ ...v, content: e.target.value }))}
                  />
                </DialogContent>
                <DialogActions>
                  <MDButton color="secondary" onClick={() => setEditOpen(false)}>Cancel</MDButton>
                  <MDButton color="info" onClick={async () => {
                    if (!editingId) return;
                    try {
                      const userData = localStorage.getItem('user');
                      const token = userData ? JSON.parse(userData).access_token : localStorage.getItem('token');
                      const base = (process.env.REACT_APP_SERVER_URL || 'http://localhost:3003').replace(/\/+$/,'');
                      const res = await fetch(`${base}/api/v1/comments/${editingId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ title: editData.title, content: editData.content })
                      });
                      const json = await res.json();
                      if (res.ok) {
                        setAdminThreads(prev => prev.map(x => (x._id||x.id) === (json.data?._id||editingId) ? (json.data || { ...x, title: editData.title, content: editData.content }) : x));
                        setEditOpen(false);
                        triggerAntiNotification('Comment updated! ✏️');
                      } else {
                        triggerAntiNotification(`Update failed: ${json.message || 'Unknown error'}`);
                      }
                    } catch (e) {
                      triggerAntiNotification('Update failed. Please try again.');
                    }
                  }}>Save Changes</MDButton>
                </DialogActions>
              </Dialog>
              {/* Help Card */}
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3} textAlign="center">
                    <Icon sx={{ fontSize: 48, color: "info.main", mb: 2 }}>support_agent</Icon>
                    <MDTypography variant="h6" gutterBottom>
                      Need Help?
                    </MDTypography>
                    <MDTypography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Use the comment form to reach out to our support team. We're here to help!
                    </MDTypography>
                    <MDButton
                      variant="outlined"
                      color="primary"
                      startIcon={<Icon>support_agent</Icon>}
                    >
                      Contact Support
                    </MDButton>
                  </MDBox>
                </Card>
              </Grid>

              {/* Guidelines Card */}
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" gutterBottom>
                      Comment Guidelines
                    </MDTypography>
                    <MDBox component="ul" sx={{ pl: 2, m: 0 }}>
                      <MDTypography component="li" variant="body2" sx={{ mb: 1 }}>
                        Be specific and detailed
                      </MDTypography>
                      <MDTypography component="li" variant="body2" sx={{ mb: 1 }}>
                        Include relevant order numbers
                      </MDTypography>
                      <MDTypography component="li" variant="body2" sx={{ mb: 1 }}>
                        Provide screenshots if possible
                      </MDTypography>
                      <MDTypography component="li" variant="body2" sx={{ mb: 1 }}>
                        Use appropriate priority levels
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MDBox>

      {/* Anti-Design Notification */}
      {showAntiNotification && (
        <div style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          transform: 'translateX(0)',
          transition: 'all 0.3s ease-in-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>🚨</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{antiNotificationMessage}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Action completed successfully!</div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Confirmation Modal */}
      <Dialog 
        open={deleteModalOpen} 
        onClose={() => {
          setDeleteModalOpen(false);
          setCommentToDelete(null);
        }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderBottom: '1px solid #e5e7eb'
        }}>
          <WarningIcon sx={{ color: '#dc2626', fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600 }}>
            Delete Comment
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box sx={{ 
              fontSize: 64, 
              color: '#dc2626', 
              mb: 3,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              mx: 'auto'
            }}>
              🗑️
            </Box>
            
            <Typography variant="h6" sx={{ 
              color: '#111827', 
              mb: 2, 
              fontWeight: 600 
            }}>
              Are you sure you want to delete this comment?
            </Typography>
            
            <Typography variant="body2" sx={{ 
              color: '#6b7280',
              mb: 3,
              lineHeight: 1.6
            }}>
              This action cannot be undone. The comment and all its replies will be permanently removed from the system.
            </Typography>
            
            {commentToDelete && (
              <Box sx={{ 
                mt: 3, 
                p: 3, 
                backgroundColor: '#f9fafb', 
                borderRadius: 2, 
                textAlign: 'left',
                border: '1px solid #e5e7eb'
              }}>
                <Typography variant="subtitle2" sx={{ 
                  color: '#374151', 
                  mb: 1,
                  fontWeight: 600
                }}>
                  Comment Details:
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#111827', 
                  mb: 1,
                  fontWeight: 500
                }}>
                  {commentToDelete.title || 'Untitled'}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#6b7280', 
                  fontSize: '0.875rem',
                  lineHeight: 1.5
                }}>
                  {String(commentToDelete.content || '').substring(0, 120)}
                  {String(commentToDelete.content || '').length > 120 ? '...' : ''}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          px: 3, 
          pb: 3, 
          gap: 2,
          borderTop: '1px solid #e5e7eb',
          pt: 2
        }}>
          <MDButton 
            color="secondary" 
            onClick={() => {
              setDeleteModalOpen(false);
              setCommentToDelete(null);
            }}
            sx={{ 
              px: 3, 
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </MDButton>
          <MDButton 
            color="error" 
            onClick={handleDeleteComment}
            sx={{ 
              px: 3, 
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
          >
            Delete Comment
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Comments;

