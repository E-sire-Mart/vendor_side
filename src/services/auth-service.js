import HttpService from "./htttp.service";

class AuthService {
  // authEndpoint = process.env.API_URL;

  login = async (payload) => {
    const loginEndpoint = '/api/v1/auth/login';
    return await HttpService.post(loginEndpoint, payload);
  };

  register = async (credentials) => {
    const registerEndpoint = '/api/v1/auth/ownerRegister';
    return await HttpService.post(registerEndpoint, credentials);
  };

  logout = async () => {
    const logoutEndpoint = '/api/v1/auth/logout';
    return await HttpService.post(logoutEndpoint);
  };

  forgotPassword = async (payload) => {
    const forgotPassword = '/api/v1/auth/password-forgot';
    return await HttpService.post(forgotPassword, payload);
  }

  resetPassword = async (credentials) => {
    const resetPassword = '/api/v1/auth/password-reset';
    return await HttpService.post(resetPassword, credentials);
  }

  getProfile = async () => {
    const getProfile = 'me';
    return await HttpService.get(getProfile);
  }

  updateProfile = async (newInfo) => {
    const updateProfile = "me";
    return await HttpService.patch(updateProfile, newInfo);
  }

  resendVerification = async (payload) => {
    const resendVerificationEndpoint = '/api/v1/auth/resend-verification';
    return await HttpService.post(resendVerificationEndpoint, payload);
  }
}

export default new AuthService();
