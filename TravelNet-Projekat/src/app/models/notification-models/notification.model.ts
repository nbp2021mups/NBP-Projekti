export class Notification{
    
    private id!: String;
    public forUser: String;
    public timestamp: String;
    public type: String;
    public content: String;

    constructor(id: String, forUser: String, timestamp:String, type: String, content:String){
        this.id = id;
        this.timestamp = timestamp;
        this.forUser = forUser;
        this.type = type;
        this.content = content;
    }
}