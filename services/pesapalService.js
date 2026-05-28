import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL =
  process.env.PESAPAL_ENV === "live"
    ? "https://pay.pesapal.com/v3"
    : "https://cybqa.pesapal.com/pesapalv3";

export const getAuthToken = async () => {
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
  return data.token;
};

export const registerIPN = async (token, ipnUrl) => {
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
  return data.ipn_id;
};

export const submitOrder = async (token, orderData) => {
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
  return data;
};

export const getTransactionStatus = async (token, orderTrackingId) => {
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
};