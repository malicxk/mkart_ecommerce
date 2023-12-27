const mongoose=require("mongoose");
const category = require("./category");
const productm=require("./products")


const { Schema, ObjectId } = mongoose;

const offerSchema = new mongoose.Schema({
   applicableProduct:{
    type:String,
    ref:productm
   },

   applicableCategory:{
    type:String,
    ref:category
   },

   discount:{
    type:Number,
    required:true,
   },

   expiryDate:{
    type:Date,
    required:true,
   },

   isActive:{
    type:Boolean,
    default:true,
   }
});

const offer = mongoose.model('Offer', offerSchema);
module.exports = offer;