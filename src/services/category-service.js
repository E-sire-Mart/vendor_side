import HttpService from "./htttp.service";

class CategoryService {
  getTree = async () => {
    const url = "/api/v1/categories";
    return await HttpService.get(url);
  };
}

export default new CategoryService();