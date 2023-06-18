import {Channel} from './channel.mjs';
export {Caf};

class Caf {
	static #channels = new WeakMap();	// channel instances for Cafs by name
	#func = null;											// Caf instance function
	#chanWrapper = null;							// Instance of ChanWrapper passed to #func
	#cafName;													// Debugging only

	static #ChanWrapper = class ChanWrapper {
		#channel = null; // Instance of actual Channel wrapped in ChanWrapper
		//#name = '';
		#cafThis  = null;

		constructor(/*name, */callerThis){
			Caf.#channels.set(callerThis, (this.#channel = new Channel));
			//this.#name = name;
			this.#cafThis = callerThis;
		};

		async sendMsg(dest, msg){ return await Caf.#channels.get(dest).put({source: this.#cafThis, msg}); };
		async onMsg(){return await this.#channel.take();};
		async onMsgAll(){return await this.#channel.takeAll();};
		async *[Symbol.asyncIterator](){
			while (true) {
				yield await this.#channel.take();
			}
		};
	}; // class ChanWrapper

	constructor(name, f){
		this.#func = f;
		this.#chanWrapper = new Caf.#ChanWrapper(/*name, */this);
		this.#cafName = name;
	}
	get cafName(){ return this.#cafName; }
	start(){this.#func(this.#chanWrapper);}
} // class Caf
