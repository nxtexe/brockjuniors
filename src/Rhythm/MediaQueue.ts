import {MediaItem} from './MediaPlayer';
import { v4 as uuid4 } from 'uuid';

interface QueueMap {
    [uuid : string]: number;
}
export class MediaQueue {
    private _queue : MediaItem[] = [];
    private _queue_map : QueueMap = {};
    private _shuffled : MediaItem[] = [];
    private _shuffled_map : QueueMap = {};
    private _length : number = 0;
    private _is_shuffled : boolean = false;
    private _id : string = uuid4();
    
    public remove(media_item : MediaItem) {
        const index = this._queue_map[media_item.uuid];
        this._queue.splice(index, 1);
        delete this._queue_map[media_item.uuid];
        this._length -= 1;
        if (this._shuffled_map[media_item.uuid]) {
            this._shuffled.splice(index, 1);
            delete this._shuffled_map[media_item.uuid];
        }
    }
    public enqueue(media_item : MediaItem) {
        this._queue.push(media_item);
        this._queue_map[media_item.uuid] = this._length;
        this._length += 1;
    }

    public dequeue() : MediaItem | undefined {
        if (this._length) {
            this._length -= 1;
            return this._queue.shift();
        }
    }

    public pop() : MediaItem | undefined {
        if (this._length) {
            this._length -= 1;
            return this._queue.pop();
        }
    }

    public clear() {
        this._queue = [];
    }

    get id() : string {
        return this._id;
    }

    get queue_map() : QueueMap {
        if (!this._is_shuffled) {
            return this._queue_map;
        } else {
            return this._shuffled_map;
        }
    }

    get length() : number {
        return this._length;
    }

    get queue() : MediaItem[] {
        if (this._is_shuffled) {
            return this._shuffled;
        } else {
            return this._queue;
        }
    }

    public unshuffle() {
        this._is_shuffled = false;
    }

    public shuffle() {
        //Algorithm: Fisher-Yates (aka Knuth) Shuffle
        //See https://github.com/coolaj86/knuth-shuffle
        this._shuffled = [...this._queue];
        let current_index = this._shuffled.length;
        let temporary_value : MediaItem;
        let random_index : number;

        //While there remain elelemts to shuffle...
        while (0 !== current_index) {
            //Pick a remaining elelemt...
            random_index = Math.floor(Math.random() * current_index);
            current_index -= 1;

            //And swap it with the current element.
            temporary_value = this._shuffled[current_index];
            this._shuffled[current_index] = this._shuffled[random_index]
            this._shuffled[random_index] = temporary_value;
            this._shuffled_map[this._shuffled[current_index].uuid] = current_index;
            this._shuffled_map[this._shuffled[random_index].uuid] = random_index;
        }

        this._is_shuffled = true;
    }
}