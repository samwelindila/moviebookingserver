import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 10000,
        });
        console.log('Database connected');
    } catch (error) {
        console.log(error.message);
    }
}

export default connectDB;