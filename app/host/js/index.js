(function($) {


var Index = {

	init: function() {
		this.div = $('#doc');
		
		this.lastData = JSON.stringify(this.getHosts());

		this.handleEditName();
		this.handleEditBody();
		this.handleAdd();
		this.handleStatus();
		this.handleRemove();

		this.update(false);
	},

	
	handleEditName: function() {
		var self = this;

		this.div.on('click', '.name .text', function() {
			var text = $(this),
				elm = text.closest('.name'),
				editor = $('input.editor', elm);

			elm.addClass('status-edit');
			editor.val(text.text());
			editor[0].focus();
		});

		this.div.on('focusout', '.name .editor', function() {
			var editor = $(this),
				elm = editor.closest('.name'),
				text = $('.text', elm);

			var value = $.trim(editor.val());
			if (value) {
				text.text(value);
			}

			elm.removeClass('status-edit');

			self.update();
		});
	},


	handleEditBody: function() {
		var self = this;
		var fn = function(time) {
			return function() {
				app.utils.schedule('edit-body', function() {
					self.update();	
				}, time);
			}
		};

		this.div.on('input', '.body textarea', fn(1000));
		this.div.on('focusout', '.body textarea', fn(0));
	},


	handleAdd: function() {
		var self = this;

		this.div.guardOn('click', '.add', function(e) {
			return self.loadItem().pipe(function() {
				return self.update(false);	
			});
		});
	},


	loadItem: function() {
		var self = this,
			hosts = $('ul.hosts', this.div);
		return $.ajax('/host/item', {
			cache: false,
			success: function(html) {
				var li = $(html);
				li.data('order', self.createOrder());
				li.hide().appendTo(hosts).slideDown();
			}
		});
	},

	
	handleStatus: function() {
		var self = this;

		this.div.guardOn('click', '.switch-on,.switch-off', function() {
			var btn = $(this),
				li = btn.closest('.host');

			li.toggleClass('status-enabled', btn.hasClass('switch-on'));
			if (li.hasClass('status-enabled')) {
				li.data('order', self.createOrder());
			}
			return self.update();
		});
	},


	handleRemove: function() {
		var self = this;
		this.div.guardOn('click', '.remove', function() {
			if (!confirm('确定删除吗?')) {
				return;
			}

			var li = $(this).closest('.host');
			return li.slideUp().promise().pipe(function() {
				li.remove();
				return self.update();
			});
		});
	},


	getHosts: function() {
		var hosts = this.hosts = [];
		$('li.host', this.div).each(function() {
			var li = $(this),
				host = {};
			host.name = $('.text', li).text();
			host.body = $.trim($('.body textarea', li).val());
			host.enabled = li.hasClass('status-enabled');
			host.order = parseInt(li.data('order')) || 0;
			hosts.push(host);
		});
		return hosts;
	},


	createOrder: function() {
		var lis = $('li.host', this.div),
			ret = 0;
		lis.each(function() {
			var li = $(this),
				order = parseInt(li.data('order')) || 0;

			ret = order > ret ? order: ret;
		});

		return ret + 1;
	},


	update: function(message) {
		var self = this,
			last = this.lastData,
			now = JSON.stringify(this.getHosts());

		if (last === now) {
			var defer = $.Deferred();
			defer.resolve();
			return defer;
		}

		this.lastData = now;
		return $.ajax('/host/update.json', {
			type: 'post',
			dataType: 'json',
			data: {
				hosts: now
			},
			success: function(o) {
				if (o.success) {
					message !== false && self.alert('success', '保存成功');
				} else {
					self.alert('error', o.message || '保存失败');
				}
			},
			error: function() {
				self.alert('error', '网络繁忙');
				setTimeout(function() {
					window.location.reload();	
				}, 1000);
			}
		});
	},


	alert: function(type, message) {
		var bar = $('div.info-bar', this.div),	
			cn = 'alert-' + type;

		bar.addClass(cn).text(message).stop(true).show().delay(3000).fadeOut({
			duration: 1000,
			complete: function() {
				bar.removeClass(cn);
			}
		});
	}

};


$($.proxy(Index, 'init'));

 
})(jQuery);
