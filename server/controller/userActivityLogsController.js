const userActivityLogModel = require("../model/userActivityLogModel");

exports.getAllApplicationLogs= async(req,res)=>{
    try {
        const logs = await userActivityLogModel.getAllUserActivityLogs() ;
        res.status(200).json(logs);
    } catch (error) {
        console.log("error getting application logs " , error);
        res.status(400).json({
            message:"failed to get logs"
        })
    }
}

