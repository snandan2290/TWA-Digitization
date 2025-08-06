process.env.NODE_ENV = 'test'; 

var assert = require('assert');
const userService = require('../../server/services/user.service');
const user = {
    "uniqueUserId" : "123",
    "username": "testjUnit",
    "password" : "password",
    "role":"Admin",
    "isAdmin": false
}


describe('Testing User Service', function () {
    it('Create User', function () {
       
        userService.create(user).then(_newUser => {
            assert.equal((_newUser.id != null && _newUser.id != undefined), true);
        });
    });

    it('Create User with Invalid Role Name', function () {
        let user = {
            "uniqueUserId" : "123",
            "username": "testjUnit",
            "password" : "password",
            "role":"test",
            "isAdmin": false
        }
    
        userService.create(user).then(_newUser => {
            assert.equal((_newUser.id != null && _newUser.id != undefined), false);
        }).catch(error => {
            assert.equal(error.message,'invalid input value for enum enum_user_role: "test"');
        });
    });

    it('Get User By ID', function () {
        userService.getById(1).then(_user => {
            assert.equal((_user.id != null && _user.id != undefined), true);
        });
    });

    it('User Authentication', function () {
        userService.authenticate(user.username, user.password).then(_user => {
            assert.equal((_user[0].id != null && _user[0].id != undefined), true);
        });
    });

    it('User InValid Authentication', function () {
        userService.authenticate(user.username, "test").then(_user => {
            assert.equal((_user == null), true);
        });
    });
 
 
});