if (process.env.VCAP_SERVICES) appFogServices = JSON.parse(process.env.VCAP_SERVICES);
else appFogServices = {}; //env var not set 
services = {};
getall = function (instances,target)
{
	for (i=0;i<instances.length;i++)
	{
		cred = instances[i].credentials;
		name = instances[i].name;
		target[name] = {};
		target[name].cred = cred;
	};
}
for (key in appFogServices)
{
	if (key.match(/redis/))
	{
		services.redis={};
		getall(appFogServices[key],services.redis);
		for (name in services.redis)
		{
			services.redis[name].connect = function (options,authCallback) {
				var redisModule = require("redis");
				if (!redisModule) return null;
				client = redisModule.createClient(this.cred.port,this.cred.host,options);
				client.auth(cred.password,authCallback);
				return client;
			}
		}
	};
	if (key.match(/mysql/))
	{
		services.mysql={};
		getall(appFogServices[key],services.mysql);
		for (name in services.mysql)
		{
			services.mysql[name].connect = function (db,connectionListener) {
				var mysqlModule = require("mysql-native");
				if (!mysqlModule) return null;
				client = mysqlModule.createTCPClient(this.cred.host,this.cred.port,connectionListener);
				client.auto_prepare = true;
				client.auth(db,this.cred.username,this.cred.password);
			}
		}
	};
	if (key.match(/postgresql/))
	{
		services.pgsql={};
		getall(appFogServices[key],services.pgsql);
		for (name in services.pgsql)
		{
			services.pgsql[name].connect = function (db,options) {
				var pgsqlModule = require('pg');
				if (!pgsqlModule) return null;
				if (!options.database) options.database = db;
				options.user = this.cred.user;
				options.password = this.cred.password;
				options.port = this.cred.port;
				options.host = this.cred.host;
				client = new pgsqlModule.Client(options);
				client.connect();
				return client;
			}
		}
	};
	if (key.match(/mongodb/))
	{
		services.mongodb={};
		getall(appFogServices[key],services.mongodb);
		for (name in services.mongodb)
		{
			services.mongodb[name].connect = function (db,options) {
				var url = 'mongodb://' + this.cred.username + ':' + this.cred.password + '@' + this.cred.hostname + ':' + this.cred.port + '/' + this.cred.db ;
				var mongodbModule=require('mongodb');
				if (!mongodbModule) return null;
				mongodbModule.connect(url ,options , function(error, client){
					if (error != null) return null;
					return client;
				});
			}
		}
	};
	if (key.match(/rabbitmq/))
	{
		services.rmq={};
		getall(appFogServices[key],services.rmq);
		for (name in services.rmq)
		{
			services.rmq[name].connect = function (options) {
				return null;
			}
		}
	};
}
module.exports = services;