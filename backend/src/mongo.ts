import {MongoClient} from 'mongodb'
import { MONGO_URL, DB_NAME } from './constants';

const client = new MongoClient(MONGO_URL);
let connected = false;

export async function getDB(){
    if(!connected){
        await client.connect();
        connected = true;
        console.log("connected to mongo db");
    }
    return client.db(DB_NAME);
}

// export const LOGS_COLLECTION = 'logs';