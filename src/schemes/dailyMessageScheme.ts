import mongoose from "mongoose";
import shortid from "shortid";
const dailyMessageScheme = new mongoose.Schema({
    _id: {
        'type': String,
        'default': shortid.generate
    },
    guildID: String,
    channelName: String,
    channelID: String,
    message: String,
    hour: Number,
    minute: Number
});
export default mongoose.model("DailyMessage", dailyMessageScheme);