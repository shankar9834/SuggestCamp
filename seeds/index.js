const mongoose = require("mongoose");
const cities = require("./cities");
const seedHelpers = require("./seedHelpers");
const Campground = require("../models/campground");
const { places, descriptors } = require("./seedHelpers");

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("connection established");
  })
  .catch((err) => {
    console.log("ohh no error");
    console.log(err);
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seed = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
     const price=Math.floor(Math.random()*20)+10;
    const camp = new Campground({
      title: `${sample(descriptors)},${sample(places)}`,
      location: `${cities[random1000].city},${cities[random1000].state}`,
      author:'61cb40ce3f4220bf1ddf06ef',
      image: "https://source.unsplash.com/1600x900/?nature,water",
      description:
        "   Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia eum quisquam quae deserunt iste, quidem, minus a nulla nobis laudantium cupiditate eligendi ex nemo officia voluptate nisi repellat, totam numquam?",
        price
    });

    await camp.save();
  }
};

seed().then(() => {
  mongoose.connection.close();
});
