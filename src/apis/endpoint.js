export const BASE_URL =
  "https://servizo-backend-app.onrender.com/api";

export const SOCKET_URL =
  BASE_URL.replace(/\/api\/?$/, "");

export const AUTH_ENDPOINTS = {
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  SEND_EMAIL_OTP: `${BASE_URL}/send-email-otp`,
  VERIFY_EMAIL_OTP: `${BASE_URL}/verify-email-otp`,
  FORGOT_PASSWORD_EMAIL: `${BASE_URL}/forgot-password/send-otp`,
  FORGOT_PASSWORD_RESET: `${BASE_URL}/forgot-password/reset`,
  WELCOME_MAIL: `${BASE_URL}/send-welcome-mail`,
  SAVE_ADDRESSES: `${BASE_URL}/save-addresses`,
  GET_ADDRESSES: `${BASE_URL}/save-adresses`,
  UPDATE_ADDRESSES: `${BASE_URL}/update-address`,
  DELETE_ADDRESSES: `${BASE_URL}/delete-address`,
  CHANGE_PASSWORD: `${BASE_URL}/change-password`,
  CREATE_ISSUES: `${BASE_URL}/create-issue`,
  GET_SERVICES: `${BASE_URL}/services`,
  CREATE_BOOKING: `${BASE_URL}/create-booking`,
  ACCEPT_BOOKING: `${BASE_URL}/accept`,
  GET_PROVIDER_REQUESTS: `${BASE_URL}/provider-requests`,
  GET_USER_BOOKINGS: `${BASE_URL}/user-bookings`,
  COMPLETE_BOOKING: `${BASE_URL}/complete-booking`,
  ADD_REVIEW: `${BASE_URL}/add-review`,
  GET_PROVIDER_REVIEWS: `${BASE_URL}/provider-reviews`,
  UPDATE_ONLINE_STATUS: `${BASE_URL}/update-online-status`,
  GET_NOTIFICATIONS: `${BASE_URL}/notifications`,
  CREATE_NOTIFICATION: `${BASE_URL}/create`,
  MARK_NOTIFICATION_READ: `${BASE_URL}/mark-read`,
  DELETE_ALL_NOTIFICATIONS: `${BASE_URL}/delete-all`,
  SEND_MESSAGE: `${BASE_URL}/send-message`,
  GET_MESSAGES: `${BASE_URL}/messages`,
  DELETE_MESSAGES_FOR_USER: `${BASE_URL}/delete-messages-for-user`,
  DELETE_SINGLE_MESSAGE: `${BASE_URL}/delete-single-message`,
  GET_SERVICE_VARIANTS: `${BASE_URL}/service-variants`,
};
