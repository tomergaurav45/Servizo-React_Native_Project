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
  userId,
  firstName,
  lastName,
  email,
  password,
  role,
  dob,
  phone,
  gender,
  skills,
  experience,
  availability
}) => {
  try {

    const payload = { userId };

    if (firstName || lastName) {
      payload.name = `${firstName || ""} ${lastName || ""}`.trim();
    }

    if (email !== undefined) payload.email = email;
    if (password !== undefined) payload.password = password;
    if (role !== undefined) payload.role = role;
    if (dob !== undefined) payload.dob = dob;
    if (phone !== undefined) payload.phone = phone;
    if (gender !== undefined) payload.gender = gender;
    if (skills !== undefined) payload.skills = skills;
    if (experience !== undefined) payload.experience = experience;
    if (availability !== undefined) payload.availability = availability;

    const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

export const saveAddress = async (payload) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.SAVE_ADDRESSES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to save address",
      };
    }

    return data;

  } catch (error) {
    return {
      success: false,
      message: "Network error while saving address",
    };
  }
};

export const getAddresses = async (userId) => {
  try {
    const response = await fetch(
      `${AUTH_ENDPOINTS.GET_ADDRESSES}/${userId}`
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to fetch addresses",
      };
    }

    return data;

  } catch (error) {
    return {
      success: false,
      message: "Network error while fetching addresses",
    };
  }
};

export const updateAddress = async (payload) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.UPDATE_ADDRESSES, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to update address",
      };
    }

    return data;

  } catch (error) {
    return {
      success: false,
      message: "Network error while updating address",
    };
  }
};

export const deleteAddress = async (payload) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.DELETE_ADDRESSES, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to delete address",
      };
    }

    return data;

  } catch (error) {
    return {
      success: false,
      message: "Network error while deleting address",
    };
  }
};

export const changePassword = async ({
  userId,
  currentPassword,
  newPassword,
  confirmPassword,
}) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Password change failed",
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: "Network error while changing password",
    };
  }
};

export const createIssue = async (data) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.CREATE_ISSUES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create issue");
    }

    return result;
  } catch (error) {
    console.error("Create Issue Error:", error);
    throw error;
  }
};

export const getServices = async () => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.GET_SERVICES, {
      method: "GET"
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to fetch services"
      };
    }

    return data;

  } catch (error) {
    return {
      success: false,
      message: "Network error while fetching services"
    };
  }
};

export const createBooking = async (payload) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.CREATE_BOOKING, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Booking failed",
      };
    }

    return data;

  } catch (error) {
    return {
      success: false,
      message: "Network error while creating booking",
    };
  }
};

export const acceptBooking = async ({ bookingId, providerId }) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.ACCEPT_BOOKING, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookingId, providerId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to assign provider",
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: "Network error while assigning provider",
    };
  }
};

export const getProviderRequests = async (providerId) => {
  try {
    const response = await fetch(
      `${AUTH_ENDPOINTS.GET_PROVIDER_REQUESTS}?providerId=${encodeURIComponent(providerId)}`
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to fetch provider requests",
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: "Network error while fetching provider requests",
    };
  }
};

export const getUserBookings = async (userId) => {
  try {
    const res = await fetch(
      `${AUTH_ENDPOINTS.GET_USER_BOOKINGS}?userId=${userId}`
    );
    return await res.json();
  } catch (err) {
    return { success: false, message: "Network error" };
  }
};

export const completeBooking = async (data) => {
  try {
    const res = await fetch(`${AUTH_ENDPOINTS.COMPLETE_BOOKING}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return await res.json();
  } catch (err) {
    return { success: false };
  }
};

export const addReview = async (payload) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.ADD_REVIEW, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to add review",
      };
    }

    return data;

  } catch (error) {
    return {
      success: false,
      message: "Network error while adding review",
    };
  }
};

export const getProviderReviews = async (providerId) => {
  try {
    const response = await fetch(
      `${AUTH_ENDPOINTS.GET_PROVIDER_REVIEWS}?providerId=${encodeURIComponent(providerId)}`
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to fetch reviews",
      };
    }

    return data;

  } catch (error) {
    return {
      success: false,
      message: "Network error while fetching reviews",
    };
  }
};

export const updateOnlineStatus = async (userId, isOnline) => {
  try {
    const res = await fetch(AUTH_ENDPOINTS.UPDATE_ONLINE_STATUS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        isOnline,
      }),
    });

    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const getNotifications = async (userId) => {
  try {
    const res = await fetch(
      `${AUTH_ENDPOINTS.GET_NOTIFICATIONS}/${userId}`
    );
    return await res.json();
  } catch (err) {
    return { success: false };
  }
};

export const markNotificationRead = async (id) => {
  await fetch(`${AUTH_ENDPOINTS.MARK_NOTIFICATION_READ}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
};
