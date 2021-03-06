let net = require('net');

class Client {
    constructor(socket, id) {
        this.socket = socket;
        this.id = parseInt(id);
    }
    forceUpdate(id) {
        if (this.socket.destroyed) throw new Error();
        this.socket.write('{"type":"update", "id":"' + id + '"}\n');
    }
}

let clients = [];

net.createServer(function (socket) {
    socket.on('data', function (data) {
        let json = {};
        try {
            json = JSON.parse(data.toString());
        } catch (e) {}
        switch (json.type) {
            case "heartbeat":
                let id = json.id;
                if (!clients.find(client => client.id === id)) {
                    console.log("client connected: '" + id + "'");
                    clients.push(new Client(socket, id));
                } else console.log("recieved heartbeat from client " + id);
                break;
            case "update":
                console.log("data updated!" + ((typeof json.client_id === "number") ? (" client id: '" + json.client_id + "'") : ""));
                clients.forEach(client => {
                    try {
                        client.forceUpdate(parseInt((typeof json.client_id === "number") ? (json.client_id) : ("-1")));
                        console.log("  client " + client.id + " updated!");
                    } catch (e) {
                        console.log("  failed to connect to client " + client.id + ", deleting...");
                        clients = clients.filter(client1 => client1.id !== client.id);
                    }
                });
                break;
            case "testdata":
                console.log(json.data);
        }
    });
    socket.on('error', function (err) {
        //console.log(err);
    });
}).listen(8080, "0.0.0.0");