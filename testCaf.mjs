import {Caf} from './Caf.mjs';

function delay(msec){return new Promise(r=>{setTimeout(()=>r(), msec);});};

const a = new Caf('f1', async function(){
	this.put('f2', 'hello1');
	await delay(2000);
	this.put('f2', 'hello2');
	console.log(`f1: ${JSON.stringify(await this.take())}`);
	await delay(2000);
	this.put('f2', 'hello3');
});

const b = new Caf('f2', async function(){
	let msg = await this.take();
	console.log(`f2: ${JSON.stringify(msg)}`);
	this.put(msg.source, 'hello');
	for await (const msg of this){
		console.log(`f2 async iterator msg: ${JSON.stringify(msg)}`);
	}
});

a.start();
b.start();
