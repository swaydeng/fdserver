(function($) {

var Index = {
	init: function() {
		this.handleUpdate();
		//this.handleMessage();
	},

	handleUpdate: function() {
		var self = this;
		$('#info-path-text,#info-remote-text').on('input', function() {
			app.utils.schedule('update', $.proxy(self, 'update'), 1000);
		});
	},

	handleMessage: function() {
		var self = this;
		var fn = function() {
			$.ajax('/app/message.json', {
				type: 'get',
				cache: false,
				dataType: 'json',
				success: function(o) {
					if (o.success) {
						$.each(o.data, function(index, o) {
							self.message(o.message, o.type);
						});
					}

					setTimeout(fn, 1000);
				}
			})	
		};

		setTimeout(fn, 1000);
	},

	update: function() {
		var self = this,
			info = this.getInfo();

		$.ajax('/app/update.json', {
			type: 'post',
			dataType: 'json',
			data: {
				info: JSON.stringify(info)
			},
			success: function(o) {
				if (o.success) {
					self.message('已更新配置');
				} else {
					self.message(o.message || '更新配置失败', 'error');
				}
			},
			error: function() {
				self.message('网络繁忙', 'error');
			}
		});
	},

	getInfo: function() {
		var remote = $.trim($('#info-remote-text').val()),
			path = $.trim($('#info-path-text').val());

		return {
			remote: remote,
			path: path
		};
	},

	message: function(message, type) {
		console.log(message);
		type = type || 'info';
	}
};


$($.proxy(Index, 'init'));

		
})(jQuery);
