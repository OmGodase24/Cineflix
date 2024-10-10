const CustomError = require('../utils/CustomError');
const User = require('./../Models/userModel')
const asyncErrorHandler = require('./../utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const util = require('util');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const signToken = id =>{
    return jwt.sign({id},process.env.SECRET_STR,{
        expiresIn:process.env.LOGIN_EXPIRES
    })
}

const createSendResponse = (user,statusCode,res)=>{

    const token = signToken(user._id)

    res.status(statusCode).json({
        status : 'success',
        token,
        data : {
            user
        }
    })

}

exports.signup = asyncErrorHandler(async (req,res,next)=>{

    const newUser = await User.create(req.body);

    createSendResponse(newUser,201,res)



});

exports.login = asyncErrorHandler(async(req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;

    //We can also use Object Destrcuring syntax
    //const {email,password} = req.body;
    //Check if email & password is present in request body
    if(!email || !password){
        const error = new CustomError('Please provide email ID & Password for login in!',400);
        return next(error);
    }

    //Check if user exists with given email 
    const user = await User.findOne({email}).select('+password');

    //const isMatch = await user.comparePasswordInDb(password,user.password);

    if(!user || !(await user.comparePasswordInDb(password,user.password))){
        const error = new CustomError('InCorrect email or password',400)
        return next(error)
    }

    createSendResponse(user,200,res)


})

exports.protect = asyncErrorHandler(async(req,res,next)=>{

    //1. Read he token & check if it exists

    const testToken = req.headers.authorization;
    let token;
    if(testToken && testToken.startsWith('Bearer')){
        token = testToken.split(' ')[1];
    }
    if(!token){
        next(new CustomError('You are not logged in!',401))
    }

    //2.Validate the token
                        //util.promisify(jwt.verify) This will return a func which will retrun a promise 
                        //(token,process.env.SECRET_STR); and then we are calling that function by using set of paranthesis and passing required arguments
                        //The expression complete will return  a decoded token

    const decodedToken = await util.promisify(jwt.verify)(token,process.env.SECRET_STR);

    console.log(decodedToken)


    //3. If the user exists
    const user = await User.findById(decodedToken.id);

    if(!user){
        const error = new CustomError('The user with the given token does not exist',401);
        next(error);
    }


    //4. If the user changed password after the token was issued
    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
    if(isPasswordChanged){
        const error = new CustomError('The password has been changed recently,Please login again',401);
        return next(error)
    }

    //5. Allow user to access route
    req.user = user;
    next();

})

exports.restrict = (role)=>{
    return(req,res,next)=>{
        if(req.user.role !== role){
            const error = new CustomError('You do not have permission to perform this action',403);
            next(error);
        }
        next();


    }
}

//For Multiple Roles 
// exports.restrict = (...role)=>{
//     return(req,res,next)=>{
//         if(!role.includes(req.user.role)){
//             const error = new CustomError('You do not have permission to perform this action',403);
//             next(error);
//         }
//         next();
        

//     }
// }

exports.forgotPassword = asyncErrorHandler(async(req,res,next)=>{
    // 1.GET USER BASED ON POSTED EMAIL

    const user = await User.findOne({email:req.body.email})

    if(!user){
        const error = new CustomError("we could not find the user with the given email",404)
        next(error);
    }

    //2. GENERATE A RANDOM RESET TOKEN

    const resetToken = user.createResetPasswordToken();

    await user.save({validateBeforeSave:false});

    //3.SEND THE TOKEN BACK TO THE USER EMAIL

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `We have received a password reset request.Please use the below link to reset your password\n\n${resetUrl}\n\nThis reset password link will be valid only for 10 minutes.`

    try{
        await sendEmail({
            email : user.email,
            subject:'Password change request received',
            message : message
    
        });

        res.status(200).json({
            status : 'success',
            message : 'password reset link send to the user email'
        })
    }
    catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        user.save({validateBeforeSave:false});

        return next(new CustomError('There was an error sending password reset email. Please try again later',500))

    }

})

exports.resetPassword = asyncErrorHandler(async(req,res,next)=>{
    //1. IF THE USER EXISTS WITH THE GIVEN TOKEN & TOKEN HAS NOT EXPIRED
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: token,passwordResetTokenExpires:{$gt:Date.now()}
    })

    if(!user){
        const error = new CustomError('Token is invalid or has expire!',400);
        next(error);
    }

    //2. RESETING THE USER PASSWORD
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();

    user.save();

    //3. LOGIN THE USER

    createSendResponse(user,200,res)

})

