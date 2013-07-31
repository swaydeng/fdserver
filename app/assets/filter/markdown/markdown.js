(function($) {

var Reload = {
	init: function() {
		this.initPretty();
		this.initReload();
		this.initNav();
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
	},


	initNav: function() {
		this.refreshNav();	
		$('body').on('reload', $.proxy(this, 'refreshNav'));
	},


	refreshNav: function() {
		var self = this,
			html = [];

		var t = function(s) {
			html.push(s);
		};

		t('<ul class="navs">');

		$('h2,h3', '#doc').each(function() {
			var elm = $(this);
			
			self.createHash(elm);

			var cls = elm.is('h2') ? 'item' : 'child';

			t(self.format('<li class="{0}">', [cls]));
				t(self.createLink(elm));
			t('</li>');
		});

		html.push('</ul>');

		$('div.nav-container', '#doc').html(html.join(''));
	},


	hashInfo: function(node) {
		var text = node.text();	
		return {
			hash: text.replace(/\s+/g, '-'),
			name: text
		};
	},


	createHash: function(node) {
		var o = this.hashInfo(node);
		node.prepend(this.format('<a name="{hash}"></a>', o));
	},


	createLink: function(node) {
		var o = this.hashInfo(node);
		return this.format('<a href="#{hash}">{name}</a>', o);
	},


	format:	function(str, data) {
		return str.replace(/\{(\w+)\}/g, function(r, m) {
			return data[m] !== undefined && data[m] !== null ? 
					data[m] : '{' + m + '}';
		});
	}
	
};


$($.proxy(Reload, 'init'));

		
})(jQuery);
