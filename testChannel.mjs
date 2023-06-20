import {Channel, any} from './Channel.mjs';

function delay(msec){return new Promise(r=>{setTimeout(()=>r(), msec);});};

const chan1 = new Channel,
	chan2 = new Channel,
	chan3 = new Channel;

// Async function 1
(async ()=>{
	await chan1.send('hello');
	const msg = await chan2.get();
	console.log(`caf 1 chan2 msg: ${msg}`);
	chan1.send('msg1');
	chan2.send('msg2');
})();

// Async function 2
(async ()=>{
	const msg = await chan1.get();
	console.log(`caf2 chan1 msg: ${msg}`);
	chan2.send(`${msg} yourself`);
	console.log(`caf 2 [chan1, chan2] ${JSON.stringify(await any([chan1, chan2]))}`);
	if(!chan1.closed) chan1.close();
	chan2.send('msg1');
	chan2.send('msg2');
	for await (const msg of chan2){
		console.log(`caf 2 chan2 async iterator msg: ${msg}`);
	}
})();

// Async function 3
(async () =>{
	await delay(2000);
	await chan2.send('msg3');
	console.log('caf 3 chan2.send msg3');
	await chan3.send('msg4');
	console.log('caf 3 chan3.send msg4');
	await chan3.send('msg5');
	console.log('caf 3 chan3.send msg5');
})();
