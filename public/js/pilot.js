$(document).ready(function() 
{
  
  var socket = io.connect();

  //click land button
  $('#land').click(function()
  {
    socket.emit("land");
  });

  $('#fly').click(function()
  {
    socket.emit("takeoff");
  });

  $('#autoRoute').click(function()
  {
    socket.emit("autoRoute");
  });


  setInterval(function()
  {
    var date = new Date();
    $('#pic').attr('src', "/picture?date=" + new Date().toString())

  }, 100)


  $(document).keyup(function(e) 
  {

    e.preventDefault();
    if(e.keyCode == 84) //t
    {
      socket.emit('takeoff');
    }  

    if(e.keyCode == 76) //l
    {
      socket.emit("land");  
    }

    if(e.keyCode == 67) //c
    {
      socket.emit("calibrate");  
    }

    if(e.keyCode == 72) //h
    {
      socket.emit("stop");  
    }

    if(e.keyCode == 39) //e
    {
      socket.emit("disconnect-drone");  
    }

    if(e.keyCode == 87) //w
    {
      socket.emit('stop');
    }  

    if(e.keyCode == 65) //a
    {
      socket.emit('stop');  
    }

    if(e.keyCode == 83) //s
    {
      socket.emit('stop');  
    }

    if(e.keyCode == 68) //d
    {
      socket.emit('stop');  
    }       

    if(e.keyCode == 39) //> arrow
    {
      socket.emit('stop');  
    }  

    if(e.keyCode == 37) //< arrow
    {
      socket.emit('stop');  
    }      
    

  });


  //key down
  $(document).keydown(function(e) 
  {

    if(e.keyCode == 87) //w
    {
      socket.emit('forward');
    }  

    if(e.keyCode == 65) //a
    {
      socket.emit('left');  
    }

    if(e.keyCode == 83) //s
    {
      socket.emit('backward');  
    }

    if(e.keyCode == 68) //d
    {
      socket.emit('right');  
    }       

    if(e.keyCode == 39) //> arrow
    {
      socket.emit('clockwise');  
    }  

    if(e.keyCode == 37) //< arrow
    {
      socket.emit('counterclockwise');  
    }    

    if(e.keyCode == 77) //m
    {
      socket.emit('wave');  
    }    


  });

});
