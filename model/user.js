const mongoose=require("mongoose");

const { Schema, ObjectId } = mongoose;

const UserSchema=new mongoose.Schema({
    Username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
    userid: {
        type: ObjectId,
    },
    wallet:{
        type:Number,
        required:true,
        default:0,
    },
    referalcode:{
        type:String
    },
    referallink:{
        type:String
    }
    
});         

const collection=mongoose.model("User",UserSchema) ;
module.exports=collection;