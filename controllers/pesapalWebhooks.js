import Booking from '../models/Booking.js';
import { inngest } from "../inngest/index.js";
import { getAuthToken, getTransactionStatus } from "../services/pesapalService.js";

// IPN — PesaPal calls this after payment
export const pesapalIPN = async (request, response) => {
    try {
        const { OrderTrackingId, OrderMerchantReference } = request.body;

        if (!OrderTrackingId || !OrderMerchantReference) {
            return response.status(400).json({ message: "Missing parameters" });
        }

        const token = await getAuthToken();
        const statusData = await getTransactionStatus(token, OrderTrackingId);

        if (statusData.payment_status_description === "Completed") {
            await Booking.findByIdAndUpdate(OrderMerchantReference, {
                isPaid: true,
                paymentLink: ""
            });

            // Send Confirmation Email via Inngest
            await inngest.send({
                name: "app/show.booked",
                data: { bookingId: OrderMerchantReference }
            });
        }

        response.json({ received: true });

    } catch (error) {
        console.error("IPN processing error:", error.message);
        response.status(500).send("Internal Server Error");
    }
}

// Verify — frontend calls this after redirect back from PesaPal
export const verifyPayment = async (request, response) => {
    try {
        const { orderTrackingId } = request.params;

        const token = await getAuthToken();
        const statusData = await getTransactionStatus(token, orderTrackingId);

        const booking = await Booking.findOne({ orderTrackingId });

        if (booking && statusData.payment_status_description === "Completed") {
            await Booking.findByIdAndUpdate(booking._id, {
                isPaid: true,
                paymentLink: ""
            });

            // Send Confirmation Email if not already sent
            if (!booking.isPaid) {
                await inngest.send({
                    name: "app/show.booked",
                    data: { bookingId: booking._id.toString() }
                });
            }
        }

        response.json({
            success: true,
            status: statusData.payment_status_description,
            booking
        });

    } catch (error) {
        console.error("Verify payment error:", error.message);
        response.json({ success: false, message: error.message });
    }
}