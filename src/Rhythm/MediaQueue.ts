import {MediaItem} from './MediaPlayer';
import { v4 as uuid4 } from 'uuid';

export class MediaSet extends Set {
    private _id_map: {[key:string]: number} = {};
    private _index: number = 0;
    private deep_compare(o: MediaItem, i: MediaItem) {
        return i._id === o._id;
    }
    add(o: MediaItem) {
        let index = 0;
        for (let i of Array.from(this)) {
            if (this.deep_compare(o, i)) {
                this._index = index;
                return this;
            }
            index++;
        }
        super.add.call(this, o);
        this._index = index;

        this._id_map[o._id] = index;

        return this;
    }
    remove(_id: string) {
        if (_id in this._id_map) {
            //get index from map
            const index: number = this._id_map[_id];
            
            //delete reference from map
            delete this._id_map[_id];

            //delete object from set
            super.delete.call(this, Array.from(this)[index]);
            
            //update out of bounds indices
            for (_id in this._id_map) {
                if (this._id_map[_id] > index) {
                    this._id_map[_id] -= 1;
                }
            }

            this._index -= 1;
        }
    }

    get index() {
        return this._index;
    }

    public find(_id: string): number | undefined {
        return this._id_map[_id];
    }
}

export class MediaQueue {
    private _queue : number[] = [];
    private _shuffled : number[] = [];
    private _length : number = 0;
    private _is_shuffled : boolean = false;
    private _id : string = uuid4();
    private static _media_set = new MediaSet();

    // public remove(_id : string) {
    //     const index = this._queue_map[_id];
    //     this._queue.splice(index, 1);
    //     delete this._queue_map[_id];
    //     this._length -= 1;
    //     if (this._shuffled_map[_id]) {
    //         this._shuffled.splice(index, 1);
    //         delete this._shuffled_map[_id];
    //     }
    // }

    public enqueue(index: number): void;
    public enqueue(media_item: MediaItem): void;
    public enqueue(index_provider: number | MediaItem): void {
        if (typeof index_provider === 'number') {
            this._queue.push(index_provider);
        } else {
            this._queue.push(MediaQueue._media_set.add(index_provider).index);
        }
        this._length += 1;
    }

    public dequeue() : MediaItem | undefined {
        if (this._length) {
            this._length -= 1;
            const media_item_index = this._queue.shift();
            if (media_item_index) {
                return Array.from(MediaQueue._media_set)[media_item_index];
            }
        }
    }

    public pop() : MediaItem | undefined {
        if (this._length) {
            this._length -= 1;
            const media_item_index = this._queue.pop();
            if (media_item_index) {
                return Array.from(MediaQueue._media_set)[media_item_index];
            }
        }
    }

    public clear() {
        this._queue = [];
        this._shuffled = [];
        MediaQueue._media_set = new MediaSet();
    }

    get id() : string {
        return this._id;
    }


    get length() : number {
        return this._length;
    }

    get queue() : number[] {
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
        let temporary_value : number;
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
        }

        this._is_shuffled = true;
    }

    public media_item (index: number) : MediaItem {
        
        if (this._is_shuffled) {
            return Array.from(MediaQueue._media_set)[this._shuffled[index]];
        } else {
            return Array.from(MediaQueue._media_set)[this._queue[index]];
        }
    }

    public swap (index_1 : number, index_2 : number) {
        // const index_1 = this.map[uuid_1];
        // const index_2 = this.map[uuid_2];
        const temp = this.queue[index_1];
        this.queue[index_1] = this.queue[index_2];
        this.queue[index_2] = temp;
        // this.map[uuid_1] = index_2;
        // this.map[uuid_2] = index_1;
    }

    public find(_id: string): number | undefined {
        return MediaQueue._media_set.find(_id);
    }

    public insert(index: number, value: number) {
        this._queue.splice(index, 0, value);
        this._length += 1;
    }
}