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


const postComments = {};

app.get('/posts/:postId/comments',(req,res) => {
  const { postId } = req.params; 
  const comments = postComments[postId] || [];
  res.send(comments);
});

app.post('/posts/:postId/comments', async (req,res) => {
  const id = randomBytes(4).toString('hex');
  const { content } =req.body; 
  const { postId } = req.params; 

  const comments = postComments[postId] || []; 

  comments.push({
    id,
    content,
    status: 'pending'
  });

  postComments[postId] = comments;

  await axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: {
      id,
      content,
      status: 'pending',
      postId
    }
  });

  res.status(201).send(comments);
});

app.post('/events', async (req, res) => {
  const {type, data} = req.body
  console.log(`[EVENTS] -> Received ${type}`);

  if (type === "CommentModerated") {
    const {postId, id , status} = data;

    const comments = postComments[postId];
    const comment = comments.find(comment => {
      return comment.id === id;
    });

    comment.status = status;

    await axios.post('http://localhost:4005/events', {
      type: 'CommentUpdated',
      data: {
        ...comment,
        postId
      }
    });
  }

  res.send({});
});

app.listen(4001, () => {
  console.log(`🚀 Server listening on port 4001`);
});