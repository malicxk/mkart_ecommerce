const mongoose=require("mongoose");

const { Schema, ObjectId } = mongoose;

const profileSchema = new mongoose.Schema({
    userid: {
        type: ObjectId,
    },
    Username: {
        type: String,
    },
    productid: {
        type: ObjectId,
    },
    product: {
        type: String,
    },
    price: {
        type: String,
    },
    quantity: {
        type: Number,
    },
    img: [String],
});

const profile = mongoose.model('Profile', profileSchema);
module.exports = profile;
 