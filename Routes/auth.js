import express from 'express';
import bcrypt from 'bcrypt';
import { User, generateJwtToken } from '../Models/User.js';

let router = express.Router();

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
        console.log(user);
        let token=generateJwtToken(user._id)
        res.status(200).json({message:"Login Successfully", token})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})


//Update User
//Delete User
//Reset Password

export let authRouter=router;