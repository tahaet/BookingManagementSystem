import mongoose, { Document, Model, model, ObjectId, Query } from 'mongoose';
import validator from 'validator';
import slugify from 'slugify';
import User, { IUser } from './userModel';
import { IReview } from './reviewModel';

interface ILocation {
  type: string;
  coordinates: number[];
  address: string;
  description: string;
}
export interface ITour extends Document {
  name: string;
  slug: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  images: string[];
  createdAt: Date;
  startDates: Date[];
  isSecret: boolean;
  startLocation: ILocation;
  locations: ILocation[];
  guides: mongoose.Types.ObjectId[];
  reviews?: IReview[];
}

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      set: (val: number) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (this: ITour, val: number): boolean {
          // 'this' only points to current doc on NEW document creation
          return val < this.price;
        },
        message: (props: { value: number }) =>
          `Discount price (${props.value}) should be below regular price`,
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    isSecret: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
  },

  {
    toJSON: {
      virtuals: true,
    },
    toObject: { virtuals: true },
    id: false, // This prevents the extra id field
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.pre('save', async function (next) {
  this.slug = slugify(this.name, { lower: true });
  //const guidePromises = this.guides.map((id) => User.findById(id));
  //this.guides = await Promise.all(guidePromises);

  next();
});

tourSchema.post('save', function (doc, next) {
  next();
});

tourSchema.pre('find', function (next) {
  this.find({ isSecret: { $ne: true } });
  next();
});

tourSchema.pre<Query<ITour, ITour>>(/^find/, function (next) {
  // Populate the guides field with the User model
  this.populate<{ guides: IUser[] }>({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.pre(
  'aggregate',
  function (next: mongoose.CallbackWithoutResultAndOptionalError) {
    if (this.pipeline()[0].hasOwnProperty('$geoNear')) next();
    else {
      this.pipeline().unshift({ $match: { isSecret: { $ne: true } } });
      next();
    }
  },
);

const Tour: Model<ITour> = model<ITour>('Tour', tourSchema);
export default Tour;
