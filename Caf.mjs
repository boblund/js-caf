import {Channel} from './js-caf.mjs';
export {Caf};

class Caf {
	static #channels = {};
	#name = '';
	#func = null;
	#chan = null;

	constructor(name, f){
		if(Caf.#channels[name] == undefined) {
			this.#name = name;
			this.#func = f;
			Caf.#channels[name] = this.#chan = new Channel;
		}
	};

	async *[Symbol.asyncIterator](){
		if(this.#chan.closed()) return;
		while (true) {
			yield await this.#chan.take();
		}
	};

	async put(name, message){
		return await Caf.#channels[name].put({source: this.#name, data: message});
	};
	async start(){await this.#func();}
	async take(){ return await this.#chan.take(); };
	async takeAll(){ return await this.#chan.takeAll(); };
};
