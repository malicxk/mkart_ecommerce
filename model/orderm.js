const mongoose=require("mongoose");

const { Schema, ObjectId } = mongoose;

const orderSchema = new mongoose.Schema({
    userid: {
        type: ObjectId,
    },
    username:{
        type: String,
    },
    productcollection:[
        {
            productid:{
                type: ObjectId,
            },
            productname:{
                type: String,
            },
            quantity:{
                type: String,
            },
            price:{
                type: String,
            },
            status: {
                type: String,
            },
            discount:{
                type:Number,
                default:0,
            }
        }
    ],
    orderdate:{
        type:Date
    },
    deliverydate:{
        type:Date
    },
    address:{
        type:String
    },
    paymentmode:{
        type:String
    },
    
});

const order = mongoose.model("order", orderSchema);
module.exports = order;