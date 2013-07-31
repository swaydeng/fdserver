(function($) {

var Reload = {
	init: function() {
		this.initPretty();
		this.initReload();
	},


	initPretty: function() {
		$('body').on('reload', function() {
			prettyPrint();	
		});
		prettyPrint();	
	},


	initReload: function() {
		if (!(/\bautoreload\b/.test(window.location.search))) {
			return;
		}
		
		var self = this;
		var fn = function() {
			self.request().done(function() {
				setTimeout(fn, 1000);
			});
		};

		setTimeout(fn, 1000);
	},


	request: function() {
		var self = this,
			defer = $.Deferred(),
			path = window.location.href,
			container = $('div.markdown-body'),
			stop = $(window).scrollTop();

		$.ajax(path, {
			cache: false,
			success: function(html) {
				var body = self.getBody(html);
				if (self.last !== body) {
					container.html(body);
					$('body').trigger('reload');
					$(window).scrollTop(stop);
					self.last = body;
				}
				defer.resolve();
			}
		});

		return defer;
	},


	getBody: function(html) {
		var start = html.indexOf('<!--start-markdown-body-->'),
			end = html.indexOf('<!--end-markdown-body-->');

		return html.substring(start, end);
	}


	
};


$($.proxy(Reload, 'init'));

		
})(jQuery);
