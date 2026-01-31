import { AUTH_ENDPOINTS } from "./endpoint";

/* ===================== SEND EMAIL OTP ===================== */
export const sendEmailOtp = async (email) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.SEND_EMAIL_OTP, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    return await response.json();
  } catch (error) {
    console.error("❌ Send Email OTP Error:", error);
    throw error;
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

    // 🔥 THIS IS THE FIX
    if (!response.ok) {
      return {
        success: false,
        message: data.message || "OTP verification failed",
      };
    }

    return data;
  } catch (error) {
    console.error("❌ Verify Email OTP Error:", error);
    return {
      success: false,
      message: "Server error during OTP verification",
    };
  }
};

/* ===================== REGISTER USER ===================== */
export const registerUser = async ({ firstName, lastName, email, password }) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `${firstName} ${lastName}`, // backend expects "name"
        email,
        phoneNumber: "9999999999",        // TEMP (until you add input)
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
    console.error("❌ Register User Error:", error);
    return {
      success: false,
      message: "Server error during registration",
    };
  }
};

