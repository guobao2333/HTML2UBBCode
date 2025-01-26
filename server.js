import express from 'express';

const PORT = 8080, app = express();
app.use(express.static('.'));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
