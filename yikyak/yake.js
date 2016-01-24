var max = results[0].deliveryID;
for ( i = 0; i < 25; i++ ){
	var yakObj = results[max -i ];
	var yakMsg = yakObj.message;
	console.log("Message: " + yakMsg);
	var yakLat = yakObj.latitude;
	console.log("Latitude: " + yakLat);
	var yakLon = yakObj.longitude;
	console.log("Longitude: " + yakLon);
	var yakTime = yakObj.time;
	console.log("Time: " + yakTime);
}
