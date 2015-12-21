$(function() {

	var isSend = false;
	var delta = $(document).height() * 0.5;

	$(window).scroll(function() {
		var heightDocument = $(document).height() - delta;
		var heightVisible = $(window).height();
		var topScroll = $(window).scrollTop();
		if(topScroll + heightVisible > heightDocument) {
			if (isSend) {
				return;
			}

			var url = $("#pagenavi .next").attr("href");
			if (url == undefined) {
				isSend = true;
				return;
			}

			$.ajax({
				url: url,
				dataType: "html",
				success: function(data) {
					data = $(data).filter("#content").html();
					$(document).find("#pagenavi").replaceWith(data);
					isSend = false;
				}
			});

			isSend = true;
		}

	});

});