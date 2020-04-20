/**
 * @author: A. Lepe
 * Manage Timers
 * Usage:
 * var t = new Timer(1000);
 * t.call(function() { <do> });
 * or:
 * var t = new Timer(1000,function(){ <do> });
 * t.pause();
 * t.destroy();
 */
function Timer(original_ms, callback) {
	let startTime, timer, obj = {}, action, ms;
	obj.interval = original_ms; //Public. Can be updated
	obj.checker = 50; // adjust this number to affect granularity
	obj.status = "init";
	let nowTime = new Date().getTime();
	startTime = nowTime - original_ms; //start right away
	obj.call = function(func) {
		callback = func;
		return obj;
	};
	obj.nocall = function() {
		callback = null;
		return obj;
	};
	//Execute the callback manually and reset the timer
	obj.exec = function() {
		if(callback) callback();
		startTime = new Date().getTime();
		return obj;
	};
	// Checks the status of the timer
	obj.check = function() {
		if(action) action();
		return obj;
	};
    obj.play = function() {
		action = obj.step;
		obj.status = "running";
		return obj;
    };
    obj.pause = function() {
		action = null;
		obj.status = "paused";
		return obj;
    };
	obj.destroy = function() {
		action = null;
        clearInterval(timer);
		timer = null;
		for(var o in obj) {
			obj[o] = null;
			delete obj[o];
		}
		obj.status = "destroyed";
	};
    obj.step = function() {
		nowTime = new Date().getTime();
        ms = Math.max(0, obj.interval - (nowTime - startTime));
        if(ms === 0) {
			ms = obj.interval;
			startTime = new Date().getTime();
			if(callback) callback();
        }
        return obj;
    };
	obj.slow = function() {
		obj.interval = 1000;
		return obj;
	};
	obj.fast = function() {
		obj.interval = original_ms;
		return obj;
	};
    timer = setInterval(obj.check, obj.checker);
    return obj;
}
