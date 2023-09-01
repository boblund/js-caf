// Software license: Creative Commons Attribution-NonCommercial 4.0 International
//
// THIS SOFTWARE COMES WITHOUT ANY WARRANTY, TO THE EXTENT PERMITTED BY APPLICABLE LAW.

import {Channel} from './Channel.mjs';

async function f1(ch, {key}){
	await f2Chan.send(`hello`);
	await f3Chan.send('hello');
	f2Chan.close(); // line 20 is never reached without this;
	let msg = await ch.get(key);
	console.log(`f1 received ${msg}`);
};

async function f2(ch, {args}){
	for await (const msg of ch){
		console.log(`f2(${JSON.stringify(args)}) received ${msg}`);
		await f1Chan.send(`${msg} back`);
	}
	console.log(`f2Chan is closed`);
};

async function f3(ch){
	console.log(`f3 received ${await ch.get()}`);
};

// Order is important. f2Chan and f3Chan must be defined when f1 starts
const f2Chan = new Channel;
f2(f2Chan, {args: {arg1: 1}});

const f3Chan = new Channel;
f3(f3Chan);

const getKey = Symbol();
const f1Chan = new Channel(getKey);
f1(f1Chan, {getKey}); // key required for get()
