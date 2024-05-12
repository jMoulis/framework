import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));  // Serve static files
app.use('/', express.static('dist'));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname + '/../../public' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
