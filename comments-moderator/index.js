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

app.post('/events', async (req, res) => {
  const {type, data} = req.body
  console.log(`[EVENTS] -> Received ${type}`);

  switch(type){
    case "CommentCreated":
      let {status, content} = data;
      
      status = content.toLowerCase().includes('fuck') ? 'rejected' : 'approved';

      await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentModerated',
        data: {
         ...data,
         status
        }
      });

      break;
    default:
      break;
  }

  res.send({});
});

app.listen(4003, () => {
  console.log(`🚀 Server listening on port 4003`);
});