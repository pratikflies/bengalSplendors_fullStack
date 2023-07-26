const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel.js');
const Booking = require('./../models/bookingModel.js');
const catchAsync = require('./../utils/catchAsync.js');
const factory = require('./handlerFactory.js');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  //2) create a checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          unit_amount: tour.price * 100,
          currency: 'inr',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            //images: works when hosted only
          },
        },
      },
    ],
  });
  //3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //This is temporary,because it's unsecure: Everyone can make a booking without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
