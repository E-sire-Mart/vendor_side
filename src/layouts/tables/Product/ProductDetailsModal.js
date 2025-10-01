import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import MDBox from 'components/MDBox';
import Grid from '@mui/material/Grid';
import { Descriptions, Tag, Spin, Alert, Rate, List, Avatar } from 'antd';
import { useEffect, useState } from 'react';
import { getProductReviews } from 'services/review-service';

function ProductDetailsModal({ isOpen, onClose, product }) {
  const API_URL = process.env.REACT_APP_SERVER_URL;
  if (!product) return null;

  const images = Array.isArray(product.image) ? product.image : [];
  const [activeIdx, setActiveIdx] = useState(0);
  const activeSrc = images[activeIdx] ? API_URL + images[activeIdx] : undefined;

  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState('');

  useEffect(() => {
    const productId = product?._id || product?.id;
    if (!isOpen || !productId) return;
    const fetchReviews = async () => {
      try {
        setReviewsError('');
        setLoadingReviews(true);
        const res = await getProductReviews(productId, 1, 5);
        setReviews(res.reviews || []);
        setRatingStats(res.ratingStats || { averageRating: 0, totalReviews: 0 });
      } catch (e) {
        setReviewsError('Failed to load reviews');
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [isOpen, product?._id, product?.id]);

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <MDTypography variant="h6">Product details</MDTypography>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MDBox display="flex" flexDirection="column" alignItems="center" gap={2}>
              <MDBox
                sx={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#f7f7f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {activeSrc ? (
                  <img src={activeSrc} alt="product" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <MDTypography variant="button" color="text">No image</MDTypography>
                )}
              </MDBox>
              <MDBox display="flex" gap={1} flexWrap="nowrap" sx={{ width: '100%', overflowX: 'auto' }}>
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    style={{
                      border: idx === activeIdx ? '2px solid #49a3f1' : '1px solid #ddd',
                      padding: 0,
                      borderRadius: 8,
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <img src={API_URL + src} alt="thumb" width={72} height={72} style={{ objectFit: 'cover', borderRadius: 6, display: 'block' }} />
                  </button>
                ))}
              </MDBox>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6}>
            <Descriptions column={1} size="small" labelStyle={{ width: 160 }}>
              <Descriptions.Item label="Title">{product.name}</Descriptions.Item>
              <Descriptions.Item label="Description">{product.description}</Descriptions.Item>
              <Descriptions.Item label="Category">{product.category?.name || product.category || '-'} </Descriptions.Item>
              <Descriptions.Item label="Price">{product.price}</Descriptions.Item>
              {product.compareAtPrice !== undefined && (
                <Descriptions.Item label="Compare-at price">{product.compareAtPrice}</Descriptions.Item>
              )}
              <Descriptions.Item label="Quantity">{product.quantity}</Descriptions.Item>
              <Descriptions.Item label="SKU">{product.sku || '-'}</Descriptions.Item>
              <Descriptions.Item label="Barcode">{product.barcode || '-'}</Descriptions.Item>
              <Descriptions.Item label="Track quantity">{product.trackQuantity ? 'Yes' : 'No'}</Descriptions.Item>
              {product.discountPercent > 0 && (
                <Descriptions.Item label="Discount">
                  <Tag color="green">{product.discountPercent}%</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Grid>
          <Grid item xs={12}>
            <MDTypography variant="h6" sx={{ mb: 1 }}>User reviews</MDTypography>
            {loadingReviews ? (
              <Spin />
            ) : reviewsError ? (
              <Alert type="error" message={reviewsError} />
            ) : (
              <>
                <MDBox display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                  <Rate disabled allowHalf value={Number(ratingStats.averageRating) || 0} />
                  <MDTypography variant="button" color="text">
                    {Number(ratingStats.averageRating).toFixed(1)} ({ratingStats.totalReviews} reviews)
                  </MDTypography>
                </MDBox>
                <List
                  dataSource={reviews}
                  locale={{ emptyText: 'No reviews yet' }}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          item.user?.avatar ? (
                            <Avatar
                              src={`${(API_URL || '').replace(/\/+$/,'')}/uploads/${item.user.avatar}`}
                            />
                          ) : (
                            <Avatar>{(item.user?.first_name || item.user?.username || 'U').slice(0,1)}</Avatar>
                          )
                        }
                        title={<MDBox display="flex" alignItems="center" gap={1}><Rate disabled value={item.rating} /><MDTypography variant="caption" color="text">{new Date(item.createdAt).toLocaleDateString()}</MDTypography></MDBox>}
                        description={item.comment}
                      />
                    </List.Item>
                  )}
                />
              </>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <MDButton onClick={onClose} color="info">Close</MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default ProductDetailsModal;

