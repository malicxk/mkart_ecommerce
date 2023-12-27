const mongoose=require("mongoose")
require("dotenv").config();
const String=process.env.CONNECTION
//connect to mongodb
mongoose.connect(String, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
      console.log("MongoDB connected successfully");
  })
  .catch(error => {
      console.error("Error connecting to MongoDB:", error);
  });

