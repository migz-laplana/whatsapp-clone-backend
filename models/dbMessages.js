import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    sender: Object
});

export default mongoose.model("Message", messageSchema);