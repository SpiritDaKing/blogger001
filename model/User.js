const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var bcrypt = require("bcryptjs")

const Userschema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    favouriteB: [
        {
            blogger: {
                type: Schema.Types.ObjectId,
                ref: "Users",
            },
        },
    ],
});

Userschema.pre("save", function (next) {
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8),null);
    next();
});

Userschema.statics.compare = function (cleartext, encrypted) {
    return bcrypt.compareSync(cleartext, encrypted);
}

module.exports = mongoose.model("Users", Userschema);
