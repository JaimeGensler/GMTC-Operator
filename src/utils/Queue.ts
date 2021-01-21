export default class Queue<K extends string | number | Symbol, T extends any> {
	private _data: Map<K, T> = new Map();

	public constructor() {}
	public get length(): number {
		return this._data.size;
	}
	public enqueue(id: K, item: T): void {
		this._data.set(id, item);
	}
	public dequeue(id: K): T | undefined {
		const item = this._data.get(id);
		this._data.delete(id);
		return item;
	}
	public empty(): void {
		this._data.clear();
	}

	public first() {
		return this.firstValue();
	}
	public firstEntry(): [K, T] | undefined {
		if (this._data.size === 0) return undefined;
		return this._data.entries().next().value;
	}
	public firstValue(): T | undefined {
		if (this._data.size === 0) return undefined;
		return this._data.values().next().value;
	}

	public isEmpty(): boolean {
		return this._data.size === 0;
	}

	public forEach(callback: (entry: [K, T], position: number) => any): void {
		let i = 0;
		this._data.forEach((value, key) => {
			callback([key, value], i);
			i++;
		});
	}
}
