const express = require('express');
const  axios = require('axios');

const logRequests = (req, res, next) => {
  const {method, url} = req;

  const logLabel = `[${method.toUpperCase()}] ${url}`;
  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
}

const app = express();
app.use(express.json());
app.use(logRequests);

const events = [];

app.get('/events', async (req, res) => {
  res.send(events);
});

app.post('/events', async (req, res) => {
  const event = req.body;

  events.push(event);

  try {
    await axios.post('http://posts-clusterip-srv:4000/events', event);
    await axios.post('http://comments-srv:4001/events', event);
    await axios.post('http://query-handler-srv:4002/events', event);
    await axios.post('http://comments-moderator-srv:4003/events', event);
  } catch (error) {
    console.log('Some services seem down');
  }

  res.send({status: "OK"});
});

app.listen(4005, () => {
  console.log(`🚀 Server listening on port 4005`);
});