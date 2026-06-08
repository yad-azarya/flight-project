import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// הגדרת מבנה הנתונים ב-MongoDB לפי דרישות הפרויקט
const IndicatorSchema = new mongoose.Schema({
  altitude: { type: Number, min: 0, max: 3000, required: true },
  hsi: { type: Number, min: 0, max: 360, required: true },
  adi: { type: Number, min: -100, max: 100, required: true },
});

const Indicator = mongoose.model('Indicator', IndicatorSchema);

// קליטת נתונים ושמירתם
app.post('/api/indicators', async (req: Request, res: Response) => {
  try {
    const newData = new Indicator(req.body);
    await newData.save();
    res.status(201).json(newData);
  } catch (error) {
    res.status(400).json({ error: 'שגיאה בשמירת הנתונים. ודא שהערכים בטווח המותר.' });
  }
});

// שליפת הנתונים העדכניים ביותר
app.get('/api/indicators/latest', async (req: Request, res: Response) => {
  try {
    const data = await Indicator.findOne().sort({ _id: -1 });
    res.json(data || { altitude: 0, hsi: 0, adi: 0 });
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בשליפת נתונים' });
  }
});

// שורת החיבור הייעודית שלך ל-MongoDB Atlas בענן!
const MONGO_URI = 'mongodb://admin:admin123@ac-utuqr8k-shard-00-00.b3lxzot.mongodb.net:27017,ac-utuqr8k-shard-00-01.b3lxzot.mongodb.net:27017,ac-utuqr8k-shard-00-02.b3lxzot.mongodb.net:27017/?ssl=true&replicaSet=atlas-qcyp8d-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas (Cloud) Successfully!');
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch(err => console.error('MongoDB connection error:', err));