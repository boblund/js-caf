import {Caf} from './Caf.mjs';

const f1 = new Caf('f1', async function(ch){ // ch instance of ChanWrapper
	ch.sendMsg(f2,`hello`);
	let {source: {cafName}, msg} = await ch.onMsg();
	console.log(`f1 received ${cafName} ${msg}`);
});

const f2 = new Caf('f2', async function(ch){
	for await (const {source, msg} of ch){
		console.log(`f2 received ${source.cafName} ${msg}`);
		ch.sendMsg(source, `${msg} back`);
	}
});

[f1, f2].forEach(e => e.start());
