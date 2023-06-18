import {Channel, any} from './channel.mjs';

function delay(msec){return new Promise(r=>{setTimeout(()=>r(), msec);});};

const chan1 = new Channel,
	chan2 = new Channel,
	chan3 = new Channel;

// Async function 1
(async ()=>{
	await chan1.put('hello');
	const msg = await chan2.take();
	console.log(`caf 1 chan2 msg: ${msg}`);
	chan1.put('msg1');
	chan2.put('msg2');
})();

// Async function 2
(async ()=>{
	const msg = await chan1.take();
	console.log(`caf2 chan1 msg: ${msg}`);
	chan2.put(`${msg} yourself`);
	console.log(`caf 2 [chan1, chan2] ${JSON.stringify(await any([chan1, chan2]))}`);
	if(!chan1.closed) chan1.close();
	chan2.put('msg1');
	chan2.put('msg2');
	for await (const msg of chan2){
		console.log(`caf 2 chan2 async iterator msg: ${msg}`);
	}
})();

// Async function 3
(async () =>{
	await delay(2000);
	await chan2.put('msg3');
	console.log('caf 3 chan2.put msg3');
	await chan3.put('msg4');
	console.log('caf 3 chan3.put msg4');
	await chan3.put('msg5');
	console.log('caf 3 chan3.put msg5');
})();

// Async function 4
(async () =>{
	await delay(4000);
	console.log(`caf 4 chan3.takeAll(): ${await chan3.takeAll()}`);
})();

// Async function 5
(async () =>{
	await delay(6000);
	console.log(`caf 5 chan3.takeAll(): ${await chan3.takeAll()}`);
})();
