$(function(){
  $("#submitButton").click(function() {
    var startLocation = $("#startLoc").val();
    var endLocation = $("#endLoc").val();
    if (!startLocation.length || !endLocation.length) {
      $("#messagingtext").html("Please enter two locations");
      //$("#messagingtext").removeClass("hidden");
      return;
    }
    $("#messagingtext").html("Calculating route...");
  });
});
