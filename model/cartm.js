const mongoose=require("mongoose");
// const category = require("./category");

const { Schema, ObjectId } = mongoose;

const cartSchema = new mongoose.Schema({
    userid: {
        type: ObjectId,
         // Reference to the User schema
       
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
    img: [Array],
    
});

const cart = mongoose.model('Cart', cartSchema);
module.exports = cart;
 
