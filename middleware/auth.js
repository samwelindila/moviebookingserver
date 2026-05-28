import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protectAdmin = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const clerkUser = await clerkClient.users.getUser(userId);

        if (clerkUser.privateMetadata.role !== 'admin') {
            return res.json({ success: false, message: "not authorized" });
        }

        await User.findByIdAndUpdate(
            userId,
            {
                name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
                email: clerkUser.emailAddresses[0].emailAddress,
                image: clerkUser.imageUrl,
            },
            { upsert: true, new: true }
        );

        next();
    } catch (error) {
        return res.json({ success: false, message: "not authorized" });
    }
}

// NEW: middleware for regular users
export const protectUser = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        if (!userId) return res.json({ success: false, message: "not authorized" });

        const clerkUser = await clerkClient.users.getUser(userId);

        // Sync Clerk user → MongoDB
        await User.findByIdAndUpdate(
            userId,
            {
                name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
                email: clerkUser.emailAddresses[0].emailAddress,
                image: clerkUser.imageUrl,
            },
            { upsert: true, new: true }
        );

        next();
    } catch (error) {
        return res.json({ success: false, message: "not authorized" });
    }
}