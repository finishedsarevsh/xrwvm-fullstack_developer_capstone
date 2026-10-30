const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3030;

app.use(cors());
app.use(require('body-parser').urlencoded({ extended: false }));
app.use(express.json());

const reviews_file = fs.existsSync("reviews.json") ? "reviews.json" : "data/reviews.json";
const dealerships_file = fs.existsSync("dealerships.json") ? "dealerships.json" : "data/dealerships.json";

let reviews_data = JSON.parse(fs.readFileSync(reviews_file, 'utf8'));
let dealerships_data = JSON.parse(fs.readFileSync(dealerships_file, 'utf8'));

const mongo_url = process.env.MONGO_URL || "mongodb://mongo_db:27017/";
mongoose.connect(mongo_url, {'dbName': 'dealershipsDB'}).catch(err => {
  console.log("Mongoose connecting in background or fallback to local JSON data:", err.message);
});

const Reviews = require('./review');
const Dealerships = require('./dealership');

try {
  mongoose.connection.once('open', async () => {
    try {
      await Reviews.deleteMany({});
      await Reviews.insertMany(reviews_data['reviews']);
      await Dealerships.deleteMany({});
      await Dealerships.insertMany(dealerships_data['dealerships']);
      console.log("MongoDB seeded successfully");
    } catch (e) {
      console.log("Seeding error:", e);
    }
  });
} catch (error) {
  console.log('Error initializing documents:', error);
}

// Express route to home
app.get('/', async (req, res) => {
  res.send("Welcome to the Mongoose API");
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const documents = await Reviews.find();
      return res.json(documents);
    }
    res.json(reviews_data['reviews']);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const documents = await Reviews.find({ dealership: parseInt(req.params.id) });
      return res.json(documents);
    }
    const filtered = reviews_data['reviews'].filter(r => String(r.dealership) === String(req.params.id));
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const documents = await Dealerships.find();
      return res.json(documents);
    }
    res.json(dealerships_data['dealerships']);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch Dealers by a particular state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const documents = await Dealerships.find({ state: req.params.state });
      return res.json(documents);
    }
    const filtered = dealerships_data['dealerships'].filter(d => d.state.toLowerCase() === req.params.state.toLowerCase());
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch dealer by a particular id
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const documents = await Dealerships.find({ id: parseInt(req.params.id) });
      return res.json(documents);
    }
    const filtered = dealerships_data['dealerships'].filter(d => String(d.id) === String(req.params.id));
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to insert review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  let data;
  try {
    data = typeof req.body === 'string' ? JSON.parse(req.body) : (Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body);
  } catch(e) {
    data = req.body;
  }

  let max_id = reviews_data['reviews'].reduce((max, r) => (r.id > max ? r.id : max), 0);
  let new_id = max_id + 1;

  const new_review = {
    "id": new_id,
    "name": data['name'],
    "dealership": parseInt(data['dealership']),
    "review": data['review'],
    "purchase": data['purchase'],
    "purchase_date": data['purchase_date'],
    "car_make": data['car_make'],
    "car_model": data['car_model'],
    "car_year": parseInt(data['car_year']),
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const review = new Reviews(new_review);
      const savedReview = await review.save();
      reviews_data['reviews'].push(new_review);
      return res.json(savedReview);
    } catch (error) {
      console.log(error);
    }
  }

  reviews_data['reviews'].push(new_review);
  res.json(new_review);
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
