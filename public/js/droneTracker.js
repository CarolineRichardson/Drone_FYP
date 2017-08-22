
$(document).ready(function() 
{
  
  var socket = io.connect();

  //click land button
  $('#detectFace').click(function()
  {
    socket.emit("detectFace");
  });

  $('#followFace').click(function()
  {
    socket.emit("followFace");    
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


  });


  //key down
  $(document).keydown(function(e) 
  {


  });


});
