const mongoose=require("mongoose");

const { Schema, ObjectId } = mongoose;

const addressSchema = new mongoose.Schema({
    userid: {
        type: ObjectId,
    },
    firstname:{
        type: String,
        
    },
    lastname:{
        type: String,
       
    },
    address:{
        type: String,
    },
    city:{
        type: String,
    },
    state:{
        type: String,
    },
    pincode:{
        type:String,
    },
    phone:{
        type:Number,
    },
});

const address = mongoose.model('address', addressSchema);
module.exports = address;