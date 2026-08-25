import { kafka, LOG_TOPIC } from "./kafka";

const consumer = kafka.consumer({groupId: 'log-processor-group'});

async function run() {
    await consumer.connect();
    await consumer.subscribe({topic: LOG_TOPIC, fromBeginning: true});

    console.log("Consumer connected. Listening for logs...");

    await consumer.run({
        eachMessage: async({topic, partition, message}) =>{
            const value = message.value?.toString();
            
            if(!value) return;

            const log = JSON.parse(value);
            console.log("Received: ",log)
        }
    });
}
run().catch(console.error);