export class Message{
    
    private id: String;
    public from: String;
    public to: String;
    public timestamp: String;
    public content: String;

    constructor(id: String, from: String, to: String, timestamp:String, content:String){
        this.id = id;
        this.from = from;
        this.to = to;
        this.timestamp = timestamp;
        this.content = content;
    }
}