const mongoose=require("mongoose");

const couponSchema = new mongoose.Schema({
    couponcode:{
        type:String 
    },
    discount:{
        type:Number
    },
    expirydate:{
        type:Date
    },
    purchaseamount:{
        type:Number
    }
});

const coupon = mongoose.model("coupon", couponSchema);
module.exports = coupon;