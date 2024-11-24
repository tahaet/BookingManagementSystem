import express from 'express';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';
import SD from '../utils/SD.js';
// import multer from 'multer';
const router = express.Router();
// const upload = multer({ dest: `${__dirname}/../public/img/users` });

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.post(
  '/activateAccountRequest',
  //authController.excludeActiveFilter,
  authController.reactivateUserRequest,
);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/activateAccount/:token', authController.activateAccount);
router.patch(
  '/changePassword',
  authController.protect,
  authController.updatePassword,
);
router.use(authController.protect);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);
router.delete('/deleteMe', userController.deleteMe);
router.get('/me', userController.getMe, userController.getUserById);

router.use(authController.restrictTo(SD.roleAdmin));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
