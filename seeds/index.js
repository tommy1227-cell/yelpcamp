
const mongoose = require('mongoose');
const Campground = require('../models/campground.js');
const cities = require('./cities.js')
const { descriptors, places } = require('./seedHelpers.js');


mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
  .then(() => {
    console.log('接続しています')
  })
  .catch(err => {
    console.log('接続できていません')
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const randomCityIndex = Math.floor(Math.random() * cities.length);
    const price = Math.floor(Math.random() * 2000 + 1000);
    const camp = new Campground({
      author: '68ce1f5842321a1c0612148f',
      location: `${cities[randomCityIndex].prefecture}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: `https://picsum.photos/400?random=${Math.random()}`,
      description: 'ダミーテキスト',
      price: price
    });
    await camp.save()

  }
}

seedDB().then(() => {
  mongoose.connection.close();
});