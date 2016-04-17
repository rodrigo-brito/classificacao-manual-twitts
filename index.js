var MongoClient = require('mongodb').MongoClient;
var prompt = require('prompt');

var url = 'mongodb://localhost:27017/Twitter'
var collection_name = 'RodrigoFBrito';

var setPolaridadeTwitt = function(db, id, num_polaridade, callback) {
	var collection = db.collection( collection_name );
	collection.updateOne(
		{ id_str : id },
		{ $set: { polaridade : num_polaridade } },
		function(err, result) {
			if(err){
				console.dir(err);
				process.exit(1);
			}
			console.log("Twitt ["+id+"] polarizado = "+num_polaridade);
			callback(result);
		}
	);
}

var getTwittsApolares = function(db, callback) {
	var collection = db.collection( collection_name );
	// Twitts que a polaridade não foi definida
	collection.find({ "polaridade" : { $exists : false } }).toArray(function(err, docs) {
		if(err){
			console.dir(err);
			process.exit(1);
		}
		callback(docs);
	});
};

var randLastTwitts = function(twitts, qtde){
	var last10 = twitts.slice( 0 , qtde );
	return last10[Math.floor(Math.random() * last10.length)];
};

var iniciarPolarizacao = function(){
	// Use connect method to connect to the Server
	MongoClient.connect(url, function(err, db) {
		getTwittsApolares(db, function(docs){
	    	var twitt = randLastTwitts(docs, 20);
	    	console.log("-------------");
	    	console.log(twitt.text);
	    	console.log("-------------");
	    	console.log("POLARIDADE DEVE SER [1 a 3] (1=RUIM 2=NEUTRO 3=APOIO)");
	    	var properties = [
		    	{
		    		name: 'polaridade',
		    		validator: /^[1-3]+$/,
		    		warning: 'POLARIDADE DEVE SER [1 a 3] (1=RUIM 2=NEUTRO 3=APOIO)'
		    	}
	    	];

	    	prompt.start();

			prompt.get(properties, function (err, result) {
			    if (err) {
			    	console.dir(err);
					process.exit(1);
			    }
			    //apos entrada de valores, atualiza polaridade
			    setPolaridadeTwitt(db, twitt.id_str, Number(result.polaridade), function(){
		    		db.close();
		    		iniciarPolarizacao();
		    	});
			});
		});
	});
};

//Starta processo
iniciarPolarizacao();
