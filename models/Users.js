import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    alias: String
});

export default mongoose.model("User", userSchema);