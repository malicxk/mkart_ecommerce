const mongoose=require("mongoose");

const { Schema, ObjectId } = mongoose;

const profilepicSchema = new mongoose.Schema({
    userid: {
        type: ObjectId,
    },
    profilepic:{
        type:String
    }
});

const profilepic = mongoose.model('Profilepic', profilepicSchema);
module.exports = profilepic;