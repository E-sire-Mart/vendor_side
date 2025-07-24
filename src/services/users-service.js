import HttpService from "./htttp.service";

class OrderService {

  getAllCounts = async () => {
    const fetchUsersCountsEndpoint = '/api/v1/users/counts';
    return await HttpService.get(fetchUsersCountsEndpoint);
  };
}

export default new OrderService();
