export {Channel, any};

class Channel {
	#senders = [];
	#getters = [];
	#status = 'open';

	constructor(){};
	
	closed() {return this.#status == 'closed';}
	close() {this.#status = 'closed';}

	get(){
		return new Promise(res => {
			if(this.closed()) {
				res(null);
			} else if(this.#senders.length > 0){
				const {sender, msg} = this.#senders.pop();
				sender(true);
				res(msg);
			} else {
				this.#getters.push(res);
			}
		});
	}

	send(msg){
		return new Promise(res => {
			if(this.closed()) {
				res(false);
			} if(this.#getters.length > 0) {
				this.#getters.pop()(msg);
				res(true);
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
