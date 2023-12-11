import mongoose from 'mongoose';

export function dbConnection(){
    // const params={
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    // }
    try {
        mongoose.connect("mongodb+srv://rajesh:rajesh145@cluster0.563jw0h.mongodb.net/Mangalyam_Matrimony?retryWrites=true&w=majority");
        console.log("Database Connected Successfully");
    } catch (error) {
        console.log("Error Connecting in DB", error)
    }
}