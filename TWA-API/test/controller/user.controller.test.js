process.env.NODE_ENV = 'test'; 

var assert = require('assert');
const userController = require('../../server/controllers/user.controller');
let chai = require('chai');
let server = require('../../app');
let chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);

const user = {
    "uniqueUserId" : "123",
    "username": "testjUnit",
    "password" : "password",
    "role":"Admin",
    "isAdmin": false
}



describe('Testing User Controller', function () {
    
    it('Test API', function () {
        chai.request(server)
        .get('/api')
                 .end((err, res) => {
                     res.should.have.status(200);
                     res.body.should.be.a('object');
                   });
            
        
    });

 
}); 	 