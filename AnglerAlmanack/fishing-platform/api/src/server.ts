import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import trophyRoutes from './routes/trophy.routes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/trophies', trophyRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Fishing Platform API');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});