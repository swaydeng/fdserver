jQuery.fn.guardOn = function(type, selector, fn) {
	$(this).on(type, selector, function(e) {
		var target = $(this);
		if (target.hasClass('disabled')) {
			return;
		}

		target.addClass('disabled');
		var defer = fn.apply(this, arguments);

		var complete = function() {
			target.removeClass('disabled');
		};

		defer ? defer.always(complete) : complete();
	});
};
