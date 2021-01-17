import { GuildMember } from 'discord.js';

export default class Queue<T> {
	private _data: Map<string, T> = new Map();

	public constructor() {}
	public get length(): number {
		return this._data.size;
	}
	public enqueue(id: string, item: T): void {
		this._data.set(id, item);
	}
	public dequeue(id: string): T | undefined {
		const item = this._data.get(id);
		this._data.delete(id);
		return item;
	}
	public empty(): void {
		this._data.clear();
	}

	public first(): T {
		return this._data.values().next().value as T;
	}

	public isEmpty(): boolean {
		return this._data.size === 0;
	}

	public entries(): Array<T> {
		let entries: string[] = [];
		this._data.forEach(member => {
			entries.push(((member as unknown) as GuildMember).displayName);
		});
		return `DEBUG --- \n${entries.join('\n')}`;
	}
}
