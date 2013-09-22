$(function(){
  $("#submitButton").click(doButtonSubmit);
  $("input").keypress(function(e) {
    if (event.which == 13) {
      doButtonSubmit();
    }
  });
   
  function doButtonSubmit() {
    var startLocation = $("#startLoc").val();
    var endLocation = $("#endLoc").val();
    if (!startLocation.length || !endLocation.length) {
      $("#messagingtext").html("Please enter two locations");
      //$("#messagingtext").removeClass("hidden");
      return;
    }
    $("#messagingtext").html("Calculating...");
    //DO POST
    //IF NOT SPECIFIC, GIVE A DROPDOWN
    //ELSE:
    $("#containerDiv").switchClass("introPage", "mapPage", 750, "easeInOutCubic");
    $("#introPage").html("").addClass("hidden");
    $("#mapPage").removeClass("hidden");
    $("#mapContainer").removeClass("hidden");
  }
});
