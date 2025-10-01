import Axios from "axios";
// const API_URL = import.meta.env.VITE_SERVER_URL;
const API_URL = process.env.REACT_APP_SERVER_URL;
console.log(API_URL, "fk;fk;skf;lskf;")
Axios.defaults.baseURL = API_URL;
export class HttpService {
  _axios = Axios.create();

  addRequestInterceptor = (onFulfilled, onRejected) => {
    this._axios.interceptors.request.use(onFulfilled, onRejected);
  };

  addResponseInterceptor = (onFulfilled, onRejected) => {
    this._axios.interceptors.response.use(onFulfilled, onRejected);
  };

  get = async (url) => await this.request(this.getOptionsConfig("get", url));

  post = async (url, data) => await this.request(this.getOptionsConfig("post", url, data));

  put = async (url, data) => await this.request(this.getOptionsConfig("put", url, data));

  patch = async (url, data) => await this.request(this.getOptionsConfig("patch", url, data));

  delete = async (url) => await this.request(this.getOptionsConfig("delete", url));

  getOptionsConfig = (method, url, data) => {
    // Use multipart headers if FormData is provided
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const headers = isFormData
      ? { 'Accept': 'application/json' }
      : { "Content-Type": "application/vnd.api+json", "Accept": "application/vnd.api+json", 'Access-Control-Allow-Credentials': true };
    return {
      method,
      url,
      data,
      headers,
    };
  };

  request(options) {
    return new Promise((resolve, reject) => {
      this._axios
        .request(options)
        .then((res) => resolve(res.data))
        .catch((ex) => reject(ex.response.data));
    });
  }
}

export default new HttpService();
