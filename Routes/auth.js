import express from 'express';
import bcrypt from 'bcrypt';
import { User, generateJwtToken } from '../Models/User.js';
import jwt from 'jsonwebtoken'
import multer from 'multer';

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

//SignUp
router.post('/signup', async(req,res)=>{
    try {

        //Find User is already registered
        let user = await User.findOne({email: req.body.email});
        if(user) return res.status(400).json({message:"Email already registered"});

        //generate hashed password
        let salt = await bcrypt.genSalt(9)
        let hashedPassword = await bcrypt.hash(req.body.password,salt);

        //Add new user to DB
        let newUser = await new User({
            name: req.body.name,
            email: req.body.email,
            phone:req.body.phone,
            password: hashedPassword,
            gender: req.body.gender,
            dob:req.body.dob,
            age:req.body.age,
            City:req.body.city
        }).save();

        //generate jwtToken
        let token=generateJwtToken(newUser._id)
        res.status(200).json({message:"SignUp Successfully", token})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Login
router.post('/login', async(req,res)=>{
    try {
        //Find User is available
        let user = await User.findOne({email: req.body.email});
        if(!user) return res.status(400).json({message:"Invalid Credentials"});
        
        //Validate password
        let validatePassword = await bcrypt.compare(
            req.body.password,
            user.password
        )
        if(!validatePassword) return res.status(400).json({message:"Invalid Credentials"});

        //generate jwtToken
        let token=generateJwtToken(user._id)
        res.status(200).json({message:"Login Successfully", token})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Reset password
router.put('/reset-password', async(req,res)=>{
    try {
        //Find User is available
        let user = await User.findOne({email: req.body.email});
        if(!user) return res.status(400).json({message:"Invalid Credentials"});
        //generate hashed password
        let salt = await bcrypt.genSalt(9)
        let hashedPassword = await bcrypt.hash(req.body.password,salt);
        
        let updatePassword=await User.findOneAndUpdate({
            email:email,
            $set:{password:hashedPassword}
        })

        //generate jwtToken
        let token=generateJwtToken(user._id)
        res.status(200).json({message:"Password Reseted Successfully", token})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Get User Data 
router.get('/get-user-data', async(req,res)=>{
    try {
        let userId=decodeJwtToken(req.body.token)
        let user = await User.findById({_id:userId});

        res.status(200).json({message:"User Data Got Successfully",user})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

// Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//Update User Data 
router.put('/update-user-data',upload.single('image'), async(req,res)=>{
    try {
        let userId=decodeJwtToken(req.body.token)
        let data=req.body.data;
        let {originalName,buffer}=req.file;
        //Updating User Data
        let updatedUser = await User.findOneAndUpdate({
            _id:userId,
            $set:{
                name: req.body.name,
                email: req.body.email,
                phone:req.body.phone,
                password: hashedPassword,
                gender: req.body.gender,
                dob:req.body.dob,
                age:req.body.age,
                City:req.body.city
            }
        })

        res.status(200).json({message:"User Data Updated Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Delete User 
router.delete('/delete-user', async(req,res)=>{
    try {
        let userId=decodeJwtToken(req.body.token)
        let user = await User.findByIdAndDelete({_id:userId});

        res.status(200).json({message:"User Deleted Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})


export let authRouter=router;