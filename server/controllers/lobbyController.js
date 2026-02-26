const lobby = require('../models/lobby');
const jwt = require('jsonwebtoken');

exports.joinMeeting=async (req,res)=>{
    try{
        console.log("Id:",req.body);
        const {Id}=req.body;
        if(!Id){
            return res.status(400).json({success:false,message:'Id required'});
        }
        const exists=await lobby.findOne({meetingId:Id});
        if(!exists){
            return res.status(400).json({success:false, message:'Id not found'});

        }
        return res.status(200).json({
            success:true,
            message:'Meeting Found'
        });
        
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Server Error'
        });

    }
}
exports.createMeeting = async (req,res)=>{
    try{
        let meetingId;
        let exists=true;
        while(exists){
            meetingId = Math.random().toString(36).substring(2, 10);
            exists = await lobby.findOne({ meetingId });
        }
        await lobby.create({
         meetingId,
         type:"instant",
         status:"active"
        });
        return res.status(201).json({
            success:true,
            meetingId,
        });


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Server error",
        });
    }
}
exports.createMeetingLater=async (req,res)=>{
    try{
        let meetingId;
        let exists=true;
        while(exists){
            meetingId = Math.random().toString(36).substring(2, 10);
            exists = await lobby.findOne({ meetingId });
        }
        await lobby.create({
         meetingId,
         type:"scheduled",
         scheduledFor: req.body.scheduledFor,
         status:"scheduled"
        });
        return res.status(201).json({
            success:true,
            meetingId,
        });


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Server error",
        });
    }
}