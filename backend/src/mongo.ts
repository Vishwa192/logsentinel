import {MongoClient} from 'mongodb'

const mongoURL = 'mongodb://localhost:27017';
const DB_NAME = 'logsentinel';

const client = new MongoClient(mongoURL);
let connected = false;

export async function getDB(){
    if(!connected){
        await client.connect();
        connected = true;
        console.log("connected to mongo db");
    }
    return client.db(DB_NAME);
}

export const LOGS_COLLECTION = 'logs';