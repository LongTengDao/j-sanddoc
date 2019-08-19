
declare module '.Object.create?=' { export default create;
	function create (proto :null) :object;
	function create<P extends object> (proto :P) :object & { [K in keyof P] :P[K] };
}
declare module '.Object.prototype.hasOwnProperty' { export default Object.prototype.hasOwnProperty; }

declare module '.Symbol.toStringTag?' { export default Symbol.toStringTag; }

declare module '.default?=' { export default Default;
	function Default<Exports extends Readonly<{ [key :string] :any, default? :Module<Exports> }>> (exports :Exports) :Module<Exports>;
	function Default<Statics extends Readonly<{ [key :string] :any, default? :ModuleFunction<Statics, Main> }>, Main extends Callable | Newable | Callable & Newable> (main :Main, statics :Statics) :ModuleFunction<Statics, Main>;
	type Module<Exports> = Readonly<Exports & { default :Module<Exports> }>;
	type ModuleFunction<Statics, Main> = Readonly<Statics & { default :ModuleFunction<Statics, Main> }> & Main;
	type Callable = (...args :any) => any;
	type Newable = { new (...args :any) :any };
}

declare module '.document' { export default document; }

declare module '.location' { export default location; }

declare module '.setTimeout' { export default setTimeout; }

declare module '.top' { export default top; }

declare module '.undefined' { export default undefined; }

declare module '.window' { export default window; }
