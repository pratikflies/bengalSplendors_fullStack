const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel.js');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a tour name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must have less or equal than 40 charactrers!',
      ],
      minlength: [10, 'A tour must have more than or equal to 10 characters! '],
      // validate: [validator.isAlpha, 'Tour name must only contain characters!'], //just to show how to use the validator module (use npm i validator to install as dependency first)
    },
    slug: { type: String },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size.'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Diffculty is either: easy,medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Ratings must be above 1.0.'],
      max: [5, 'Ratings must be below 5.0.'],
      set: (val) => Math.round(val * 10) / 10, //ex 4.66666*10=46.666,round=47/10=4.7
    },
    ratingsQuantity: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    price: { type: Number, required: [true, 'A tour must have a price.'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to current doc on new document CREATION
          return val < this.price; //100<200
        },
        message: 'Discount price ({VALUE}) should be below regular price.',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description.'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a Cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
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
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//creating an index on the basis of price and ratingsAverage
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 }); //compound index
tourSchema.index({ slug: 1 });
//indexing for geospatial queries
tourSchema.index({ 'startLocation.coordinates': '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
//Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//middleware to embed users in tour schema as guides
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// // //DOCUMENT MIDDLEWARE: runs before .save() and .create() only
tourSchema.pre('save', function (next) {
  //   console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', function (next) {
//   console.log('Will save the document now...');
//   next();
// });
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });
//QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next)

  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
// tourSchema.post(/^find/, function (docs, next) {
//   // console.log(`Query took ${Date.now() - this.start}milliseconds`);
//   // console.log(docs);

//   next();
// });
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
