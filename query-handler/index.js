const express = require('express');
const cors = require('cors');
const  axios = require('axios');

const posts = {};

const logRequests = (req, res, next) => {
  const {method, url} = req;

  const logLabel = `[${method.toUpperCase()}] ${url}`;
  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
}

const handleEvent = (type, data)=> {
  console.log(`[EVENTS HANDLER] -> ${type} EVENT`);

  if(type === "CommentCreated"){
    const {id, content, postId, status} = data;
      
    const post = posts[postId];

    post.comments.push({
      id, content, status
    });

  } else if(type === "CommentUpdated"){
    const {id, content, postId, status} = data;
      
    const post = posts[postId];
    const comment = post.comments.find(comment => {
      return comment.id === id;
    });

    comment.content = content;
    comment.status = status;
    
  } else if(type === "PostCreated") {
    posts[data.id] = {
      ...data,
      comments: []
    }
  }
}

const app = express();
app.use(express.json());
app.use(cors());
app.use(logRequests);


app.get('/posts', (req,res) => {
  res.send(posts);
});

app.post('/events', (req, res) => {
  const {type, data} = req.body
  handleEvent(type, data);
  res.send({});
});

app.listen(4002, async () => {
  console.log(`🚀 Server listening on port 4002`);

  const res = await axios.get('http://localhost:4005/events');

  for ( let event of res.data) {
    const {type, data} = event;
    handleEvent(type, data);
  }
});