import { NextFunction, Request, Response } from 'express';
import User from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../AppError';
import factoryController from './factoryController';
import multer from 'multer';
import sharp from 'sharp';

const storage = multer.memoryStorage();
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else cb(new AppError('Please upload only images', 400));
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});
const uploadUserPhoto = upload.single('photo');
const resizeUserPhoto = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    // console.log(req.file);
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(
        `${__dirname}/../public/img/users/${req.file.filename}`,
        (err, info) => {
          if (err) {
            console.error('Error during image processing:', err);
            return next(new AppError('Error processing the image', 500));
          }
        },
      );

    next();
  },
);
const getAllUsers = factoryController.getAll(User);

const getUserById = factoryController.getModelById(User);

const deleteUser = factoryController.deleteModel(User);
const updateMe = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    if (req.body.password || req.body.passwordConfirm)
      throw new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400,
      );
    const filteredBody: any = { email: req.body.email, name: req.body.name };
    if (req.file) filteredBody.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      },
    );
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  },
);
const createUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route will not be defined, please use signup instead',
  });
};
const getMe = (req: any, res: Response, next: NextFunction) => {
  req.params.id = req.user.id;
  next();
};
const deleteMe = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);
const updateUser = factoryController.updateModel(User);

export default {
  getUserById,
  getAllUsers,
  deleteUser,
  updateUser,
  createUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
};
