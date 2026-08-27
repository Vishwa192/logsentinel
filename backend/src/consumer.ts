import { kafka, LOG_TOPIC } from "./kafka";
import { getDB, LOGS_COLLECTION } from "./mongo";
import { recordError, isSpike } from "./errorTracker";

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

            if(log.level === 'error'){
                const count = await  recordError(log.service);
                console.log(`[Stored Error]: ${log.service} - ${log.message} (window count: ${count})`)

                if(isSpike(count)){
                    console.log(`⚠️ SPIKE DETECTED: ${log.service} has ${count} errors in the last minute!`)
                }else{
                    console.log(`Stored: ${log.service} ${log.level} ${log.message}`);
                }
            }

            // console.log('Stored:', log.service, log.level, log.message);
        },
    });
}
run().catch(console.error);