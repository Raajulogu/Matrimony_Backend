import express from 'express';
import { User } from '../Models/User.js';
import jwt from 'jsonwebtoken'


let router = express.Router();

//Decode Jwt Token
const decodeJwtToken = (token)=>{
    try {
        let decoded = jwt.verify(token, process.env.SECRET_KEY);
        return decoded.id
    } catch (error) {
        console.error("Error in Jwt Decodeing",error)
        return null;
    }
}

//Favourites
router.put('/favourites', async(req,res)=>{
    try {
        let data= req.body.id;
        let userId=decodeJwtToken(req.body.token)

        let user = await User.findById({_id:userId});
        //adding new favourites to existing fvaourites list
        let favourites=[data,...user.favourites];
        let addFavourites=await User.findOneAndUpdate(
            {_id:userId},
            {$set:{favourites:favourites}}
        )

        if(!addFavourites) return res.status(400).json({message:"Error Occured"});
        
        res.status(200).json({message:"Favourites added Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Update Expectations
router.put('/update-expectations', async(req,res)=>{
    try {
        let data= req.body.data;
        let userId=decodeJwtToken(req.body.token)

        let UpdateExpectations=await User.findOneAndUpdate(
            {_id:userId},
            {$set:{expextations:data}}
        )

        if(!UpdateExpectations) return res.status(400).json({message:"Error Occured"});
        
        res.status(200).json({message:"Expectations Updated Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

// Add Interested
router.put('/add-interested', async(req,res)=>{
    try {
        let data= req.body.id;
        let userId=decodeJwtToken(req.body.token)

        //Function for adding interest
        async function addInterest({sender,reciver}){
            let user = await User.findById({_id:sender});
            //Check if reciver is alredy exist in interested data
            if(user.invitationSent.includes(reciver)){
                let invitationSent=user.invitationSent.filter((val)=>val!==reciver)
                await User.findOneAndUpdate(
                    {_id:sender},
                    {$set:{invitationSent:invitationSent}}
                )
            }
            else{
                let invitationGot=user.invitationGot.filter((val)=>val!==reciver)
                await User.findOneAndUpdate(
                    {_id:sender},
                    {$set:{invitationGot:invitationGot}}
                )
            }
            let interested=[reciver,...user.interested];
            let addInterested=await User.findOneAndUpdate(
                {_id:sender},
                {$set:{interested:interested}}
            )

            if(!addInterested) return res.status(400).json({message:"Error Occured"});
        }
        //Update for sender side
        addInterest({sender:userId,reciver:data});
        addInterest({sender:userId,reciver:data});
        
        res.status(200).json({message:"Interested added Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Remove Interested
router.put('/remove-interested', async(req,res)=>{
    try {
        let data= req.body.id;
        let userId=decodeJwtToken(req.body.token)

        //Remove
        async function removeInterest({sender,reciver}){
            let user = await User.findById({_id:sender});

            let interested=user.interested.filter((val)=>val!==reciver);
            let addInterested=await User.findOneAndUpdate(
                {_id:sender},
                {$set:{interested:interested}}
            )

            if(!addInterested) return res.status(400).json({message:"Error Occured"});
        }
        //Remove interest for sender side
        removeInterest({sender:userId,reciver:data});
        //Remove interest for recipient side
        removeInterest({sender:userId,reciver:data});
        
        res.status(200).json({message:"Interested removed Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Invitation Sent
router.put('/invitation-sent', async(req,res)=>{
    try {
        let data= req.body.id;
        let userId=decodeJwtToken(req.body.token)
        //Getting user data
        let user = await User.findById({_id:userId});
        let invitationSent=[data,...user.invitationSent];
        // Update invitation sent for sender side
        let addInvitationSent=await User.findOneAndUpdate(
            {_id:userId},
            {$set:{invitationSent:invitationSent}}
        )
        if(!addFavourites) return res.status(400).json({message:"Error Occured"});
        //Getting reciver data
        let profile = await User.findById({_id:data});
        let invitationGot=[userId,...profile.invitationGot];
        //Updating invitationsGot for reciver side
        let addInvitationGot=await User.findOneAndUpdate(
            {_id:data},
            {$set:{invitationGot:invitationGot}}
        )
        if(!addInvitationGot) return res.status(400).json({message:"Error Occured"});
        
        res.status(200).json({message:"Invitation Sent Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Add Message
router.put('/message', async(req,res)=>{
    try {
        let id= req.body.id;
        let userId=decodeJwtToken(req.body.token)
        let data=req.body.data;
        let user = await User.findById({_id:userId});

        if(!user.interested.includes(id)) return res.status(400).json({message:"Reciver Unmatched"})
        //Update message function
        async function updateMessage({sender,reciver}){

            let user = await User.findById({_id:sender});
            let messageData=user.message
            //Check if reciver is already exist
            if(messageData.reciver){
                //if yes add to existing array
                let message=[...messageData.id,data];
                messageData[reciver]=message;
            }
            else{
                //else create one for the reciver and add data
                let message=[data]
                messageData[reciver]=message;
            }
            //Updating message Data
            let addMessage=await User.findOneAndUpdate(
                {_id:userId},
                {$set:{message:messageData}}
            )
        }

        //Update message for Sender Side
        updateMessage({sender:userId,reciver:id});
         //Update message for Reciver Side
        updateMessage({sender:id,reciver:userId})

        if(!addFavourites) return res.status(400).json({message:"Error Occured"});
        
        res.status(200).json({message:"Favourites added Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Get Data Based on User Expectations;
router.get('/get-profiles', async(req,res)=>{
    try {
        let userId=decodeJwtToken(req.body.token)
        let user = await User.findById({_id:userId});
        let expextations= user.expextations;

        //Getting data based on User Expectations
        let profiles=await User.aggregate([
            {
                $match:{
                    $and:[
                        {age:{$gte:expextations.age.min,$lte:expextations.age.max}},
                        {City:expextations.city}
                    ]
                }
            }
        ])
        //Getting All Users Data
        let otherUsers=await User.findAll();
        //filtering other profiles from expectations profiles
        let allProfiles=otherUsers.filter((val)=>!profiles.includes(val))

        //declaring expectation profiles as first and other profiles comes before that
        allProfiles=[...profiles,...allProfiles];

        res.status(200).json({message:"Profiles Got Successfully",allProfiles})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})


export let userRouter=router;
