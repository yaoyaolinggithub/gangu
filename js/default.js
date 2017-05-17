var ui = {
	w: null,
	qrcode: sui.gel("qrcode"),
	search: sui.gel("search"),
	message: sui.gel("message"),
	msgNum: sui.gel("msgNum"),
	newmore: sui.gel("newmore"),
	likemore: sui.gel("likemore"),
	newsbox: sui.gel("newsbox"),
	newprobox: sui.gel("newprobox"),
	likebox: sui.gel("likebox"),
	hotbox: sui.gel("hotbox"),
	sliderbox: sui.gel("sliderbox"),
	indicator: sui.gel("indicator"),
	imgIdArr: [],
	slider: mui("#slider"),
	quan: sui.gel("quan"),
	container: sui.gel("container"),
	newslist: sui.gel("newslist"),
	updateTime: "",
	bannerPara: [],
	makeMoney: sui.gel("makeMoney")
};

function downloadQueue() {
	if(ui.imgIdArr.length > 0) {
		var a = ui.imgIdArr.shift();
		cache.setImg(a.id, a.imgurl, downloadQueue)
	}
}
var getPushInfo = function() {
	var a = plus.push.getClientInfo();
	if(plus.os.name == "Android") {
		postPushInfo(1, a.clientid)
	} else {
		postPushInfo(2, a.token)
	}
};
(function(a) {
	a.plusReady(function() {
		plus.geolocation.getCurrentPosition(function(b) {
			localStorage.setItem("longitude_cayica", b.coords.longitude);
			localStorage.setItem("latitude_cayica", b.coords.latitude)
		}, function(b) {}, {
			geocode: true,
			provider: "amap"
		});
		setTimeout(function() {
			var b = plus.webview.getLaunchWebview();
			if(b) {
				b.hide("none", 0);
				b.close("none", 0)
			}
			plus.navigator.closeSplashscreen();
			setTimeout(function() {
				var c = plus.webview.getWebviewById("slide.html");
				if(!c) {
					ui.w = sui.wait("请稍候...")
				}
				checkVersion(function(d) {
					if(!d) {
						mui.fire(plus.webview.currentWebview(), "index");
						if(sui.isLogin()) {
							getPushInfo()
						}
					} else {
						sui.closewait(ui.w)
					}
				})
			}, 100)
		}, 300);
		plus.push.addEventListener("click", function(g) {
			var f = g.payload;
			if(typeof(f) == "string") {
				f = JSON.parse(f.trim())
			}
			if(!sui.isLogin()) {
				sui.open("login.html", "login.html", {});
				return
			}
			var c = f.type;
			var e = f.data;
			if(c == 0) {
				var d = plus.webview.getWebviewById("orderDetail.html");
				if(d) {
					return
				}
				sui.open("orderProcess/orderDetail.html", "orderDetail.html", {
					orderId: e
				})
			} else {
				if(c == 1) {
					var d = plus.webview.getWebviewById("quanMain.html");
					if(d) {
						return
					}
					sui.open("quanMain.html", "quanMain.html", {})
				} else {
					if(c == 2) {
						var d = plus.webview.getWebviewById("recoverDetail.html");
						if(d) {
							return
						}
						sui.open("orderProcess/recoverDetail.html", "recoverDetail.html", {
							RecycleId: e
						})
					} else {
						if(c == 3) {
							sui.open("my/message.html", "message.html", {})
						} else {
							if(c == 5) {
								if(!sui.IsNullOrEmpty(e) && ~e.indexOf(",")) {
									var b = e.split(",");
									sui.open("my/repaymentDetail.html", "repaymentDetail.html", {
										repayDate: b[0],
										IsRefund: b[1]
									})
								}
							}
						}
					}
				}
			}
		}, false);
		plus.push.addEventListener("receive", function(d) {
			var c = d.payload;
			if(typeof(c) == "string") {
				c = JSON.parse(c.trim())
			}
			if(!c.IsLocal) {
				var b = {
					cover: false
				};
				c.IsLocal = 1;
				plus.push.createMessage(d.content, JSON.stringify(c), b);
				if(a.os.android) {
					plus.device.vibrate(1000)
				} else {
					plus.ios.invoke(null, "AudioServicesPlaySystemSound", 1000)
				}
			}
		}, false);
		document.addEventListener("resume", function() {
			downloadQueue()
		}, false)
	})
})(mui);
window.addEventListener("index", function(a) {
	sui.request("Home/FirstPage", {
		updateTime: ui.updateTime
	}, true, function(l) {
		if(l) {
			var s = l.IsPass;
			if(s) {
				var p = l.NeedUpdate;
				if(p) {
					ui.imgIdArr = [];
					ui.updateTime = l.Timestamp;
					var u = {
						msgNum: l.ReturnObject.MessageNum,
						change: l.ReturnObject.IsBannerChange,
						banner: [],
						indicator: [],
						bLen: l.ReturnObject.Banner.length,
						news: [],
						newsLen: l.ReturnObject.MyNews.length,
						newpro: [],
						newproLen: l.ReturnObject.NewProduct.length,
						likepro: [],
						likeproLen: l.ReturnObject.GuessProduct.length,
						hot: [],
						hotLen: l.ReturnObject.HotProduct.length,
						banlast: sui.unique(6),
						banfirst: sui.unique(6),
						CartNum: l.ReturnObject.CartNum
					};
					if(u.change) {
						if(u.bLen > 0) {
							ui.imgIdArr.push({
								id: u.banlast,
								imgurl: l.ReturnObject.Banner[u.bLen - 1].ImageUrl
							});
							u.banner.push('<div class="mui-slider-item mui-slider-item-duplicate"><a href="#"><img src="images/banner.jpg" id="' + u.banlast + '" data="slider" data-t="' + l.ReturnObject.Banner[u.bLen - 1].ImageType + '"  data-v="' + (u.bLen - 1) + '"/></a></div>');
							for(var o = 0; o < u.bLen; o++) {
								var g = sui.unique(6);
								ui.imgIdArr.push({
									id: g,
									imgurl: l.ReturnObject.Banner[o].ImageUrl
								});
								ui.bannerPara.push(JSON.parse(l.ReturnObject.Banner[o].ParamJson.trim() || "{}"));
								u.banner.push('<div class="mui-slider-item"><a href="#"><img src="images/banner.jpg" id="' + g + '" data="slider" data-t="' + l.ReturnObject.Banner[o].ImageType + '" data-v="' + o + '"/></a></div>');
								u.indicator.push('<div class="mui-indicator ' + (o == 0 ? "mui-active" : "") + '"></div>')
							}
							ui.imgIdArr.push({
								id: u.banfirst,
								imgurl: l.ReturnObject.Banner[0].ImageUrl
							});
							u.banner.push('<div class="mui-slider-item mui-slider-item-duplicate"><a href="#"><img src="images/banner.jpg" id="' + u.banfirst + '" data="slider" data-t="' + l.ReturnObject.Banner[0].ImageType + '" data-v="0" /></a></div>');
							ui.sliderbox.classList.add("fadeIn-img");
							ui.sliderbox.innerHTML = u.banner.join("");
							ui.indicator.innerHTML = u.indicator.join("");
							try {
								ui.slider.slider({
									interval: 0
								});
								setTimeout(function() {
									ui.slider.slider({
										interval: 4000
									})
								}, 1000)
							} catch(r) {}
						}
					}
					for(var h = 0; h < u.newsLen; h++) {
						u.news.push('<li class="mui-table-view-cell" data="news" data-v="' + l.ReturnObject.MyNews[h].NewsId + '">' + l.ReturnObject.MyNews[h].NewsContent + "</li>")
					}
					for(var f = 0; f < u.newproLen; f++) {
						var g = sui.unique(6);
						ui.imgIdArr.push({
							id: g,
							imgurl: l.ReturnObject.NewProduct[f].CoverImage
						});
						var q = l.ReturnObject.NewProduct[f].ReturnPeriod;
						var v = "月";
						switch(q) {
							case 0:
								v = "月";
								break;
							case 1:
								v = "日";
								break;
							case 2:
								v = "月";
								break;
							case 3:
								v = "季";
								break;
							case 4:
								v = "年";
								break;
							default:
								break
						}
						u.newpro.push('<div class="img_box" data="detail" data-v="' + l.ReturnObject.NewProduct[f].ProductSkuId + '"><img src="images/hand.png"  id="' + g + '"/><span class="useprice"><a>' + l.ReturnObject.NewProduct[f].NowRent + "</a>/" + v + '</span><div class="price mui-ellipsis-2">' + l.ReturnObject.NewProduct[f].ProductName + "</div></div>")
					}
					for(var d = 0; d < u.likeproLen; d++) {
						var g = sui.unique(6);
						ui.imgIdArr.push({
							id: g,
							imgurl: l.ReturnObject.GuessProduct[d].CoverImage
						});
						var q = l.ReturnObject.GuessProduct[d].ReturnPeriod;
						var v = "月";
						switch(q) {
							case 0:
								v = "月";
								break;
							case 1:
								v = "日";
								break;
							case 2:
								v = "月";
								break;
							case 3:
								v = "季";
								break;
							case 4:
								v = "年";
								break;
							default:
								break
						}
						u.likepro.push('<div class="img_box" data="detail" data-v="' + l.ReturnObject.GuessProduct[d].ProductSkuId + '"><img src="images/hand.png"  id="' + g + '"/><span class="useprice"><a>' + l.ReturnObject.GuessProduct[d].NowRent + "</a>/" + v + '</span><div class="price mui-ellipsis-2">' + l.ReturnObject.GuessProduct[d].ProductName + "</div></div>")
					}
					for(var c = 0; c < u.hotLen; c++) {
						var g = sui.unique(6);
						ui.imgIdArr.push({
							id: g,
							imgurl: l.ReturnObject.HotProduct[c].CoverImage
						});
						var q = l.ReturnObject.HotProduct[c].ReturnPeriod;
						var v = "月";
						switch(q) {
							case 0:
								v = "月";
								break;
							case 1:
								v = "日";
								break;
							case 2:
								v = "月";
								break;
							case 3:
								v = "季";
								break;
							case 4:
								v = "年";
								break;
							default:
								break
						}
						u.hot.push('<li class="rezu-box mui-table-view-cell" data="detail" data-v="' + l.ReturnObject.HotProduct[c].ProductSkuId + '"> <img  src="images/hand.png" id="' + g + '"/><div class="title mui-ellipsis-2">' + l.ReturnObject.HotProduct[c].ProductName + '</div><div class="price-box"><span class="price"> ' + l.ReturnObject.HotProduct[c].NowRent + "/" + v + '</span><span class="mui-pull-right mui-badge style">人气商品</span></div></li>')
					}
					ui.newsbox.innerHTML = u.news.join("");
					ui.newprobox.innerHTML = u.newpro.join("");
					ui.likebox.innerHTML = u.likepro.join("");
					ui.hotbox.innerHTML = u.hot.join("");
					sui.gel("takeover").classList.remove("mui-hidden");
					sui.closewait(ui.w);
					var t = sui.isLogin();
					if(t) {
						var b = plus.webview.currentWebview().parent();
						if(b) {
							b.evalJS('goodsNum("' + u.CartNum + '")')
						}
					}
					if(t && u.msgNum > 0) {
						ui.msgNum.innerText = u.msgNum;
						ui.msgNum.classList.remove("mui-hidden")
					}
					setTimeout(function() {
						downloadQueue()
					}, 200);
					if(t && u.msgNum > 0) {
						sui.InitBadge(u.msgNum)
					} else {
						sui.InitBadge(0)
					}
				} else {
					sui.closewait(ui.w)
				}
			} else {
				mui.toast(l.Desc);
				sui.closewait(ui.w)
			}
		} else {
			mui.toast("无法连接到服务器，请检查网络是否连接！");
			sui.closewait(ui.w)
		}
	})
});
var postPushInfo = function(a, b) {
	sui.post("User/ModifyGeTui", {
		osType: a,
		geTuiId: b
	}, function(c) {})
};
ui.qrcode.addEventListener("tap", function() {
	sui.open("help/barcoded.html", "barcoded.html", {})
});
ui.search.addEventListener("tap", function() {
	sui.open("goods/goodSearch.html", "goodSearch.html", {})
});
ui.message.addEventListener("tap", function() {
	if(sui.isLogin()) {
		sui.open("my/message.html", "message.html", {});
		ui.msgNum.classList.add("mui-hidden")
	} else {
		sui.open("login.html", "login.html", {})
	}
});
mui(ui.container).on("tap", "li[data=list]", function() {
	var a = this.getAttribute("data-v");
	sui.open("goods/goodsList.html", "goodsList.html", {
		categoryId: a,
		saletype: 0,
		moduleId: 0,
		searchkey: ""
	})
});
mui(ui.container).on("tap", "li[data=list2]", function() {
	var a = this.getAttribute("data-v");
	sui.open("goods/goodsList.html", "goodsList.html", {
		categoryId: 0,
		saletype: a,
		moduleId: 0,
		searchkey: ""
	})
});
ui.makeMoney.addEventListener("tap", function() {
	sui.open("makeMoney/mmMain.html", "mmMain.html", {})
});
ui.quan.addEventListener("tap", function() {
	sui.open("quanMain.html", "quanMain.html", {})
});
ui.newslist.addEventListener("tap", function() {
	sui.open("help/newsMain.html", "newsMain.html", {})
});
mui(ui.container).on("tap", "li[data=news]", function() {
	var a = this.getAttribute("data-v");
	sui.open("help/noticeDetail.html", "noticeDetail.html", {
		newsId: a
	})
});
ui.newmore.addEventListener("tap", function() {
	sui.open("goods/goodsList.html", "goodsList.html", {
		categoryId: 0,
		saletype: 0,
		moduleId: 1,
		searchkey: ""
	})
});
ui.likemore.addEventListener("tap", function() {
	sui.open("goods/goodsList.html", "goodsList.html", {
		categoryId: 0,
		saletype: 0,
		moduleId: 2,
		searchkey: ""
	})
});
mui(ui.container).on("tap", "div[data=detail]", function() {
	var a = this.getAttribute("data-v");
	sui.open("goods/goodsDetailMain.html", "goodsDetailMain.html", {
		pid: a
	})
});
mui(ui.container).on("tap", "li[data=detail]", function() {
	var a = this.getAttribute("data-v");
	sui.open("goods/goodsDetailMain.html", "goodsDetailMain.html", {
		pid: a
	})
});
mui(ui.sliderbox).on("tap", "img[data=slider]", function() {
	var b = this.getAttribute("data-t");
	var a = this.getAttribute("data-v");
	if(!sui.IsNullOrEmpty(b) && !sui.IsNullOrEmpty(a)) {
		if(b != 0) {
			if(b == 1) {
				var c = ui.bannerPara[a];
				sui.open("goods/goodsList.html", "goodsList.html", {
					categoryId: c.CategoryId,
					saletype: c.SaleType,
					moduleId: c.ModuleId,
					searchkey: ""
				})
			} else {
				if(b == 2) {
					var c = ui.bannerPara[a];
					sui.open("goods/goodsDetailMain.html", "goodsDetailMain.html", {
						pid: c.BusinessId
					})
				} else {
					if(b == 3) {
						sui.open("quanMain.html", "quanMain.html", {})
					} else {
						if(b == 4) {
							var c = ui.bannerPara[a];
							sui.open("help/noticeDetail.html", "noticeDetail.html", {
								newsId: c.BusinessId
							})
						} else {
							if(b == 5) {
								sui.open("goods/goodsList.html", "goodsList.html", {
									categoryId: 0,
									saletype: 0,
									moduleId: 2,
									searchkey: ""
								})
							} else {
								if(b == 6) {
									var c = ui.bannerPara[a];
									sui.open("makeMoney/mmDetail.html", "mmDetail.html", {
										Id: c.BusinessId
									})
								}
							}
						}
					}
				}
			}
		}
	}
});

function removeMsgNum() {
	ui.msgNum.innerText = 0;
	ui.msgNum.classList.add("mui-hidden")
}

function showMsgNum(a) {
	ui.msgNum.innerText = a;
	ui.msgNum.classList.remove("mui-hidden")
};