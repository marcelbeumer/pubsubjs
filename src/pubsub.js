(function(ns){
    
    var dispatcher = function() {
        var self = {};
        
        var keyc = 0;
        var subscribers = [];
        var senders = {};
        
        self.listing = {};
        
        self.register = function(group) {
            keyc++;
            var privateKey = (+new Date) + '' + keyc + '' + Math.floor(Math.random()*1024);
            var publicKey = 'pubsubkey' + Math.floor(Math.random()*1024) + '' + keyc;
            
            senders[privateKey] = publicKey;
            self.listing[publicKey] = {group : group || 'none'};
            return privateKey;
        };

        self.anonymous = function(group) {
            return {noKey : true, group : group};
        };
        
        self.getListing = function(group) {
            var r = [];
            for (var key in self.listing) {
                var l = self.listing[key];
                if (l.group == group) r.push(key);
            }
            return r;
        };
        
        self.getPublicKey = function(privateKey) {
            return senders[privateKey];
        };
        
        self.publish = function(topic, message, privateKey) {
            
            var noKey = privateKey.noKey, group = privateKey.group;
            var publicKey = noKey ? undefined : self.getPublicKey(privateKey);
            var group = group || (publicKey ? self.listing[publicKey].group : undefined);
            var header = {key : publicKey, group : group, topic : topic};
            
            var l = subscribers.length;
            while (l--) {
                var s = subscribers[l];
                if (
                    (s.topic && s.topic != topic) ||
                    (s.group && s.group != group) ||
                    (!s.anonymous && !publicKey) ||
                    (s.key && s.key != publicKey)
                ) continue;
                s.callback(header, message);
            }
        };
        
        self.subscribe = function(options, callback) {
            if (!callback) return;
            options = options || {};
            options.callback = callback;
            subscribers.push(options);
        };
        
        return self;
    };
    
    var pubsub = function() {
        var self = dispatcher();
        self.dispatcher = dispatcher;
        return self;
    };
    
    ns.pubsub = pubsub();
    
})(window);