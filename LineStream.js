"use strict";
const Transform = require('stream').Transform;

class LineStream extends Transform {
    constructor() {
        super({
            // use objectMode to stop the output from being buffered
            // which re-concatanates the lines, just without newlines.
            objectMode:true,
            highWaterMark: 200,
            transform(chunk,encoding,callback) {
                try {
                    // decode binary chunks as UTF-8
                    encoding = encoding || 'utf8';

                    if (Buffer.isBuffer(chunk)) {
                        if (encoding == 'buffer') {
                            chunk = chunk.toString(); // utf8
                            encoding = 'utf8';
                        }
                        else {
                            chunk = chunk.toString(encoding);
                        }
                    }
                    var lines = chunk.split(/\n/g); //Some characters were not encoded for the valid JSON, yet interrupted us from using byline
                    if(this.lastPartial !== null) {
                        lines[0] = this.lastPartial + lines[0];
                        this.lastPartial = null;
                    }
                    if(chunk[chunk.length - 1] !== "\n") {
                        this.lastPartial = lines.pop();
                        //now everything in lines has had to end with \n
                    }
                    else {
                        lines.pop(); //always an empty line.
                    }
                    const stream = this;
                    lines.forEach((line) => {
                        stream.push(line);
                    });

                    callback(null);
                }
                catch(e) {
                    callback(e);
                }
            }
        });
        this.lastPartial = null;
    }
}

module.exports = LineStream;