import HttpService from "./htttp.service";

class NotificationService {

  getAll = async () => {
    const fetchNotificationEndpoint = '/api/v1/notification';
    return await HttpService.get(fetchNotificationEndpoint);
  };

}

export default new NotificationService();
