import {kafka, LOG_TOPIC} from './kafka';

const producer =  kafka.producer();

const services = ['payment_service', 'auth_service', 'notification_service'];
const levels: Array<'info' | 'warn' | 'error'> = ['info', 'info', 'info', 'warn','error'];

const errorMessages = [
    'NullPointgerException in discount calculator',
    'Database Connection Timeout',
    'failed to process payment gateway: gateway timeout',
    'Invalid Token Signature',
    'Queue consumer lag exceeded threshold'
];

const infoMessages = [
    'Request Proceeded successfully',
    'User Authenticated',
    'Cache hit for key',
    'Health check passed'
]

function randomFrom<T>(arr: T[]): T{
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateLog(){
    const level = randomFrom(levels);
    const service = randomFrom(services);
    const message = level === 'error' ? randomFrom(errorMessages) : randomFrom(infoMessages);

    return{
        service,
        level,
        message,
        timeStamp: new Date().toISOString()
    };
}

async function run() {
    await producer.connect();
    console.log('Producer connected, sending logs every 1 sec...')

    setInterval(async() =>{
        const log = generateLog();
        await producer.send({
            topic: LOG_TOPIC,
            messages: [{value: JSON.stringify(log)}]
        });
        console.log("Sent: ",log)
    },1000)
}

run().catch(console.error);