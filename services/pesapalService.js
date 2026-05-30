import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL =
  process.env.PESAPAL_ENV === "live"
    ? "https://pay.pesapal.com/v3"
    : "https://cybqa.pesapal.com/pesapalv3";

// Token cache
let cachedToken = null;
let tokenExpiry = null;

// ─── Auth Token ───────────────────────────────────────────────
export const getAuthToken = async () => {
  try {
    // Return cached token if still valid
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
      return cachedToken;
    }

    const { data } = await axios.post(
      `${BASE_URL}/api/Auth/RequestToken`,
      {
        consumer_key: process.env.PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!data.token) throw new Error("Failed to get PesaPal token");

    // Cache token for 4 minutes (safe margin before 5min expiry)
    cachedToken = data.token;
    tokenExpiry = new Date(Date.now() + 4 * 60 * 1000);

    return cachedToken;
  } catch (error) {
    console.error("PesaPal Auth Error:", error.response?.data || error.message);
    throw error;
  }
};

// ─── Register IPN ─────────────────────────────────────────────
export const registerIPN = async (token, ipnUrl) => {
  try {
    const { data } = await axios.post(
      `${BASE_URL}/api/URLSetup/RegisterIPN`,
      { url: ipnUrl, ipn_notification_type: "POST" },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!data.ipn_id) throw new Error("Failed to register IPN");
    return data.ipn_id;
  } catch (error) {
    console.error("PesaPal IPN Error:", error.response?.data || error.message);
    throw error;
  }
};

// ─── Submit Order ─────────────────────────────────────────────
export const submitOrder = async (token, orderData) => {
  try {
    const { data } = await axios.post(
      `${BASE_URL}/api/Transactions/SubmitOrderRequest`,
      orderData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!data.order_tracking_id) throw new Error("Failed to submit order");
    return data;
  } catch (error) {
    console.error("PesaPal Order Error:", error.response?.data || error.message);
    throw error;
  }
};

// ─── Get Transaction Status ───────────────────────────────────
export const getTransactionStatus = async (token, orderTrackingId) => {
  try {
    const { data } = await axios.get(
      `${BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.error("PesaPal Status Error:", error.response?.data || error.message);
    throw error;
  }
};