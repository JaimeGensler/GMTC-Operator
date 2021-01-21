/**
 * A FIFO Queue data structure.
 *
 * @example
 * const myQueue = new Queue();
 * myQueue.enqueue(someItem.id, someItem);
 * myQueue.dequeue(someItem.id)
 */
export default class Queue<K extends string | number | Symbol, T extends any> {
	private _data: Map<K, T> = new Map();

	public constructor() {}
	/**
	 * The number of items in this Queue. Read-only.
	 */
	public get length(): number {
		return this._data.size;
	}
	/**
	 * Add an item to the queue. Returns the new length of the queue.
	 * @param id A unique identifier for the item you're enqueueing.
	 * @param item The item you're enqueueing.
	 */
	public enqueue(id: K, item: T): number {
		this._data.set(id, item);
		return this.length;
	}
	/**
	 * Remove an item from the queue. Returns the removed item.
	 * @param id The unique identifier for the item you're dequeueing.
	 */
	public dequeue(id: K): T | undefined {
		const item = this._data.get(id);
		this._data.delete(id);
		return item;
	}
	/**
	 * Removes all items from the queue.
	 */
	public empty(): void {
		this._data.clear();
	}

	/**
	 * Returns the first item in queue. Pseudonym for Queue.prototype.firstValue();
	 */
	public first() {
		return this.firstValue();
	}
	/**
	 * Returns an array containing the first item in queue and its unique identifier.
	 */
	public firstEntry(): [K, T] | undefined {
		if (this._data.size === 0) return undefined;
		return this._data.entries().next().value;
	}
	/**
	 * Returns the first item in queue.
	 */
	public firstValue(): T | undefined {
		if (this._data.size === 0) return undefined;
		return this._data.values().next().value;
	}

	/**
	 * Executes a callback for every item in the queue.
	 * @param callback The callback to be executed. Provides the queue entry ([id, item]) and that items position in queue (0-indexed).
	 */
	public forEach(callback: (entry: [K, T], position: number) => any): void {
		let i = 0;
		this._data.forEach((value, key) => {
			callback([key, value], i);
			i++;
		});
	}
}
