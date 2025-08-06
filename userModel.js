import mongoose from "mongoose";

const userShema= new mongoose.Schema({
    username:{
        type:String,
        require:true
    },
    password:{
        type: String,
        require:true
    }
})

export default mongoose.model("user",userShema);