import express from 'express';
import cors from'cors';
import dotenv from 'dotenv';
import { dbConnection } from './db.js';
import { userRouter } from './Routes/user.js';
import { authRouter } from './Routes/auth.js';
import { invitationRouter } from './Routes/invitations.js';
import { interestRouter } from './Routes/interests.js';


//ENV configuration
dotenv.config();

let app=express();
let PORT=process.env.PORT;

//Middlewares
app.use(express.json());
app.use(cors());

//Connecting DB
dbConnection();

//routes
app.use("/api/auth",authRouter);
app.use("/api/user",userRouter);
app.use('/api/invitation',invitationRouter);
app.use('/api/interest',interestRouter);

//server connection
app.listen(PORT,()=>console.log(`Server listening on ${PORT}`));