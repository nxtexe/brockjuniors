import {MediaItem} from './MediaPlayer';

export class MediaQueue {
    private _queue : MediaItem[] = [];
    private _length : number = 0;
    
    public enqueue(media_item : MediaItem) {
        this._length += 1;
        this._queue.push(media_item);
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

    get length() : number {
        return this._length;
    }

    get queue() : MediaItem[] {
        return this._queue;
    }
}