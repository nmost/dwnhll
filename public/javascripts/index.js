$(function(){
  $("#submitButton").click(function() {
    var startLocation = $("#startLoc").val();
    var endLocation = $("#endLoc").val();
    if (!startLocation.length || !endLocation.length) {
      $("#messagingtext").html("YOU NEED TO ENTER LOCATIONS BRO");
      //$("#messagingtext").removeClass("hidden");
      return;
    }
    $("#messagingtext").html("sweet thanks dude. getting you a dope route now");
  });
});
