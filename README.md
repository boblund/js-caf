# JavaScript Communicating Async Functions (JS-CAF)

JS-CAF (JavaScript communicating asynchronous functions) grew out of a need to model distributed network software designs. A search for available JavaScript concurrency libraries yielded an extensive list:
[async-csp](https://github.com/dvlsg/async-csp), [Communicating Sequential Processes: an alternative to async generators](https://2ality.com/2017/03/csp-vs-async-generators.html), [We need channels (CSP section)](https://krasimirtsonev.com/blog/article/we-need-channels-intro-to-csp), [Generators and Channels in JavaScript](https://medium.com/javascript-inside/generators-and-channels-in-javascript-594f2cf9c16e), [f5io/csp](https://github.com/f5io/csp), plus others. These all proved to either not provide the desired communicating sequential process channel model or to be more complex than needed.

JS-Caf consists of a single, small (77 lines), dependency-free module exposing a Channel class that, coupled with ES2017 async functions, are all that is needed to build a Commuinicating Sequential Process (CSP) type system.

A Channel instance is a one way channel in either a closed or not closed state over which objects can be sent and received. 

A CSP is defined as an async function that sends (```await ch.send(msg)```) and receives (```msg = await ch.get()```) messages over a Channel instance. The async function can ```await``` on these operations and will resume execution when the promise resolves at some future time.

Here's an example showing JS-CAF use and features:
```
 1 import {Channel} from './Channel.mjs';
 2  
 3 async function f1(ch, {key}){
 4   await f2Chan.send(`hello`);
 5   await f3Chan.send('hello');
 6   f2Chan.close(); // line 16 is never reached without this
 7   let msg = await ch.get(key);
 8   console.log(`f1 received ${msg}`);
 9 };
10
11 async function f2(ch, {args}){
12   for await (const msg of ch){
13     console.log(`f2(${JSON.stringify(args)}) received ${msg}`);
14     await f1Chan.send(`${msg} back`);
15   }
16   console.log(`f2Chan is closed`);
17 };
18
19 async function f3(ch){
20   console.log(`f3 received ${await ch.get()}`);
21 };
22
23 // Order is important. f2Chan and f3Chan must be defined when f1 starts
24 const f2Chan = new Channel;
25 f2(f2Chan, {args: {arg1: 1}});
26
27 const f3Chan = new Channel;
28 f3(f3Chan);
29
```

# Using

Two methods are available to use js-caf.

## Local

Using SSH:

```
git clone git@github.com:boblund/js-caf.git
```

## Github.io

```Channel.mjs``` can be imported directly from github.io.

```
import {Channel} from 'https://boblund.github.io/js-caf/Channel.mjs'
```

The ```--experimental-network-imports``` option is required to use this method in nodejs, i.e.

```
node --experimental-network-imports file.mjs
```
# Class Channel

## Channel([options]) \<Channel\>

Create a new Channel instance in the not closed state. 

```
const chan = new Channel();
```

## chan.close() \<undefined\>

Close the channel.

```
chan.close()
```

## chan.closed() \<Boolean\>

Returns ```true```/```false``` if the channel is closed/not closed.

```
if(chan.closed()) ...
```

## chan.get() \<Promise\>|null

Wait for a message. Returns a Promise that resolves to the next message in the channel or ```null``` if the channel is closed.

```
const msg<Promise> = await chan.get();
```

## chan.send(msg) \<Promise\>

Put a message at the end of the channel and return a Promise. The Promise resolves to ```true```, or ```false``` if the channel is closed.

```
const r<Promise> = await chan.send(msg)
```

## chan.*[Symbol.asyncIterator] \<Promise\>

Async iterator that waits for a message. Returns a Promise that resolves to the next message or null if the channel is closed.

```
for await (const msg<Object> of chan<Channel>) { ... }
```

## Channel.anyIdx([promise1, ..., promiseN>]) \<Promise\>

Static method that returns a Promise that resolves to an object ```{idx<Number>, msg<Object>}``` where ```idx``` is the index of the first promise in the promise array parameter to resolve and ```msg``` is result of that promise. ```idx``` == -1 and ```msg``` == null if all the promises reject.
```
const {idx, msg} = await Channel.anyIdx([chan1, ...])
```
# License

Software license: Creative Commons Attribution-NonCommercial 4.0 International

**THIS SOFTWARE COMES WITHOUT ANY WARRANTY, TO THE EXTENT PERMITTED BY APPLICABLE LAW.**
