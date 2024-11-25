import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: './config.env' });
import mongoose from 'mongoose';
import app from './app.js';
import Tour from './models/tourModel.js';
import Review from './models/reviewModel.js';
import User from './models/userModel.js';
import express from 'express';
process.on('uncaughtException', (err: any) => {
  console.log(`${err.name}: ${err.message}`);
  process.exit(1);
});
const DB = process.env.DATABASE?.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD || '',
);
// const tours = JSON.parse(
//   fs.readFileSync('./dev-data/data/tours.json', 'utf-8'),
// );
// const users = JSON.parse(
//   fs.readFileSync('./dev-data/data/users.json', 'utf-8'),
// );
// const reviews = JSON.parse(
//   fs.readFileSync('./dev-data/data/reviews.json', 'utf-8'),
// );

mongoose
  .connect(DB || '')
  .then(async () => {
    // await Tour.deleteMany();
    // await Review.deleteMany();
    // await User.deleteMany();
    // await Tour.create(tours);
    // await User.create(users, { validateBeforeSave: false });
    // await Review.create(reviews);
  })
  .catch((err) => console.log(err));
// Tour.syncIndexes()
//   .then(() => console.log('Indexes synchronized with the database'))
//   .catch((err) => console.log('Error synchronizing indexes', err));
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
process.on('unhandledRejection', (err: any) => {
  console.log(`${err.name}: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
