import HttpService from "./htttp.service";

class OrderService {

  getAll = async (searchText = "") => {
    const fetchOrderssEndpoint = `/api/v1/orders?search=${encodeURIComponent(searchText)}`;
    console.log("fetchOrderssEndpoint", fetchOrderssEndpoint);

    return await HttpService.get(fetchOrderssEndpoint);
  };

  getAllCounts = async () => {
    const fetchOrdersCountsEndpoint = '/api/v1/orders/counts';
    return await HttpService.get(fetchOrdersCountsEndpoint);
  };
  updateStatus = async (orderId, payload) => {
    const updateStatusEndpoint = `/api/v1/orders/${orderId}/status`;
    return await HttpService.put(updateStatusEndpoint, payload);
  };

}

export default new OrderService();
