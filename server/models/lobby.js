const mongoose=require('mongoose');
const lobbySchema=new mongoose.Schema({
    meetingId:{
        type:String,
        required:true,
        unique:true,
    },
    type:{
        type:String,
        enum:["instant","scheduled"],
        default:"instant",
    },
     scheduledFor: {
      type: Date,
     },

  status: {
    type: String,
    enum: ["scheduled", "active", "ended"],
    default: "active",
  }
    
},{timestamps:true});
module.exports=mongoose.model('lobby',lobbySchema);