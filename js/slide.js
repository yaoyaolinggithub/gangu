var swiper = new Swiper(".swiper-container", {
	pagination: ".swiper-pagination",
	paginationClickable: true
});
mui.back = function() {};
(function(a) {
	a.init();
	a.plusReady(function() {
		var b = plus.webview.getLaunchWebview();
		setTimeout(function() {
			if(b) {
				b.hide("none", 0);
				b.close("none", 0)
			}
			plus.navigator.closeSplashscreen()
		}, 400);
		document.getElementById("close").addEventListener("tap", function(c) {
			localStorage.setItem("GangumallFlag", "true");
			plus.webview.getWebviewById("main.html").show();
			var d = plus.webview.currentWebview();
			setTimeout(function() {
				d.close("none", 0);
				
			}, 800)
		}, false)
	})
})(mui);