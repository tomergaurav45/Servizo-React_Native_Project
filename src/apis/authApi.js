import { AUTH_ENDPOINTS } from "./endpoint";


export const sendEmailOtp = async (email) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.SEND_EMAIL_OTP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: "Network error while sending OTP",
    };
  }
};


export const verifyEmailOtp = async (email, otp) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.VERIFY_EMAIL_OTP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "OTP verification failed",
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: "Server error during OTP verification",
    };
  }
};


export const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
}) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${firstName} ${lastName}`,
        email,
        phoneNumber: "9999999999",
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Registration failed",
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: "Server error during registration",
    };
  }
};


export const sendForgotOtp = async (email) => {
  try {
    const response = await fetch(
      AUTH_ENDPOINTS.FORGOT_PASSWORD_EMAIL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: "Network error while sending OTP",
    };
  }
};


export const resetPassword = async (email, newPassword) => {
  try {
    const response = await fetch(
      AUTH_ENDPOINTS.FORGOT_PASSWORD_RESET,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      }
    );

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: "Network error while resetting password",
    };
  }
};

export const sendWelcomeMail = async (email, name) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.WELCOME_MAIL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: "Network error while sending welcome email",
    };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Login failed",
        field: data.field || null,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: "Network error during login",
    };
  }
};
