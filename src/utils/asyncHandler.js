// //METHOD-1

// //promises code
// const asyncHandler=(requestHandler)=>{
//     return (req,res,next)=>{
//         Promise.resolve(requestHandler(req,res,next)).
//         catch((err)=>next(err));
//     }
// }


//METHOD-2

// try catch code

const asyncHandler=(fn)=>{
return async (req,res,next) => {
    try{
        await fn(req,res,next);
    }
    catch(err){
        res.status(err.code || 500).json({
            success:false,
            message:err.message || "Internal Server Error"
        })
    }
}}

export default asyncHandler;




