import { GuildMember } from 'discord.js';

export default class Queue<K extends string | number | Symbol, T> {
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

	public DEBUG_STRING(): string {
		let entries: string[] = [];
		this._data.forEach(member => {
			entries.push(((member as unknown) as GuildMember).displayName);
		});
		return `DEBUG --- \n${entries.join('\n')}`;
	}

	public map(callback: (key: K, value: T, position: number) => any): any[] {
		const result: any[] = [];
		let i = 0;
		this._data.forEach((value, key) => {
			result.push(callback(key, value, i));
			i++;
		});
		return result;
	}
}
