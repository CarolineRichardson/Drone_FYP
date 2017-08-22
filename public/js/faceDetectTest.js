var arDrone = require('ar-drone');
var client  = arDrone.createClient();

var http = require('http');
var cv = require('opencv');


var index = 0;

// Get image data from the drone
var pngStream = client.getPngStream();

var face_cascade = new cv.CascadeClassifier("haarcascade_frontalface_alt.xml");

//client.takeoff();
//client.stop();


pngStream.on('data', function(image)
{
	//console.log(image);
	//try
	//{	

		cv.readImage(image, function(err,im)
		{
			if (im == null)
				return;

			im.detectObject('haarcascade_frontalface_alt.xml', {}, function(err, faces) 
			{
			    if (err) throw err;

			    for (var i = 0; i < faces.length; i++) 
			    {
			      var x = faces[i];
			      im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
				}

			    im.save('testpic.png');
			    //client.land();
			    //console.log('Image saved');
			    client.animateLeds('blinkOrange', 5, 2);

		 	});

	    })

});

