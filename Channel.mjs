// Software license: Creative Commons Attribution-NonCommercial 4.0 International
//
// THIS SOFTWARE COMES WITHOUT ANY WARRANTY, TO THE EXTENT PERMITTED BY APPLICABLE LAW.

export {Channel, any};

class Channel {
	#senders = [];
	#getters = [];
	#status = 'open';
	#getKey = null;
	#sendKey = null;
	#closeKey = null;

	constructor({getKey, sendKey, closeKey} = {}){
		this.#getKey = getKey;
		this.#sendKey = sendKey;
		this.#closeKey = closeKey;
	};
	
	closed() {return this.#status == 'closed';}
	close(key = null) {
		if(key != this.#closeKey) throw(new Error('close() requires key'));
		this.#status = 'closed';
		if(this.#senders.length == 0){ // new for SocketPromise
			for(const getter of this.#getters){
				getter(null);
			}
		}
	}

	get(key = null){
		if(key != this.#getKey) throw(new Error('get() requires key'));
		return new Promise(res => {
			if(this.closed()) {
				res(null);
			} else if(this.#senders.length > 0){
				const {sender, msg} = this.#senders.shift();
				sender(true); // sender promise response
				res(msg); // getter promise response
			} else {
				this.#getters.push(res);
			}
		});
	}

	send(msg, key = null){
		if(key != this.#sendKey) throw(new Error('send() requires key'));
		return new Promise(res => {
			if(this.closed()) {
				res(false);
			} if(this.#getters.length > 0) {
				this.#getters.pop()(msg); // getter promise response
				res(true); // sender promise response
			} else {
				this.#senders.push({sender: res, msg});
			}
		});
	}

	async *[Symbol.asyncIterator]() {
		while (true) {
			if(this.closed()) break;
			yield await this.get();
		}
	}
}

function any(chArray){
	let allClosed = true,
		retArray = chArray.map((ch, idx) => {
			allClosed = allClosed && ch.closed();
			return ch.closed()
				? new Promise(()=>{}) // closed channel shouldn't resolve
				: new Promise((res) => { ch.get().then(msg => res({idx, msg})); }); 
		});
	return allClosed 
		? new Promise(res=>{res({idx: -1, msg: null});})
		: Promise.race(retArray);
}
