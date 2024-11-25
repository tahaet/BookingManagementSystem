import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import User from '../models/userModel';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../AppError';
import util from 'util';
import SD from '../utils/SD';
import sendEmail from '../utils/Email';
import crypto from 'crypto';
import { ObjectId } from 'mongoose';
import Email from '../utils/Email';
function singToken(id: ObjectId, res: Response): string {
  const token = jwt.sign({ id }, process.env.JWT_SECRET || '', {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRE_IN) * 1000 * 60 * 60 * 24,
    ),
    // sameSite: 'none', // Required for cross-origin cookies
  });

  return token;
}
const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      photo: req.body.photo,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      // passwordChangedAt: req.body?.passwordChangedAt,
      role: req.body.role || SD.roleUser,
    });

    const token = singToken(newUser._id, res);
    await new Email(
      newUser,
      `${req.protocol}://${req.get('host')}/me`,
    ).sendWelcome();
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  },
);
const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new AppError('Please provide email and password', 400);
  const user = await User.findOne({ email }, { password: 1 });
  // console.log(user);
  if (!user || !(await user.checkPassword(password, user.password))) {
    throw new AppError('Incorrect email and/or password', 400);
  }
  const token = singToken(user._id, res);
  res.status(200).json({
    status: 'success',
    token: token,
  });
});
const protect = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    let token = '';
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
      token = req.cookies.jwt;
    }

    if (!token) res.redirect('/login');
    // throw new AppError(
    //   'You are not logged in! please log in an try again',
    //   401,
    // );
    const decoded: any = await util.promisify<string, string>(jwt.verify)(
      token,
      process.env.JWT_SECRET || '',
    );
    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
      throw new AppError('User that has this token is no longer exist', 404);

    if (currentUser.isPasswordChangedAfter(decoded.iat))
      throw new AppError(
        'User has recently changed his password, please try again',
        401,
      );

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  },
);

const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded: any = await util.promisify<string, string>(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET || '',
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.isPasswordChangedAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000),
    secure: process.env.NODE_ENV === 'production', // Secure in production
    // sameSite: 'lax', // Protect against CSRF
    // path: '/', // Ensure cookie is available across all paths
  });

  // Clear the Authorization header if it exists
  if (req.headers.authorization) {
    req.headers.authorization = '';
  }
  res.status(200).json({ status: 'success' });
};
const restrictTo = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role))
      next(
        new AppError("You don't have permission to access this resource", 402),
      );

    next();
  };
};

const forgotPassword = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      throw new AppError('There is no user with that email address', 404);

    const resetToken: string = user.createPasswordResetToken();
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/resetPassword/${resetToken}`;

    //const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      console.log(err);
      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          500,
        ),
      );
    } finally {
      user.save({ validateBeforeSave: false });
    }
  },
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne(
      {
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      },
      {
        password: 1,
      },
    );
    if (!user)
      throw new AppError(
        'Token is invalid or has expired, please try again',
        400,
      );
    // console.log(user);
    if (await user.checkPassword(req.body.password, user.password))
      throw new AppError(
        'This is the same old password, please choose a new one',
        400,
      );
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    const token = singToken(user._id, res);
    res.status(200).json({
      status: 'success',
      token,
    });
  },
);

const updatePassword = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id).select('+password');
    if (!user)
      throw new AppError('There is no user associated with that id', 404);

    if (!(await user?.checkPassword(req.body.currentPassword, user.password))) {
      return next(new AppError('Your current password is wrong.', 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();
    const token = singToken(user._id, res);
    res.status(200).json({
      status: 'success',
      token,
    });
  },
);
// const excludeActiveFilter = (req: any, res: Response, next: NextFunction) => {
//   req.skipActiveFilter = true;
//   next();
// };
const reactivateUserRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email }).setOptions({
      excludeFromActiveFilter: true,
    });

    if (!user)
      throw new AppError('There is no user associated with that email', 404);

    const activateToken = user.createAccountActivateToken();
    try {
      await new Email(
        user,
        `${req.protocol}://${req.get('host')}/api/v1/users/activate/${activateToken}`,
      ).sendWelcome();
      // await sendEmail({
      //   email: user.email,
      //   subject: 'Account Activation Link',
      //   message: `Click on the link below to activate your account: `,
      // });
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.accountActivateToken = undefined;
      user.accountActivateExpires = undefined;
      console.log(err);
      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          500,
        ),
      );
    } finally {
      user.save({ validateBeforeSave: false });
    }
  },
);
const activateAccount = catchAsync(async (req: Request, res: Response) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne(
    {
      accountActivateToken: hashedToken,
      accountActivateExpires: { $gt: Date.now() },
    },
    {},
  ).setOptions({
    excludeFromActiveFilter: true,
  });
  if (!user)
    throw new AppError(
      'Token is invalid or has expired, please try again',
      400,
    );

  user.active = true;
  user.passwordConfirm = req.body.passwordConfirm;
  user.accountActivateToken = undefined;
  user.accountActivateExpires = undefined;
  await user.save({ validateBeforeSave: false });
  const token = singToken(user._id, res);
  res.status(200).json({
    status: 'success',
    token,
  });
});
export default {
  signUp,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  reactivateUserRequest,
  activateAccount,
  //excludeActiveFilter,
  isLoggedIn,
  logout,
};
