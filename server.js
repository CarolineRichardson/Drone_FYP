var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var cv = require('opencv');
var drone = require('ar-drone');

var state;

var faceCascade = new cv.CascadeClassifier("./data/haarcascade_frontalface_alt.xml");


var client = drone.createClient({timeout:4000});
client.config('general:navdata_demo', 'FALSE');
client.config('video:video_channel', 0);
client.config('control:altitude_max', 3000);

//var control = arDrone.createUdpControl();

require('ar-drone-png-stream')(client, { port:5000});


var pngStream = client.getPngStream();

var lastPng
  , flying
  , goingUp
  , goingDown
  , processingImage = false;

var image;

var detectFaceS=false;
var followFaceS=false;

var analysing=false;

var counter=0;




pngStream
    .on('error', function (error) {
      //console.log(error);
    })
    .on('data', function (buffer) {
      lastPng = buffer;
    });

    //detectFace(image);

    /*if(detectFaceS && !followFaceS)
    {
      detectFace(image);
      ///var interval = setInterval(detectFace(image), 150);
    }

    if(followFaceS && !detectFaceS)
    {
      followFace(image);
      //flying = true;
      //var interval = setInterval(followFace(image), 150);
      //fly();
    }*/

  //});


  app.configure(function()
  {

  	app.set('port', process.env.PORT || 8000);
  	app.set('views', __dirname + '/views');
  	app.use("/public", express.static(__dirname + '/public'));
  	app.use('/socket-io', express.static(__dirname + '/node-modules/socket.io'));
  	app.use('/jquery', express.static(__dirname + '/bower_components/jquery/dist/'));
  	app.use('/bootstrap', express.static(__dirname + '/bower_components/bootstrap/dist/'));
  	app.use('/images', express.static(__dirname + '/images/'));
  	app.use('/css', express.static(__dirname + '/public/css/'));
  	app.use('/bootstrap-css', express.static(__dirname + '/node-modules/bootstrap-css/lib/'));


  	//default page on launch
  	app.get('/', function(req, res) 
  	{
      //res.status(200).json({serverup:true});
  	  res.sendfile(__dirname + "/views/pilot.html");

  	});

    //drone tracker page
  	app.get('/droneTracker', function(req, res) 
  	{
      //res.status(200);
  	  res.sendfile(__dirname + "/views/droneTracker.html");
  	});

    //default pilot manually page
  	app.get('/pilot', function(req, res) 
  	{
      //res.status(200);
  	  res.sendfile(__dirname + "/views/pilot.html");
  	});


    app.get('/picture', function(req,res)
    {

      if (!lastPng) 
      {
          res.writeHead(503);
          res.end('Did not receive any png data yet.');
          return;
      }

      //res.status(200);
      res.writeHead(200, {'Content-Type': 'image/png'});
      res.end(lastPng);

    });

  });



  //socket messages and drone control
  io.sockets.on('connection', function (socket) 
  {

  	var delay = 1000;
  	var speed = 0.1;

  	console.log('connected');

  		
  	socket.on('takeoff', function() 
  	{
        console.log('takeoff');
        client.takeoff();
  	});

  	socket.on('land', function() 
  	{
        console.log('land');
        client.land();
  	});

    socket.on('calibrate', function() 
    {
      	console.log('calibrating');
        client.calibrate(0);
  	});

    socket.on('stop', function() 
  	{
        console.log('stop');
        client.stop();
  	});

  	socket.on('disconnect-drone', function() 
  	{
        console.log('disconnecting from drone')
        client.disableEmergency();
    });

  	socket.on('left', function() 
  	{
        console.log('left');
        client.left(speed);
  	});

  	socket.on('right', function() 
  	{
        console.log('right');
        client.right(speed);
  	});

      socket.on('counterclockwise', function() 
  	{
        console.log('counterclockwise');
        client.counterClockwise(speed);
  	});

  	socket.on('clockwise', function() 
  	{
        console.log('clockwise');
        client.clockwise(speed);
  	});

  	socket.on('backward', function() 
  	{
        console.log('backward');
        client.back(speed);
  	});

  	socket.on('forward', function() 
  	{
        console.log('forward');
        client.front(speed);
  	});

    socket.on('wave', function() 
    {
        console.log('wave');
        client.animate('wave', 50);
    });


    //opencv methods
    socket.on('detectFace', function() 
    {
        console.log('detecting faces');
        detectFaceS = !detectFaceS;
        detectFace();

    });

    socket.on('followFace', function() 
    {
        console.log('tracking you');
        //followFaceS = !followFaceS;

        flying = true;
        fly();
        var interval = setInterval( detectFace, 150);

    });


  });




