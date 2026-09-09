import express from 'express';
import cors from 'cors';
import { getDB, LOGS_COLLECTION } from './mongo';
import { getCurrentErrorCount } from './errorTracker';
import { ObjectId } from 'mongodb';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
const KNOWN_SERVICES = ['payment_service', 'auth_service', 'notification_service']

app.get('/api/live-stats', async(req,res)=>{
    const liveStats = await Promise.all(
        KNOWN_SERVICES.map(async (service)=>({
            service,
            currentErrorCount: await getCurrentErrorCount(service)
        }))
    );
    res.json(liveStats);
});

app.get('/api/logs', async (req, res) =>{
    const db =  await getDB();
    const logs = await db
    .collection(LOGS_COLLECTION)
    .find({})
    .sort({timeStamp: -1})
    .limit(50)
    .toArray();
    res.json(logs);
});

app.get('/api/stats', async (req, res)=>{
    const db = await getDB();
    const stats = await db
    .collection(LOGS_COLLECTION)
    .aggregate([
        {$match: {level : 'error'}},
        {$group: {_id: '$service', errorCount: {$sum: 1}}}
    ])
    .toArray();
    res.json(stats);
});

app.get('/api/incidents', async(req, res) => {
    const db = await getDB();
    const incidents =await db.collection('incidents')
    .find({})
    .sort({detectedAt: -1})
    .limit(20)
    .toArray();
    res.json(incidents);
});

app.patch('/api/incidents/:id/resolve', async(req, res) => {
    const db = await getDB();
    const {id} =  req.params;

    const result = await db.collection('incidents').updateOne(
        {_id: new ObjectId(id)},
        {$set: {status: 'resolved', resolvedAt: new Date().toISOString()}}
    );
    res.json({success: result.modifiedCount === 1});
})

app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
})