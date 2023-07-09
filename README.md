# JavaScript Communicating Async Functions (JS-CAF)

JS-CAF (JavaScript communicating asynchronous functions) is a small, no dependency library that enables JavaScript async functions to cooperatively execute using message passing channels. A ```Caf``` instance is created with an optional name and a user defined async function, that is called with a ```ChanWrapper``` instance ```ch```. A ```ch``` has methods to send/receive messages to/from other CAF instances.

```
import {Caf} from './Caf.mjs';

const f1 = new Caf('f1', async function(ch){ // ch instance of ChanWrapper
	ch.sendMsg(f2,`hello`);
	let {source: {cafName}, msg} = await ch.onMsg();
	console.log(`f1 received ${cafName} ${msg}`);
});

const f2 = new Caf('f2', async function(ch){
	for await (const {source, msg} of ch){
		console.log(`f2 received ${source.cafName} ${msg}`);
		ch.sendMsg(source,`${msg} back`);
	}
});

[f1, f2].forEach(e => e.start());
```

```Caf``` and ```ChanWrapper``` automatically associate a message channel ```Channel``` with an async function, provide the source ```Caf``` instance to a message receiver and control access to the underlying message channel. ```Channel``` can also be used directly by async functions.

```
import {Channel, any} from './Channel.mjs';

const chan1 = new Channel,
	chan2 = new Channel;

// Async function 1
(async ()=>{
	chan2.send('hello');
	const msg = await chan1.get();
	console.log(`caf 1 chan1 msg: ${msg}`);
})();

// Async function 2
(async ()=>{
	for await (const msg of chan2){
		console.log(`caf 2 chan2 msg: ${msg}`);
		chan1.send(`${msg} back`);
	}
})();
```

# Caf API

## Caf() Constructor

Create a new Caf instance named `cafName` running async function ```function```. The Caf name is purely for debugging/logging purposes and can be the empty string.

```
const caf<Caf> = new Caf(cafName<String>, function<Function>);
```

## Caf.cafName

Getter that returns the Caf instance's name.

```
const name<String> = caf.cafName;
```

## Caf.start()

Calls the caf instance's async function.

```
caf.start();
```

# ChanWrapper API

The ChanWrapper class provides a Channel interface tailored to the Caf class. It does not have a publically accessible constructor; a new ChanWrapper instance is created for each Caf instance and passed as an argument to the Caf function.

## ch.onMsg()<Promise>

Wait for a message on the Caf instance's chanWrapper. Returns a Promise that resolves to an object with the message source and message ```{source<Caf>, msg<Object> }```.

```
const msg<Promise> = await ch.onMsg();
```

## ch.sendMsg()<Promise>

Send a message to another Caf instance. Returns a Promise that resolves to ```true```.

```
ch.sendMsg(receiver<Caf>, msg<Object);
```

## ch.*[Symbol.asyncIterator]<Promise>

Async iterator that waits for a message on the Caf instance's chanWrapper. Returns a Promise that resolves to an object with the message source and message.

```
for await(const {source<Caf>, msg<Object>} of ch){...};
```

# Channel API

## Channel() Constructor

Create a new Channel instance in the not closed state.
```
const chan = new Channel;
```

## chan.close()

Close the channel.

```
chan.close()
```

## chan.closed()

Returns ```true```/```false``` if the channel is closed/not closed.

```
if(chan.closed()<Boolean>) ...
```

## chan.get()<Promise>

Wait for a message. Returns a Promise that resolves to the next message in the channel or ```null``` if the channel is closed.

```
const msg<Promise> = await chan.get();
```

## chan.send()<Promise>

Puts a message at the end of the channel and returns a Promise. The Promise resolves to ```true``` or ```false``` if the channel is closed.

```
const r<Promise> = await chan.send(msg)
```

## chan.*[Symbol.asyncIterator]

Async iterator that waits for a message. Returns a Promise that resolves to the next message or null if the channel is closed.

```
for await (const msg<Object> of chan<Channel>) { ... }
```

# any interface

## any([chan1, ..., chanN])<Promise>

Get the next message from any of the channels. Returns a Promise that resolves to an object ```{idx<Number>, msg<Object>}``` where ```idx``` is the index of the channel in the channel array parameter and ```msg``` is the next message from the channel. ```idx``` == -1 and ```msg``` == null if all the channels are closed.
```
const r<Promise> = await any([chan1<Channel>, ...])
```
# License

Software license: Creative Commons Attribution-NonCommercial 4.0 International

THIS SOFTWARE COMES WITHOUT ANY WARRANTY, TO THE EXTENT PERMITTED BY APPLICABLE LAW.