function detectFace () 
{
  //console.log('flying: ' + flying);
  //console.log('processing: ' + processingImage);
//  console.log('lastPng: ' + lastPng);


  //if( ! flying ) return;
  
  if( ( ! processingImage ) && lastPng ) 
  {
    //console.log('processingImage');
        processingImage = true;

        client.stop();

      cv.readImage(lastPng, function (err, im) 
      {

      faceCascade.detectMultiScale(im, function (err, faces) 
      {

        var face, biggestFace;

        for (var i = 0; i < faces.length; i++) 
        {
          console.log('dected face');
          var face = faces[i];
          counter ++;

          if (!biggestFace || (face.width > biggestFace.width)) 
          {
            biggestFace = face;
          }

          if (biggestFace) 
          {

            face = biggestFace;

            console.log('detected face');

            //im.ellipse(face.x + face.width/2, face.y + face.height/2, face.width/2, face.height/2);
            im.rectangle([face.x, face.y], [face.x + face.width, face.y + face.height], [0, 255, 0], 2);
            //console.log( face.x, face.y, face.width, face.height, im.width(), im.height() );
            im.save('rec' + counter + '.png');



            face.centerX = face.x + face.width * 0.5;
            face.centerY = face.y + face.height * 0.5;

                  var centerX = im.width() * 0.5;
                  var centerY = im.height() * 0.5;

                  //var heightAmount = -( face.centerY - centerY ) / centerY;

                  //var turnAmount = -( face.centerX - centerX ) / centerX;

                  var turnAmount = -( face.centerX - centerX ) / centerX;

                  turnAmount = Math.min( 1, turnAmount );
                  turnAmount = Math.max( -1, turnAmount );

                  //heightAmount = ver_ctrl.update(-heightAmount); // pid
                  //turnAmount   = hor_ctrl.update(-turnAmount);   // pid

                    
                      //log( "  turning " + turnAmount );
                      //if (debug) io.sockets.emit('/message', 'turnAmount : ' + turnAmount);

                      //if( turnAmount < 0 ) client.clockwise( Math.abs( turnAmount ) );
                      //else client.counterClockwise( turnAmount );

                      if( turnAmount < 0 ) client.clockwise( 0.2 );
                      else client.counterClockwise( 0.2 );

                      setTimeout(function()
                      {
                          client.clockwise(0);
                          //this.stop();
                      },20);



                    //middle of face
/*                    var faceCenterX = (face.x + face.width) / 2;
                    var faceCenterY = (face.y + face.height) / 2;

                    //middle of the image
                    var imageCenterX = image.width() / 2;
                    var imageCenterY = image.height() / 2;


                    //amount to turn/move up
                    var turnAmount = -(faceCenterX - imageCenterX) / imageCenterX;
                    var heightAmount = -(faceCenterY - imageCenterY) / imageCenterY;

                    //console.log('turning ' + turnAmount);
                    //console.log('height ' + heightAmount);


                    if (turnAmount < 0) 
                    {
                      client.clockwise(0.5);
                
                    } 

                    else 
                    {
                      client.counterClockwise(0.5);

                    }

                    
                    client.stop();

                  setTimeout(function () 
                  {
                    if (goingUp) 
                    {
                      goingUp = false;
                      client.up(0);
                      //console.log('stoping up motion');
                    } 

                    else {
                      goingDown = false;
                      client.down(0);
                      //console.log('stoping down motion');
                    }

                    client.clockwise(0);
                    
                  }, 100);
*/

          }

          //im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
          
        }

        processingImage = false;
      });
    });
  }

}







