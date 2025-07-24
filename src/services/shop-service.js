import HttpService from "./htttp.service";

class ShopService {

  get = async () => {
    const fetchShopEndpoint = `/api/v1/shop`;
    return await HttpService.get(fetchShopEndpoint);
  };
  update = async (payload) => {
    const shopEndpoint = `/api/v1/shop`;
    return await HttpService.put(shopEndpoint, payload);
  };
  delete = async (payload) => {
    const shopEndpoint = `/api/v1/shop`;
    return await HttpService.delete(shopEndpoint, payload);
  };
  delete = async (shopId) => {
    const shopEndpoint = `/api/v1/shop/${shopId}`;
    return await HttpService.delete(shopEndpoint);
  };

}

export default new ShopService();
