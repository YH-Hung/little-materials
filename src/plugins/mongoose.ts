import mongoose from "mongoose";

export const establishConnection = async (cs: string) => {
    await mongoose.connect(cs)
}