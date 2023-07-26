const Tour = require('./../models/tourModel.js');
const User = require('./../models/userModel.js');
const Bookings = require('./../models/bookingModel.js');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');

exports.getOverview = catchAsync(async (req, res) => {
  //1) get tour data from collection
  const tours = await Tour.find();

  //2) Build template

  //3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  //1) get the data for the requested tour(including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: "'review rating user",
  });
  //   console.log(tour);

  //2)Build template

  //3)render the template using data from 1)
  if (!tour) {
    return next(new AppError('There is no tour with that name!', 404));
  }
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignUpForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign Up',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) Find all bookings
  const bookings = await Bookings.find({ user: req.user.id });

  //2) Find tours with the returned ids
  const tourIDs = bookings.map((el) => el.tour);
  //We can also do virtual populate instead if manually doing it
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  });
});
