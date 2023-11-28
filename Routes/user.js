import express from 'express';
import bcrypt from 'bcrypt';
import { User, generateJwtToken } from '../Models/User.js';
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
        
        res.status(200).json({message:"Favourites added Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Interested
router.put('/interested', async(req,res)=>{
    try {
        let data= req.body.id;
        let userId=decodeJwtToken(req.body.token)

        let user = await User.findById({_id:userId});

        if(user.invitationSent.includes(data)){
            let invitationSent=user.invitationSent.filter((val)=>val!==data)
            await User.findOneAndUpdate(
                {_id:userId},
                {$set:{invitationSent:invitationSent}}
            )
        }
        else{
            let invitationGot=user.invitationGot.filter((val)=>val!==data)
            await User.findOneAndUpdate(
                {_id:userId},
                {$set:{invitationGot:invitationGot}}
            )
        }
        let interested=[data,...user.interested];
        let addInterested=await User.findOneAndUpdate(
            {_id:userId},
            {$set:{interested:interested}}
        )

        if(!addInterested) return res.status(400).json({message:"Error Occured"});
        
        res.status(200).json({message:"Interested added Successfully"})
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

        let user = await User.findById({_id:userId});

        let invitationSent=[data,...user.invitationSent];
        let addInvitationSent=await User.findOneAndUpdate(
            {_id:userId},
            {$set:{invitationSent:invitationSent}}
        )
        if(!addFavourites) return res.status(400).json({message:"Error Occured"});

        let profile = await User.findById({_id:data});

        let invitationGot=[data,...user.invitationGot];
        let addInvitationGot=await User.findOneAndUpdate(
            {_id:userId},
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

        async function updateMessage({sender,reciver}){

            let user = await User.findById({_id:sender});
            let messageData=user.message
            if(messageData.reciver){
                let message=[data,...messageData.id];
                messageData[reciver]=message;
            }
            else{
                let message=[data]
                messageData[reciver]=message;

            }

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

//Aggreation for match expectation
export let userRouter=router;

// {
    // id:[],
    // id2:[],
    //id3:[]
// }