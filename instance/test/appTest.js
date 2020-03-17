var expect  = require('chai').expect;
var request = require('request');
const config = require('config');
const auth = config.get('Server.auth');

let assembleUri = function(endpoint) {
    return 'http://localhost:' + (config.get('Server.port') + 1) + endpoint;
};

it('Room is created', function(done) {
    let formData = {
        form: {
            match: {
                matchPlayers: ["1v1"],
                matchType: "1v1",
                bosses: ["1"],
                knights: ["2"],
            },
            id: 1,
            auth: auth
        }
    };

    console.log(assembleUri("/createRoom"));
    request.post(assembleUri("/createRoom"), formData, function(error, response, body) {
        expect(body).to.equal('Hello World');
        done();
    });
});