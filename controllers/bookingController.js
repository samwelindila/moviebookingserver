import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { getAuthToken, submitOrder } from "../services/pesapalService.js";

// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId);
        if (!showData) return false;
        const occupiedSeats = showData.occupiedSeats;
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);
        return !isAnySeatTaken;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

export const createBooking = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { showId, selectedSeats } = req.body;
        const { origin } = req.headers;

        // Check if seats are available
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
        if (!isAvailable) {
            return res.json({ success: false, message: "Selected Seats are not available." });
        }

        // Get show details
        const showData = await Show.findById(showId).populate('movie');

        // Create a new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        });

        // Mark seats as occupied
        selectedSeats.map((seat) => {
            showData.occupiedSeats[seat] = userId;
        });
        showData.markModified('occupiedSeats');
        await showData.save();

        // PesaPal Payment Initialize
        const token = await getAuthToken();

        const orderPayload = {
            id: booking._id.toString(),
            currency: "TZS",
            amount: booking.amount,
            description: `Ticket for ${showData.movie.title}`,
            callback_url: `${origin}/loading/my-bookings`,
            cancellation_url: `${origin}/my-bookings`,
            notification_id: process.env.PESAPAL_IPN_ID,
            billing_address: {
                email_address: "",  // will be filled from user profile if available
            }
        };

        const pesapalResponse = await submitOrder(token, orderPayload);

        // Save payment link
        booking.paymentLink = pesapalResponse.redirect_url;
        booking.orderTrackingId = pesapalResponse.order_tracking_id;
        await booking.save();

        // Run Inngest Scheduler to release seats if payment not made in 10 minutes
        await inngest.send({
            name: "app/checkpayment",
            data: {
                bookingId: booking._id.toString()
            }
        });

        res.json({ success: true, url: pesapalResponse.redirect_url });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        const showData = await Show.findById(showId);
        const occupiedSeats = Object.keys(showData.occupiedSeats);
        res.json({ success: true, occupiedSeats });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}