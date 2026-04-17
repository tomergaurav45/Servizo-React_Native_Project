//export const BASE_URL = "http://192.168.123.208:5000/api";
//export const BASE_URL = "http://192.168.31.62:5000/api";
export const BASE_URL = "http://10.149.48.208:5000/api";


export const AUTH_ENDPOINTS = {
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  SEND_EMAIL_OTP: `${BASE_URL}/send-email-otp`,
  VERIFY_EMAIL_OTP: `${BASE_URL}/verify-email-otp`,
  FORGOT_PASSWORD_EMAIL: `${BASE_URL}/forgot-password/send-otp`,
  FORGOT_PASSWORD_RESET: `${BASE_URL}/forgot-password/reset`,
  WELCOME_MAIL: `${BASE_URL}/send-welcome-mail`,
  SAVE_ADDRESSES: `${BASE_URL}/save-adresses`,
  GET_ADDRESSES: `${BASE_URL}/save-adresses`,
  UPDATE_ADDRESSES: `${BASE_URL}/update-address`,
  DELETE_ADDRESSES: `${BASE_URL}/delete-address`,
  CHANGE_PASSWORD: `${BASE_URL}/change-password`,
  CREATE_ISSUES: `${BASE_URL}/create-issue`,
  GET_SERVICES: `${BASE_URL}/services`,
  CREATE_BOOKING: `${BASE_URL}/create-booking`
};
