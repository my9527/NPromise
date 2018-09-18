const PENDDING = 'pendding';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';


const noop = () => {};

class NPromise {
	constructor(fn){
		this.state = PENDDING;
		this.thenArr = [];
		this.value = null;
		this.endFns = [];
		fn.call(null, this.resolve.bind(this), this.reject.bind(this));
	}
	// 进入下一个then 中， 如果返回了 FSM 实例（rr），那么在 rr resolve或者reject 后进入下一个then;
	resolve(res){
		this.state = RESOLVED;
		this.next(res);
	}

	reject(rej){
		this.state = REJECTED;
		this.next(res);
	}

	next(res){
		const isResolved = this.state === RESOLVED;
		const self = this;
		let result = null;

		if(this.thenArr.length === 0){
			this.value = res;
			this.endFns.length && this.endFns[0](this.value);
			return;
		}

		const thenFn = this.thenArr.shift();

		result =  isResolved ? thenFn.resolve(res) : thenFn.reject(res);
		if(result instanceof FSM){
			result.end.call(result, val=>{self.next(val)});
		} else {
			this.next(result);
		}

	}
	// 当所有都被执行后或调用该方法, 内部调用
	end(cb){
		this.endFns.push(cb);
	}
	then(resolve = noop, reject = noop){
		this.thenArr.push({ resolve, reject });
		return this;
	}
}
