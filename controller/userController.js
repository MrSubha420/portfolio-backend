import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userShema.js";
import {v2 as cloudinary} from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
// register user dashboard
export const register = catchAsyncErrors(async (req, res, next) => {
   if (!req.files || Object.keys(req.files).length === 0) {
     return next(new ErrorHandler("Avatar and ressume Required!", 400));
   }
   const { avatar } = req.files;
   
   //POSTING AVATAR dashboard
   const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
     avatar.tempFilePath,
     { folder: "AVATARS" }
   );
   
   //If cloudinary not response

   if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
      console.error(
        "Cloudinary Error:",
        cloudinaryResponseForAvatar.error || "Unknown Cloudinary error"
      );
     return next(new ErrorHandler("Failed to upload avatar to Cloudinary", 400));
    }

    const { resume } = req.files;
   
    //POSTING RESUME dashboard
  const cloudinaryResponseForResume = await cloudinary.uploader.upload(
   resume.tempFilePath,
   { folder: "MY_RESUME" }
   );
   if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
   console.error(
     "Cloudinary Error:",
     cloudinaryResponseForResume.error || "Unknown Cloudinary error");
   return next(new ErrorHandler("Failed to upload resume to Cloudinary", 400));
 }

const {
    fullName,
    email,
    phone,
    aboutme,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    twitterURL,
    facebookURL,
    linkedInURL,
} = req.body;

const user = await User.create({
   fullName,
    email,
    phone,
    aboutme,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    twitterURL,
    facebookURL,
    linkedInURL,
    avatar:{
      public_id: cloudinaryResponseForAvatar.public_id, // Set your cloudinary public_id here
      url: cloudinaryResponseForAvatar.secure_url, // Set your cloudinary secure_url here
    },
    resume: {
      public_id: cloudinaryResponseForResume.public_id, // Set your cloudinary public_id here
      url: cloudinaryResponseForResume.secure_url, // Set your cloudinary secure_url here
    },
});
generateToken(user,"User Registered",201,res);

});
// login user dashboard
export const login = catchAsyncErrors(async(req,res,next)=> {
  const {email,password} = req.body;
  if(!email || !password){
    return next(new ErrorHandler("Email and Password are required "));
  }

  const user = await User.findOne({email}).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password!"));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password"));
  }
  generateToken(user, "Login Successfully!", 200, res);
});
// logout user dashboard
export const logout = catchAsyncErrors(async (req, res, next) => {
  res.status(200).cookie("token", "", {
      httpOnly: true,
      secure:true,
      sameSite: "None",
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out!",
    });
});
// get the user data dashboard
export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});
// update user profile dashboard
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  // update message data dashboard
  const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutme: req.body.aboutme,
    githubURL: req.body.githubURL,
    instagramURL: req.body.instagramURL,
    portfolioURL: req.body.portfolioURL,
    facebookURL: req.body.facebookURL,
    twitterURL: req.body.twitterURL,
    linkedInURL: req.body.linkedInURL,
  };

  // update avatar dashboard
  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user.id);
    const profileImageId = user.avatar.public_id;
    await cloudinary.uploader.destroy(profileImageId);
    const cloudinaryResponse = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      { folder: "AVATARS" }
    );
    newUserData.avatar = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  // update resume dashboard
  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    const user = await User.findById(req.user.id);
    const resumeId = user.resume.public_id;
    await cloudinary.uploader.destroy(resumeId);
    const cloudinaryResponse = await cloudinary.uploader.upload(
      resume.tempFilePath,
      { folder: "MY_RESUME" }
    );
    newUserData.resume = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false,
  });
res.status(200).json({
  success:true,
  message: "Profile Update SuccessFully",
  user,
});
});
// update password dashboard
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler("Please Fill All Fields.", 400));
  }
  const isPasswordMatched = await user.comparePassword(currentPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect Current Password!"));
  }
  if (newPassword !== confirmNewPassword) {
    return next(
      new ErrorHandler("New Password And Confirm New Password Do Not Match!")
    );
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password Updated!",
  });
});

// get user data for portfolio

export const getUserForPortfolio = catchAsyncErrors(async (req, res, next) => {
  const id = "67015b71abedce82f8071b9c";
  const user = await User.findById(id);
  res.status(200).json({
    success: true,
    user,
  });
});

//forgot password for dashboard login
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User Not Found!", 404));
  }
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;

  const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl}  \n\n If 
  You've not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Personal Portfolio Dashboard Password Recovery`,
      message,
    });
    res.status(201).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

//RESET PASSWORD
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired.",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password & Confirm Password do not match"));
  }
  user.password = await req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  generateToken(user, "Reset Password Successfully!", 200, res);
});
