module.exports = function() {
	return new Queue();
};


var Queue = function() {
	this.stack = [];
};


Queue.prototype.push = function(fn) {
	this.stack.push(fn);
	if (!this.active) {
		start(this);
	}
};


function start(self) {
	var stack = self.stack;
	var next = function() {
		if (!stack.length) {
			self.active = false;
			return;
		}

		var item = stack.shift();
		item(next);
	};

	self.active = true;
	next();
}

