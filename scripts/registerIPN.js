import dotenv from "dotenv";
dotenv.config();
import { getAuthToken, registerIPN } from "../services/pesapalService.js";

const token = await getAuthToken();
console.log("✅ Got token:", token);

const ipnId = await registerIPN(
  token,
  `${process.env.SERVER_URL}/api/bookings/ipn`
);
console.log("✅ Copy this to your .env as PESAPAL_IPN_ID:", ipnId);



