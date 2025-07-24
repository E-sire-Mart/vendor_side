import HttpService from "./htttp.service";

class ProductService {

  getAll = async (searchText = "") => {
    const fetchProductsEndpoint = `/api/v1/product?search=${encodeURIComponent(searchText)}`;

    return await HttpService.get(fetchProductsEndpoint);
  };

  getAllCounts = async () => {
    const fetchProductsCountsEndpoint = "/api/v1/product/all/counts";
    return await HttpService.get(fetchProductsCountsEndpoint);
  };

  save = async (payload) => {
    const productEndpoint = "/api/v1/product/";
    try {
      return await HttpService.post(productEndpoint, payload);
    } catch (error) {
      console.error("Error saving product:", error);
      throw error;
    }
  };
  update = async (productId, payload) => {
    const productEndpoint = `/api/v1/product/${productId}`;
    return await HttpService.put(productEndpoint, payload);
  };
  delete = async (productId) => {
    const productEndpoint = `/api/v1/product/${productId}`;
    return await HttpService.delete(productEndpoint);
  };
  setDiscountDate = async (productId, payload) => {
    const productEndpoint = `/api/v1/product/setDiscountDate/${productId}`;
    return await HttpService.post(productEndpoint, payload);
  };
}

export default new ProductService();
