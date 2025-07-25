import mongoose from "mongoose";

const connectDB = async () => {
    const db = process.env.DATABASE;
    mongoose.connection.on("connected", () => console.log(`Connected to database "${db}"`));
    await mongoose.connect(`${process.env.MONGODB_URI}/${db}`);
};

export default connectDB;