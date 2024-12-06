There is an issue when using streams for large-size videos in which the content will jump back a few frames over and over while the video is playing.

Meanwhile, you can use this code to have a smooth play:

```js
const video = new NDJPlayer("#video", {
    controls : "common",
    fps: 24
});
async function processStream(url, callback) {
    const response = await fetch(url);
    const reader = response.body.getReader();
    const decoder = new TextDecoder(); // To decode the stream into text
    let buffer = '';
    let done = false;

    while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;

        // Decode the current chunk and append to the buffer
        buffer += decoder.decode(value, { stream: true });

        // Process each line
        let lineEndIndex;
        while ((lineEndIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, lineEndIndex);
            callback(line);
            buffer = buffer.slice(lineEndIndex + 1); // Remove processed line from buffer
        }
    }
}

let header = true;
processStream('/video.ndjson', frame => {
    if(header) {
        video.player.processFrame(JSON.parse(frame));
        header = false;
    } else {
        video.player.append(JSON.parse(frame));
    }
});
```

Groovy example on how to implement the stream:

```groovy

File video = new File("video.ndjson")
if(video.exists()) {
    response.header("Content-Type", "application/x-ndjson")
    response.header("Transfer-Encoding", "chunked")
    BufferedReader reader = new BufferedReader(new FileReader(video))
    int charCode
    String buffer = ""
    while ((charCode = reader.read()) != -1) {
        char c = (char) charCode
        buffer += c.toString()
        if(c.toString() == '}') {
            response.writer.println(buffer.trim())
            buffer = ""
        }
    }
    reader.close()
    response.closeOutput()
}
```