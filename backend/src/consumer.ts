import { kafka, LOG_TOPIC } from "./kafka";
import { getDB, LOGS_COLLECTION } from "./mongo";
import { recordError, isSpike, getRecentErrors } from "./errorTracker";
import { generateRootCauseSummary } from "./ai-summary";

const consumer = kafka.consumer({groupId: 'log-processor-group'});
const alreadySummarized = new Set<string>();

async function run() {
    const db=await getDB();
    const logsCollections = db.collection(LOGS_COLLECTION);
    const incidentsCollection = db.collection('incidents');

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
                const count = await  recordError(log.service, log.message, log.timeStamp);
                console.log(`[Stored Error]: ${log.service} - ${log.message} (window count: ${count})`)

                const minuteBucket = Math.floor (Date.now() /1000/60);
                const spikeKey = `${log.service}:${minuteBucket}`;

                if(isSpike(count)){
                    console.log(`⚠️ SPIKE DETECTED: ${log.service} has ${count} errors in the last minute!`);

                    if(!alreadySummarized.has(spikeKey)){
                        alreadySummarized.add(spikeKey);
                        console.log(`🤖 Generating AI summary for ${log.service}...`);

                        const recentErrors = await getRecentErrors(log.service);
                        const summary = await generateRootCauseSummary(log.service, recentErrors);

                        console.log(`🤖 AI Summary: ${summary}`)

                        await incidentsCollection.insertOne({
                            service: log.service,
                            errorCount: count,
                            summary,
                            status: 'open',
                            detectedAt: new Date().toISOString(),
                            resolvedAt: null
                        })
                    }
                }else{
                    console.log(`Stored: ${log.service} ${log.level} ${log.message}`);
                }
            }

            // console.log('Stored:', log.service, log.level, log.message);
        },
    });
}
run().catch(console.error);