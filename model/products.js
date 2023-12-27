const mongoose=require("mongoose");
const category = require("./category");
const { Schema, ObjectId } = mongoose;

const productSchema=new mongoose.Schema({
    productname:{
        type:String,
    },
    category:{
        type:ObjectId,
        ref:category,
        required:true
    },
    model:{
        type:String,
    },
    price:{
        type:String,
    },
    rating:{
        type:String,
    },
    stock: {
        type: Number,
        required: true,
    },
    description:{
        type:String,
    },
    img:[Array],
    
});         

const product=mongoose.model("products",productSchema);
module.exports=product;