/*
function detectFace()
{

  //pngStream.on('data', function(image)
  //{

  if( ( ! processingImage ) && lastPng ) 
  {

    if(detectFace == true)
    {
    //console.log('processingImage');
    processingImage = true;
    console.log('detecting');

    var startTime = new Date().getTime();
    var time = ( ( new Date().getTime() - startTime ) / 1000 ).toFixed(2);

    cv.readImage(lastPng, function(err,im)
    {
      if(im == null)
        console.log("no images");

      im.detectObject('haarcascade_frontalface_alt.xml', {}, function(err, faces) 
      {

          if(err) 
            throw err;

          for(var i=0; i<faces.length; i++) 
          {

            console.log('face found');
            var x = faces[i];
            //var face = faces[i];

            im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
            //im.rectangle([face.x, face.y], [face.x + face.width, face.y + face.height], [0, 255, 0], 2);
            
            var time = ( ( new Date().getTime() - startTime ) / 1000 ).toFixed(2) * 100;
            im.save('./detectedImages/'+ time +'.png');

            client.animateLeds('blinkOrange', 5, 2);

          } //end for loop

      });//end detect

      processingImage = false;

    });

  }

}  

}//end detectFace*/


/*function checkState()
{

    if(detectFaceS==true)
    {
      flying = true;
      detectFace();
    }

}*/

//var interval = setInterval( detectFace, 100);

function fly () 
{

  client.takeoff();
  client.after(2000,function()
  { 
    console.log("stop");
    this.stop();
    flying = true;
  });


  client.after(50000, function() 
  {
    console.log('landing');
    this.stop();
    this.land();
    flying = false;
  });
}




// Start the web server
server.listen(app.get('port'), function() 
{
  console.log('listening on port ' + app.get('port'));
});


/*
function followFace(lastPng)
{  

  if( ( !analysing ) && lastPng ) 
  {

    analysing=true;

    cv.readImage(lastPng, function (err, image) 
    {

        frontalface.detectMultiScale(image, function (err, faces) 
        {

          var face;
          var biggestFace;

          for (var i = 0; i < faces.length; i++) 
          {
            console.log('dected face');
            var face = faces[i];

            if (!biggestFace || (biggestFace.width < face.width)) 
            {
              biggestFace = face;
            }

            if (biggestFace) 
            {

              face = biggestFace;

              console.log('detected face');

              console.log( face.x, face.y, face.width, face.height, image.width(), image.height() );
              image.save('detected' + counter + '.png');


              //middle of face
              var faceCenterX = (face.x + face.width) / 2;
              var faceCenterY = (face.y + face.height) / 2;

              //middle of the image
              var imageCenterX = image.width() / 2;
              var imageCenterY = image.height() / 2;


              //amount to turn/move up
              var turnAmount = -(faceCenterX - imageCenterX) / imageCenterX;
              var heightAmount = -(faceCenterY - imageCenterY) / imageCenterY;

              console.log('turning ' + turnAmount);
              console.log('height ' + heightAmount);


              if (turnAmount < 0) 
              {
                //client.clockwise(Math.abs(turnAmount * 0.5));
              } 

              else 
              {
                //client.counterClockwise(Math.abs(turnAmount * 0.5));
              }


                /*setTimeout(function () 
                {
                    if (goingUp) 
                    {
                      goingUp = false;
                      client.up(0);
                      console.log('stoping up motion');
                    } 

                    else 
                    {
                      goingDown = false;
                      client.down(0);
                      console.log('stoping down motion');
                    }

                    client.clockwise(0);
                    
                }, 100);

            }

            image.ellipse(face.x + face.width/2, face.y + face.height/2, face.width/2, face.height/2);
            image.save('/faceTrack/testpic' + i + '.png');

          }

          analysing = false;
          
        });

      });

    }

 } //end function followFace*/
     



/*var faceDetectLoop = function()
{
  
  if(lastPng)
  {
    console.log('Detecting Face.');
    detectFace();
  };
  setTimeout(faceDetectLoop, 400);
};
faceDetectLoop();

*/




/*function fly()
{

  client.takeoff();
  flying = true;

  client.after(8000, function() 
  {
    console.log('landing');
    this.stop();
    this.land();
    flying = false;
  });

});*/


//var interval = setInterval(detectFace(lastPng), 150);



