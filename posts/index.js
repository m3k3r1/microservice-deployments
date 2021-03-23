const express = require('express');
const cors = require('cors');
const { randomBytes } = require('crypto');
const axios = require('axios');

const logRequests = (req, res, next) => {
  const {method, url} = req;

  const logLabel = `[${method.toUpperCase()}] ${url}`;
  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
}

const app = express();
app.use(express.json());
app.use(cors());
app.use(logRequests);

const posts = {};

app.get('/posts', (req,res) => {
  res.send(posts);
});

app.post('/posts', async (req,res) => {
  const id = randomBytes(4).toString('hex');
  const {title} =req.body; 

  posts[id] = {
    id,
    title
  };

  await axios.post('http://localhost:4005/events', {
    type: 'PostCreated',
    data: posts[id]
  });

  res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
  const event = req.body
  console.log(`[EVENTS] -> Received ${event.type}`);
  res.send({});
});

app.listen(4000, () => {
  console.log('v0.0.2');
  console.log(`🚀 Server listening on port 4000`);
});