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
}
module.exports = services;