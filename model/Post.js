const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    like: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "Users",
            },
        },
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: "Users",
    },
   
    updated: {
        type: Date,
        default: Date.now(),
    },
    
});

module.exports = mongoose.model("Posts", PostSchema);
