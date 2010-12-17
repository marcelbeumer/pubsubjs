(function(ns){
    
    var ctx = this;
    
    var dispatcher = function() {
        var self = {}, shared = this === ctx ? {} : this;
        
        var keyc = 0;
        var subscribers = [];
        var senders = {};
        
        self.listing = {};
        
        self.register = function(obj, name) {
            keyc++;
            var privateKey = (+new Date) + '' + keyc + '' + Math.floor(Math.random()*1024);
            var publicKey = 'pubsubkey' + Math.floor(Math.random()*1024) + '' + keyc;
            
            obj.__pubsub_private_key = privateKey;
            senders[privateKey] = publicKey;
            self.listing[publicKey] = {name : name || 'anonymous'};
            return privateKey;
        };
        
        self.getListing = function(name) {
            var r = [];
            for (var key in self.listing) {
                var l = self.listing[key];
                if (l.name == name) r.push(key);
            }
            return r;
        };
        
        self.getFirstListing = function(name) {
            for (var key in self.listing) {
                var l = self.listing[key];
                if (l.name == name) return key;
            }
        };
        
        self.publish = function(topic, message, sender) {
            
            if (sender && sender.__pubsub_private_key) sender = sender.__pubsub_private_key;
            var publicKey = senders[sender];
            
            var l = subscribers.length;
            var e = l;
            while (l--) {
                var s = subscribers[l];
                if (
                    (s.topic && s.topic != topic) ||
                    (s.publicKey && s.publicKey != publicKey)
                ) continue;
                s.callback(publicKey, topic, message);
            }
        };
        
        self.subsribe = function(topic, publicKey, callback) {
            if (!callback) return;
            subscribers.push({
                topic : topic || null,
                publicKey : publicKey || null,
                callback : callback
            });
        };
        
        return self;
    };
    
    var pubsub = function() {
        var self = {}, shared = this === ctx ? {} : this;
        self.dispatcher = dispatcher;
        self.main = dispatcher();
        return self;
    };
    
    ns.pubsub = pubsub();
    
})(window);