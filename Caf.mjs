export {Caf};
import {Channel} from './Channel.mjs';

class Caf {
	static #channels = new WeakMap();	// channel instances for Cafs by Caf object
	#func = null;											// Caf instance function
	#chanWrapper = null;							// Instance of ChanWrapper passed to #func
	#cafName;													// Debugging/logging only

	static #ChanWrapper = class ChanWrapper {
		#channel = null; // Instance of actual Channel wrapped in ChanWrapper
		#cafThis  = null;

		constructor(callerThis){
			Caf.#channels.set(callerThis, (this.#channel = new Channel));
			this.#cafThis = callerThis;
		};

		async sendMsg(dest, msg){ return await Caf.#channels.get(dest).send({source: this.#cafThis, msg}); };
		async onMsg(){return await this.#channel.get();};
		async *[Symbol.asyncIterator](){
			while (true) {
				yield await this.#channel.get();
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
