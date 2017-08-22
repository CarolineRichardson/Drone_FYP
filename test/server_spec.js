var request = require('request');
var nodeServer = require('../server');
var nodeServer = new nodeServer();



describe("the server file", function()
{


    it('should exist', function() 
    {
        expect(nodeServer).not.toBeNull();
    });


    it("should run", function(done) 
    {        
        request("http://localhost:8000/", function(error, response, body)
        {
            expect(response.statusCode).toEqual(200);
            done();
        });
    });

/*
    it("should return the specified html file", function(done) 
    {
        request.post("http://localhost:8000/pilot.html", function(error, response, body)
        {
            expect(response.statusCode).toEqual(200);
            done();
        });
    });
*/


    it("should not run if no port specified", function(done) 
    {
        request.post("http://localhost:8000/", function(error, response, body)
        {
            expect(response.statusCode).toEqual(400);
            done();
        });
    });


 });

