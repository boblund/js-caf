# JavaScript Communicating Async Functions (JS-CAF)

JS-CAF is a small, no dependency library that enables JavaScript async functions to cooperatively execute using message passing channels. Receiving of messages causes the async funtion to relinguish control. Sending of messages optionally causes the async funtion to relinguish control if ```await``` is used.

# Example

```
import {Channel, any} from './js-caf.mjs';

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
```
# API

## Channel Class

```new Channel => Channel object```

Create a new Channel object in the not closed state.
```
const chan = new Channel();
```

### Channel Methods

```close() => undefined```

Close the channel.
```
chan.close()
```

```closed() => boolean```

Returns ```true```/```false``` if the channel is closed/not closed.
```
if(chan.closed()) ...
```

```put(msg) => Promise```

Put a message at the end of the channel and return a Promise. If called with ```await``` the caller will suspend execution otherwise execution continues. The Promise resolves to ```true``` or ```false``` if the channel is closed.
```
[await] chan.put(msg)
```

```[Symbol.asyncIterator]() => Iterator```

Allows Channels to be used in for...of loops. It returns a Channel iterator object that yields the value of each index in a Channel.

```
for await (const msg of chan) { ... }
```

```take() => Promise```

Return a Promise that resolves to the next message in the channel or ```null``` if the channel is closed.
```
const msg = await chan.take()
```

```takeAll() => Promise```

Return a Promise that resolves to all the messages currently in the channel
```
const msgArray = await chan.takeAll()
```

## any

```any([chan1, ..., chanN]) => {idx, msg}```

Return a Promise that resolves to an object with the next message in one the channels or ```null``` if all the channels are closed. The object ```idx``` is the index of the channel in the channel array parameter and ```msg``` is the next message from the channel.
```
const {idx, msg} = any([chan1, chan2])
```
# License

Software license: Creative Commons Attribution-NonCommercial 4.0 International

THIS SOFTWARE COMES WITHOUT ANY WARRANTY, TO THE EXTENT PERMITTED BY APPLICABLE LAW.
