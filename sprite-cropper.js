var minimist = require("minimist");
var im = require("imagemagick");
var async = require("async");

var args = minimist(process.argv);

var requiredArgs = [
	"source",
	"width",
	"height"
];

//check all required parameters
requiredArgs.forEach(function (arg){
	if(!args[arg]){
		console.log("ERROR: Missing --"+arg+" parameter");
		process.exit();
	}
});

var sourcePath = args["source"];
var destinationPath = args["destination"] || "results";
var spriteWidth = args["width"];
var spriteHeight = args["height"];

//get the source image info
im.identify(sourcePath, function (err, imageInfo) {
	if (err) {
		return console.log(err);
	}

	var imageWidth = imageInfo.width;
	var imageHeight = imageInfo.height;

	var spritesPerLine = imageWidth / spriteWidth;
	var spritesPerColumn = imageHeight / spriteHeight;
	var tasks = []; 

	var iterations = [];
	for (var i = 0; i < spritesPerLine; i++) {
		for (var j = 0; j < spritesPerColumn; j++) {
			iterations.push([i, j]);
		}
	}
	
	iterations.forEach(function (item, index) {
		var row = item[0];
		var column = item[1];
		
		var imageName = index+ 1 + ".png";
		var offsetX = column * spriteWidth;
		var offsetY = row * spriteHeight;

		//run the imagemagick command
		tasks.push(function (done) {
			im.convert([
				"-extract",
				spriteWidth + "x" + spriteHeight + "+" + offsetX + "+" + offsetY,
				sourcePath,
				destinationPath + "/" + imageName
			], done);
		});
	});
	
	//run all async tasks
	async.parallel(tasks, function (err){
		if(err){
			return console.log(err);
		}
		
		console.log("DONE");
	});

});

