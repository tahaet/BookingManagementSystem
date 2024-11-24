import mongoose, {
  Schema,
  Document,
  Model,
  Query,
  CallbackWithoutResultAndOptionalError,
  model,
  ObjectId,
} from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export interface IUser extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  photo?: string;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  role: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active: boolean;
  accountActivateToken?: String;
  accountActivateExpires?: Date;
  checkPassword(inputPassword: string, userPassword: string): Promise<boolean>;
  isPasswordChangedAfter(JwtTimestamp: number): boolean;
  createPasswordResetToken(): string;
  createAccountActivateToken(): string;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "Name can't be empty"],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    minlength: 8,
    required: [true, 'Password is required'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on "save" and "create"
      validator: function (this: IUser, value: string): boolean {
        return value === this.password;
      },
      message: "Passwords don't match",
    },
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  accountActivateToken: String,
  accountActivateExpires: Date,
});

userSchema.pre<IUser>(
  'save',
  async function (next: CallbackWithoutResultAndOptionalError) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;
    next();
  },
);

userSchema.pre<IUser>(
  'save',
  function (next: CallbackWithoutResultAndOptionalError) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = new Date(Date.now() - 1000); // Subtract 1 second
    next();
  },
);

userSchema.pre<Query<IUser, IUser>>(/^find/, function (next) {
  // if ((this as any).skipMiddleware) {
  //   return next();
  // }
  if (this.getOptions()['excludeFromActiveFilter']) return next();
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.checkPassword = async function (
  inputPassword: string,
  userPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(inputPassword, userPassword);
};

userSchema.methods.isPasswordChangedAfter = function (
  JwtTimestamp: number,
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );
    return changedTimestamp > JwtTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

userSchema.methods.createAccountActivateToken = function (): string {
  const activateToken = crypto.randomBytes(32).toString('hex');

  this.accountActivateToken = crypto
    .createHash('sha256')
    .update(activateToken)
    .digest('hex');
  this.accountActivateExpires = new Date(Date.now() + 10 * 60 * 1000);

  return activateToken;
};
const User: Model<IUser> = model<IUser>('User', userSchema);

export default User;
