import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Skill } from "../models/skillSchema.js";
import { v2 as cloudinary } from "cloudinary";

//add Skill
export const addNewSkill = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Image For Skill is Required!", 404));
  }
  const { svg } = req.files;
  const { title, proficiency } = req.body;
  if (!title || !proficiency) {
    return next(new ErrorHandler("Please Fill Full Skill Form!", 400));
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    svg.tempFilePath,
    { folder: "PORTFOLIO_SKILLS_SVGS" }
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload avatar to Cloudinary", 500));
  }
  const skill = await Skill.create({
    title,
    proficiency,
    svg: {
      public_id: cloudinaryResponse.public_id, // Set your cloudinary public_id here
      url: cloudinaryResponse.secure_url, // Set your cloudinary secure_url here
    },
  });
  res.status(200).json({
    success: true,
    message: "New Skill Added",
    skill,
  });
});
// delete skill

export const deleteSkill = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const skill = await Skill.findById(id);
  if (!skill) {
    return next(new ErrorHandler("skill not found ", 404));
  }
  const skillSvgId = skill.svg.public_id;
  await cloudinary.uploader.destroy(skillSvgId);
  await skill.deleteOne();
  res.status(200).json({
    success: true,
    message: "Skill Deleted!",
  });
});

// update skill
export const updateSkill = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let skill = await Skill.findById(id);
  if (!skill) {
    return next(new ErrorHandler("Skill not found!", 404));
  }
  const { proficiency } = req.body;
  skill = await Skill.findByIdAndUpdate(
    id,
    { proficiency },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    message: "Skill Updated!",
    skill,
  });
});
// get all skill

export const getAllSkills = catchAsyncErrors(async (req, res, next) => {
  const skills = await Skill.find();
  res.status(200).json({
    success: true,
    skills,
  });
});