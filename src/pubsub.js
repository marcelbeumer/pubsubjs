(function(ns){
    
    var ctx = this;
    
    var dispatcher = function() {
        var self = {}, shared = this === ctx ? {} : this;
        
        var keyc = 0;
        var subscribers = [];
        var senders = {};
        
        self.listing = {};
        
        self.register = function(group) {
            keyc++;
            var privateKey = (+new Date) + '' + keyc + '' + Math.floor(Math.random()*1024);
            var publicKey = 'pubsubkey' + Math.floor(Math.random()*1024) + '' + keyc;
            
            senders[privateKey] = publicKey;
            self.listing[publicKey] = {group : group || 'anonymous'};
            return privateKey;
        };
        
        self.getListing = function(group) {
            var r = [];
            for (var key in self.listing) {
                var l = self.listing[key];
                if (l.group == group) r.push(key);
            }
            return r;
        };
        
        self.publish = function(topic, message, privateKey) {
            
            var publicKey = senders[privateKey];
            var group = publicKey ? self.listing[publicKey].group : undefined;
            var header = {key : publicKey, group : group, topic : topic};
            
            var l = subscribers.length;
            var e = l;
            while (l--) {
                var s = subscribers[l];
                if (
                    (s.topic && s.topic != topic) ||
                    (s.group && s.group != group) ||
                    (s.publicKey && s.publicKey != publicKey)
                ) continue;
                s.callback(header, message);
            }
        };
        
        self.subsribe = function(options, callback) {
            if (!callback) return;
            options = options || {};
            subscribers.push({
                topic : options.topic || null,
                name : options.group || null,
                publicKey : options.publicKey || null,
                callback : callback
            });
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