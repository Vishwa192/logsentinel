import { kafka, LOG_TOPIC } from "./kafka";
import { getDB, LOGS_COLLECTION } from "./mongo";

const consumer = kafka.consumer({groupId: 'log-processor-group'});

async function run() {
    const db=await getDB();
    const logsCollections = db.collection(LOGS_COLLECTION);

    await consumer.connect();
    await consumer.subscribe({topic: LOG_TOPIC, fromBeginning: true});

    console.log("Consumer connected. Listening for logs...");

    await consumer.run({
        eachMessage: async({topic, partition, message}) =>{
            const value = message.value?.toString();
            
            if(!value) return;

            const log = JSON.parse(value);
            await logsCollections.insertOne(log);
            console.log('Stored:', log.service, log.level, log.message);
        }
    });
}
run().catch(console.error);