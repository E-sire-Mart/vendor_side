import Axios from 'axios';
const BASE_URL = process.env.REACT_APP_SERVER_URL || '';
const client = Axios.create({ baseURL: BASE_URL });

// Fetch reviews for a specific product
export const getProductReviews = async (productId, page = 1, limit = 5) => {
  const response = await client.get(`/api/v1/reviews/product/${productId}`, {
    params: { page, limit },
  });
  return response.data;
};

export default {
  getProductReviews,
};


