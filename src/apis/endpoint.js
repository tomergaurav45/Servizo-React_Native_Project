//export const BASE_URL = "http://192.168.1.10:5000/api";
export const BASE_URL = "http://192.168.31.62:5000/api";

export const AUTH_ENDPOINTS = {
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,

  SEND_EMAIL_OTP: `${BASE_URL}/send-email-otp`,
  VERIFY_EMAIL_OTP: `${BASE_URL}/verify-email-otp`,

  FORGOT_PASSWORD_EMAIL: `${BASE_URL}/forgot-password/send-otp`,
  FORGOT_PASSWORD_RESET: `${BASE_URL}/forgot-password/reset`,

  WELCOME_MAIL: `${BASE_URL}/send-welcome-mail`,
};
