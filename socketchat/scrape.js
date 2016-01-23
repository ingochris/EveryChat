var request = require('request');
request('https://api.everyblock.com/content/philly/locations/19104/timeline/?token=d57c38793098b0e9a92adee4ee9ca7b20a8fb036', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Show the HTML for the Google homepage.
  //  var latitude = body.results.location_coordinates.latitude;
    body = JSON.parse(body);
    var results = body.results;
    var step;
    for (step = 0; step < 25; step++) {
      var title = results[step].title;
      console.log("title: " + title);
      if (results[step].attributes.comment != undefined) {
        var comment = results[step].attributes.comment;
      } else {
        var comment = results[step].attributes.excerpt;
      }
      console.log("comment: " + comment);
      var latitude = results[step].location_coordinates[0].latitude;
      console.log("latitude: " + latitude);
      var longitude = results[step].location_coordinates[0].longitude;
      console.log("longitude: " + longitude);
      var location = results[step].location_name;
      console.log("neighborhood: " + location);
      var date = results[step].pub_date;
      console.log("date: " + date);


   }
  }

})
