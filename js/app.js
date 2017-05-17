/**
 * Five-xlx 2017.4.27 
 * QQ:736164687     http://www.gangumall.cn/
 **/
var URL = 'http://www.gangumall.cn/',
	AppName = '干股商城',
	pUrl;
(function($, app) {
	/**
	 * 用户登录
	 **/
	app.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if(loginInfo.account.length < 2) {
			return callback('账号最短为 2 个字符');
		}
		if(loginInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		}
		var waitLogin = plus.nativeUI.showWaiting();
		$.ajax(URL + 'api/Login/GetUser', {
			data: {
				userName: loginInfo.account,
				password: loginInfo.password
			},
			dataType: 'json',
			type: 'get',
			timeout: 20000,
			success: function(data) {
				waitLogin.close();
				if(data.Success == "true") {
					return app.createState(loginInfo.account, data.UserId, callback);
				} else {
					callback('用户名或密码错误');
				}
			},
			error: function(xhr, type, errorThrown) {
				waitLogin.close();
				callback('请求失败，请检查网络');
			}
		});
	};

	app.createState = function(name, userId, callback) {
		var state = app.getState();
		state.account = name;
		state.userId = userId;
		state.token = "token123456789";
		app.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	app.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		var re = /[^\d]+/;
		if(regInfo.account.length < 4 || !re.test(regInfo.account)) {
			return callback('用户名最短 4 个字符且非纯数字');
		}
		if(regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}
		var waitReg = plus.nativeUI.showWaiting();
		var data = JSON.stringify({
			userName: regInfo.account,
			password: regInfo.password,
			email: regInfo.email,
			code: regInfo.emailCode
		});
		$.ajax(URL + 'api/Register/PostRegisterUser', {
			data: data,
			dataType: 'json',
			contentType: 'application/json',
			type: 'post',
			timeout: 10000,
			success: function(data) {
				waitReg.close();
				if(data.Success == "true") {
					return callback(null, data);
				} else {
					return callback(data.ErrorMsg);
				}
			},
			error: function(xhr, type, errorThrown) {
				waitReg.close();
				return callback(xhr.responseText.split('ErrorMsg =')[1])
			}
		});

	};

	/**
	 * 获取当前状态
	 **/
	app.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	app.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
	};

	/**
	 * 设置应用本地配置
	 **/
	app.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 获取应用本地配置
	 **/
	app.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}

	app.checkEmail = function(email) {
		email = email || '';
		return(email.length > 3 && email.indexOf('@') > -1);
	};

	app.checkPhone = function(phone) {
		phone = phone || '';
		var reg = /^0?(13|15|18|14|17)[0-9]{9}$/;
		return(reg.test(phone));
	};

	//判断是否是ios
	app.ios = function() {
		if(plus.os.name.toLocaleLowerCase() == 'ios') {
			return true;
		} else {
			return false;
		}
	};

	//IOS判断QQ是否已经安装
	app.isQQInstalled = function() {
		var TencentOAuth = plus.ios.import("TencentOAuth");
		var isQQInstalled = TencentOAuth.iphoneQQInstalled();
		return isQQInstalled == '0' ? false : true
	};
	//IOS判断微信是否已经安装
	app.isWXInstalled = function() {
		var Weixin = plus.ios.import("WXApi");
		var isWXInstalled = Weixin.isWXAppInstalled();
		return isWXInstalled == '0' ? false : true;
	};

	/*大于零显示元素*/
	app.whichShow = function(data, el) {
		if(data > 0) {
			document.getElementById(el).innerText = data.toString();
			document.getElementById(el).style.display = 'block';
		} else {
			document.getElementById(el).style.display = 'none';
		}
	}

	/*不为空显示*/
	app.nullShow = function(data, el) {
		if(data != '' && data != null) {
			document.getElementById(el).innerText = data;
			document.getElementById(el).style.display = 'block';
		} else {
			document.getElementById(el).style.display = 'none';
		}

	}

	//阻止a链接跳转
	app.stopHref = function(el) {
		el.on('tap', 'a', function(e) {
			e.preventDefault();
		});
	}

	app.trim = function(str) {
		return str.replace(/(^\s*)|(\s*$)/g, "");
	}

	app.removeClass = function(el, name) {
		if(el.className.indexOf(name) >= 0)
			el.className = el.className.replace(name, '');
	}

	app.selectValue = function(el) {
		return el.options[el.selectedIndex].value;
	}

	app.isLogin = function() {
		var userState = JSON.parse(localStorage.getItem('$state') || "{}");
		if(userState.userId && userState.userId != '') {
			return true;
		} else {
			return false;
		}
	}

	//QQ在线咨询
	app.openQQ = function(qq) {
		if(!isQQInstalled()) {
			return;
		}
		if(plus.os.name == "Android") {
			plus.runtime.openURL("mqqwpa://im/chat?chat_type=wpa&uin=" + qq);
		} else if(plus.os.name == "iOS") {
			plus.runtime.openURL("mqq://im/chat?chat_type=wpa&uin=" + qq + "&version=1&src_type=web");
		}
	}

	//重写退出应用
	app.quitApp = function() {
		$.oldBack = mui.back;
		var backButtonPress = 0;
		$.back = function(event) {
			backButtonPress++;
			if(backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出' + AppName);
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
		};
	}

	//复制到剪切板
	app.copyclip = function(text) {
		if(plus.os.name.toLocaleLowerCase() == 'ios') {
			var UIPasteboard = plus.ios.importClass("UIPasteboard");
			var generalPasteboard = UIPasteboard.generalPasteboard();
			generalPasteboard.setValueforPasteboardType(text, "public.utf8-plain-text");
			//var value = generalPasteboard.valueForPasteboardType("public.utf8-plain-text"); 
			mui.toast('复制成功');
		} else {
			var Context = plus.android.importClass("android.content.Context");
			var main = plus.android.runtimeMainActivity();
			var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
			plus.android.invoke(clip, "setText", text);
			mui.toast('复制成功');
		}
	};

	//打开软键盘
	app.openSoftKeyboard = function() {
		if(mui.os.ios) {
			var webView = plus.webview.currentWebview().nativeInstanceObject();
			webView.plusCallMethod({
				"setKeyboardDisplayRequiresUserAction": false
			});
		} else {
			var webview = plus.android.currentWebview();
			plus.android.importClass(webview);
			webview.requestFocus();
			var Context = plus.android.importClass("android.content.Context");
			var InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			var main = plus.android.runtimeMainActivity();
			var imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
			imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);
		}
	};

	//时间处理
	app.countDown = function(time, callback) {
		var day = 0,
			hour = 0,
			minute = 0,
			second = 0;
		if(time > 0) {
			day = '' + Math.floor(time / (24 * 60 * 60));
			hour = '' + Math.floor(time / (60 * 60) - (day * 24));
			minute = '' + Math.floor(time / 60 - (day * 24 * 60) - (hour * 60));
			second = '' + Math.floor(time - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60));
		}
		if(day <= 9) {
			day = '0' + day;
		}
		if(hour <= 9) {
			hour = '0' + hour;
		}
		if(minute <= 9) {
			minute = '0' + minute;
		}
		if(second <= 9) {
			second = '0' + second;
		}
		callback(day, hour, minute, second);
	}

	//打开新窗口
	app.openVW = function(id, url, extras) {

		$.openWindow({
			id: id,
			url: url || id,
			extras: extras,
			show: {
				autoShow: true,
				aniShow: 'pop-in',
				duration: 300
			},
			waiting: {
				autoShow: false
			}
		});
	}

	app.update = function() {
		setTimeout(function() {
			//			mui.ajax(URL+'api/home/GetUpdateApp?appVersion='+plus.runtime.version+'&type='+(plus.os.name=='Android'?2:3),{
			mui.ajax(URL + 'api/home/GetUpdateApp', {
				dataType: 'json',
				type: 'get',
				timeout: 10000,
				success: function(data) {
					if(himall.ios()) {
						if(data.IOSVersion > plus.runtime.version) {
							if(data.IOSFlag == '1') {
								plus.nativeUI.confirm('发现新版本' + AppName + '，马上体验吧！', function(event) {
									if(0 == event.index) {
										plus.runtime.openURL(data.IOSDownLoad);
									}
								}, '', ["立即更新", "取 消"]);
							} else if(data.IOSFlag == '2') {
								plus.nativeUI.confirm('发现新版本' + AppName + '，马上体验吧！', function(event) {
									if(0 == event.index) {
										plus.runtime.openURL(data.IOSDownLoad);
									}
									if(1 == event.index) {
										plus.runtime.quit();
									}
								}, '', ["立即更新", "取 消"]);

							}
							}

					} else {
						if(data.AndroidVersion > plus.runtime.version) {
							if(data.AndroidFlag == '1') {
								plus.nativeUI.confirm('发现新版本' + AppName + '，马上体验吧！', function(event) {
									if(0 == event.index) {
										plus.runtime.openURL(data.AndriodDownLoad);
									}
								}, '', ["立即更新", "取 消"]);
							} else if(data.AndroidFlag == '2') {
								plus.nativeUI.confirm('发现新版本' + AppName + '，请立即更新！', function(event) {
									if(0 == event.index) {
										plus.runtime.openURL(data.AndriodDownLoad);
									}
									if(1 == event.index) {
										plus.runtime.quit();
									}
								}, '', ["立即更新", "取 消"]);

							}
							}
					}
				}
			});
		}, 5000)
	}

	//双击头部返回顶部
	app.backTop = function() {
		document.querySelector('header').addEventListener('doubletap', function() {
			mui('#pullrefresh').pullRefresh().scrollTo(0, 0, 100);
		})
	}
}(mui, window.himall = {}));

//获取索引
function getIndex(el) {
	var child = el.parentNode.children;
	for(var i = 0; i < child.length; i++) {
		if(el == child[i])
			return i;
	}
}

//是否为空对象
function isEmptyObject(el) {
	for(var n in el) {
		return false
	}
	return true;
}

function siblings(el, childEl) {
	var r = [],
		n;
	if(!childEl)
		n = el.parentNode.children;
	else
		n = el.parentNode.querySelectorAll(childEl);
	for(var i = 0, pl = n.length; i < pl; i++) {
		if(n[i] !== el)
			r.push(n[i]);
	}
	return r;
}

function showLogin(param, url) {
	pUrl = 'login.html';
	if(url == '/') {
		pUrl = '../login.html';
	}
	if(url =='../'){
		pUrl = '../../login.html';
	}
	plus.nativeUI.toast('请先登录')
	mui.openWindow({
		id: 'login.html',
		url: pUrl,
		extras: {
			param: param
		},
		show: {
			autoShow: true,
			aniShow: 'zoom-fade-out'
		},
		waiting: {
			autoShow: false
		}
	});
}

function showProduct(id, url) {
	var detailPage = plus.webview.getWebviewById('detail.html');
	if(detailPage != null) {
		detailPage.close('none');
	}
	pUrl = 'detail.html';
	if(url == '/') {
		pUrl = '../detail.html'
	}
	setTimeout(function() {
		himall.openVW('detail.html', pUrl, {
			productId: id
		});
	}, 100)

}

function showVshop(vshopid, url) {
	pUrl = 'vshop-detail.html';
	if(url == '/') {
		pUrl = 'vshop/vshop-detail.html'
	}
	himall.openVW('vshop-detail.html', pUrl, {
		vshopId: vshopid
	})
}

// 支付模块
function checkServices(pc) {
	if(!pc.serviceReady) {
		var txt = null;
		switch(pc.id) {
			case "alipay":
				txt = "检测到系统未安装“支付宝快捷支付服务”，无法完成支付操作，是否立即安装？";
				break;
			default:
				txt = "系统未安装“" + pc.description + "”服务，无法完成支付，是否立即安装？";
				break;
		}
		plus.nativeUI.confirm(txt, function(e) {
			if(e.index == 0) {
				pc.installService();
			}
		}, pc.description);
	}
}

function initPay(dcontent) {
	plus.payment.getChannels(function(channels) {
		var content = document.getElementById(dcontent);
		for(var i in channels) {
			var channel = channels[i];
			if(channel.id == 'alipay' || channel.id == 'wxpay') {
				if(himall.ios()) {
					if(channel.id == 'wxpay' && !himall.isWXInstalled()) {
						continue;
					}
				}
				pays[channel.id] = channel;
				var de = document.createElement('div');
				de.setAttribute('class', 'custom-btn ' + channel.id);
				de.setAttribute('onclick', 'pay(this.id)');
				de.id = channel.id;
				de.innerText = channel.description + "支付";
				content.appendChild(de);
				if(!himall.ios()) {
					checkServices(channel);
				}
			}
		}
	}, function(e) {
		plus.nativeUI.alert("获取支付方式失败：" + e.message);
	});
}

function payOrder(id, ajaxUrl, successBack, errorBack) {
	var typeid;
	if(wPay) {
		mask.close();
		return;
	} //检查是否请求订单中
	if(id == 'alipay') {
		typeid = 'Alipay_App';
	} else if(id == 'wxpay') {
		typeid = 'WeiXinPay_App';
	} else {
		plus.nativeUI.alert("不支持此支付通道！");
		return;
	}
	wPay = plus.nativeUI.showWaiting();
	// 请求支付订单
	var xhr = new XMLHttpRequest();
	xhr.open('GET', URL + 'api/payment/GetPaymentList?orderIds=' + payOrderId + '&typeid=' + typeid);
	xhr.onreadystatechange = function() {

		switch(xhr.readyState) {
			case 4:
				if(xhr.status == 200) {
					var order = JSON.parse(xhr.responseText)[0].url;
					if(id == 'wxpay') {
						order = JSON.parse(order);
					}
					plus.payment.request(pays[id], order, function(result) {
						wPay.close();
						wPay = null;
						successBack();
					}, function(e) {
						wPay.close();
						wPay = null;
						errorBack();
					});

				} else {
					plus.nativeUI.alert("获取订单信息失败！");
				}
				break;
			default:
				break;
		}
	}

	xhr.send();
}

function payOrders(id, ajaxUrl, successBack, errorBack) {
	var typeid;
	if(wPay) {
		mask.close();
		return;
	} //检查是否请求订单中
	if(id == 'alipay') {
		typeid = 'Alipay_App';
	} else if(id == 'wxpay') {
		typeid = 'WeiXinPay_App';
	} else {
		plus.nativeUI.alert("不支持此支付通道！");
		return;
	}
	wPay = plus.nativeUI.showWaiting();
	// 请求支付订单
	var xhr = new XMLHttpRequest();
	xhr.open('GET', URL + 'api/payment/GetPaymentListF?orderIds=' + jfq + '&typeid=' + typeid);
	xhr.onreadystatechange = function() {
		switch(xhr.readyState) {
			case 4:
				if(xhr.status == 200) {
					var order = JSON.parse(xhr.responseText)[0].url;
					if(id == 'wxpay') {
						order = JSON.parse(order);
					}
					plus.payment.request(pays[id], order, function(result) {
						wPay.close();
						wPay = null;
						successBack();
					}, function(e) {
						wPay.close();
						wPay = null;
						errorBack();
					});

				} else {
					plus.nativeUI.alert("获取订单信息失败！");
				}
				break;
			default:
				break;
		}
	}

	xhr.send();
}
//分享模块
function shareWeixin(_this, mask) {
	var shares = initShare(),
		w = plus.nativeUI.showWaiting('', {
			padlock: true
		}),
		share = shares['weixin'],
		msg = {
			extra: {
				scene: 'WXSceneSession'
			}
		};
	msg.href = _this.getAttribute('data-href');
	msg.title = _this.getAttribute('data-title');
	msg.content = _this.getAttribute('data-content');
	//	msg.pictures = ["_www/images/logo.png"];
	//	msg.thumbs = ["_www/images/logo.png"];
	share.send(msg, function() {
		w.close();
		//		if(mask)
		//			mask.close();
		plus.nativeUI.toast("分享到" + share.description + "成功！ ");
	}, function(e) {
		w.close();
		plus.nativeUI.toast("分享到" + share.description + "取消");
	});
}

function initShare() {
	var shares = {};
	plus.share.getServices(function(s) {
		if(s && s.length > 0) {
			for(var i = 0; i < s.length; i++) {
				var t = s[i];
				shares[t.id] = t;
			}
			return shares;
		}
	}, function() {
		plus.nativeUI.toast('获取分享列表失败');
	});
	return shares;
}
function loadShares(params) {
	var ids=[],
		bts=[];
	if (himall.ios()) {
		if (himall.isWXInstalled()) {
			ids.push({id: "weixin",ex: "WXSceneTimeline"});
			bts.push({title: "分享到微信朋友圈"});
		}
		 
	}else{
		ids.push({id: "weixin",ex: "WXSceneTimeline"});
		bts.push({title: "分享到微信朋友圈"});
	}
	var shares=initShare();
	plus.nativeUI.actionSheet({
		cancel: "取消",
		buttons: bts
	}, function(e) {
		var i = e.index;
		if (i > 0) {
			var s_id = ids[i - 1].id;
			var share = shares[s_id];
			if (share.authenticated) {
				shareMessage(share, ids[i - 1].ex, params);
				$('#code').hide();
			    $('#goodcover').hide();
			} else {
				share.authorize(function() {
					shareMessage(share, ids[i - 1].ex, params);
				}, function(e) {
					plus.nativeUI.toast("认证授权失败!");
				});
			}
		}
	});
}

function loadShare(params) {
	var ids = [],
		bts = [];
	if(himall.ios()) {
		if(himall.isWXInstalled()) {
			ids.push({
				id: "weixin",
				ex: "WXSceneSession"
			}, {
				id: "weixin",
				ex: "WXSceneTimeline"
			});
			bts.push({
				title: "发送给微信好友"
			}, {
				title: "分享到微信朋友圈"
			});
		}
		if(himall.isQQInstalled()) {
			ids.push({
				id: "qq"
			});
			bts.push({
				title: "分享给QQ好友"
			});
		}
	} else {
		ids.push({
			id: "weixin",
			ex: "WXSceneSession"
		}, {
			id: "weixin",
			ex: "WXSceneTimeline"
		}, {
			id: "qq"
		});
		bts.push({
			title: "发送给微信好友"
		}, {
			title: "分享到微信朋友圈"
		}, {
			title: "分享给QQ好友"
		});
	}
	var shares = initShare();
	plus.nativeUI.actionSheet({
		cancel: "取消",
		buttons: bts
	}, function(e) {
		var i = e.index;
		if(i > 0) {
			var s_id = ids[i - 1].id;
			var share = shares[s_id];
			if(share.authenticated) {
				shareMessage(share, ids[i - 1].ex, params);
			} else {
				share.authorize(function() {
					shareMessage(share, ids[i - 1].ex, params);
				}, function(e) {
					plus.nativeUI.toast("认证授权失败!");
				});
			}
		}
	});
}

function shareMessage(share, ex, params) {
	var msg = {
		extra: {
			scene: ex
		}
	};
	msg.href = params.href;
	msg.title = params.title;
	msg.content = params.content;
	/*if (~share.id.indexOf('weibo')>=0) {
		msg.content += '，<a href="'+ProductHref+'">Go血拼！ ></a>';
	}*/
	//	msg.thumbs = productImg;
	//	msg.pictures = productImg;
	msg.pictures = ["_www/images/logo.png"];
	msg.thumbs = ["_www/images/logo.png"];
	share.send(msg, function() {
		plus.nativeUI.toast("分享到" + share.description + "成功！ ");
	}, function(e) {
		plus.nativeUI.toast("分享到" + share.description + "取消");
	});
}

var himallSku = {
	checkDo: function(el, data, skuId, productId) {
		for(var i = 0; i < el.length; i++) {
			var that = el[i];
			skuId[parseInt(that.getAttribute('st'))] = that.getAttribute('cid');
			if(!data[productId + '_' + skuId.join('_')]) {
				that.className = 'disabled';
			} else {
				that.className = that.className.replace('disabled', 'enabled');
			}
		}
	},
	skuBind: function(data, option) {
		var skuId = [0, 0, 0],
			self = this;
		if(data.length == 0) {
			plus.nativeUI.toast('该宝贝已卖光了');
		}

		//sku重组
		var skuArr = {};
		for(var i = 0; i < data.length; i++) {
			skuArr[data[i].SkuId] = data[i];
		}

		if(option.skuLen == 1) {
			mui('#choose .enabled').each(function() {
				skuId[parseInt(this.getAttribute('st'))] = this.getAttribute('cid');
				if(!skuArr[option.productId + '_' + skuId.join('_')]) {
					this.className = this.className.replace('disabled', 'enabled');
				}
			});
		}
		if(option.skuLen == 2) {
			mui('#choose').on('tap', '.enabled', function() {
				skuId[parseInt(this.getAttribute('st'))] = this.getAttribute('cid');

				var sibC = siblings(this.parentNode.parentNode, '.choose-sku')[0].getElementsByTagName('span');
				self.checkDo(sibC, skuArr, skuId, option.productId);

			});
		}
		if(option.skuLen == 3) {
			mui('#choose').on('tap', '.enabled', function() {
				skuId[parseInt(this.getAttribute('st'))] = this.getAttribute('cid');
				var sibSku = siblings(this.parentNode.parentNode, '.choose-sku'),
					sibOne = sibSku[0].querySelector('.selected');
				if(sibOne) {
					skuId[parseInt(sibOne.getAttribute('st'))] = sibOne.getAttribute('cid');
					self.checkDo(sibSku[1].getElementsByTagName('span'), skuArr, skuId, option.productId);
				}
				var sibTwo = sibSku[1].querySelector('.selected');
				if(sibTwo) {
					skuId[parseInt(sibTwo.getAttribute('st'))] = sibTwo.getAttribute('cid');
					self.checkDo(sibSku[0].getElementsByTagName('span'), skuArr, skuId, option.productId);
				}
			});
		}
		mui('#choose').on('tap', '.enabled', function() {

			if(this.className.indexOf('selected') >= 0) {
				return;
			}
			if(this.parentNode.querySelector(".selected")) {
				var selected = this.parentNode.getElementsByClassName('selected')[0];
				selected.className = selected.className.replace(' selected', '');
			}
			this.className += ' selected';
			if(this.getAttribute('data-img') && this.getAttribute('data-img') != '') {
				document.getElementById("colorImg").src = this.getAttribute('data-img');
			}
			var len = choose.getElementsByClassName('selected').length;
			if(len === option.skuLen) {

				for(var i = 0; i < len; i++) {

					var cSelect = choose.getElementsByClassName('selected')[i];
					skuId[parseInt(cSelect.getAttribute('st'))] = cSelect.getAttribute('cid');
				}

				var select = skuArr[option.productId + '_' + skuId.join('_')];
				document.getElementById('pPrice').innerText = '¥ ' + select.Price;
				document.getElementById('pjifen').innerText = select.Points + ' 积分';
				document.getElementById('stock').innerText = select.Stock;

				option.callBack(select);
			}
		});
		if(option.skuLen != 0) {
			mui(".choose-sku").each(function() {
				if(this.getElementsByClassName('enabled')[0]) {
					mui.trigger(this.getElementsByClassName('enabled')[0], 'tap');
				}
			});
		} else if(option.skuLen == 0 && data.length != 0) {
			document.getElementById('pPrice').innerText = '¥ ' + data[0].Price;
			document.getElementById('pjifen').innerText = data[0].Points + ' 积分';
			document.getElementById('stock').innerText = data[0].Stock;
			option.callBack(data[0]);
		}
	},
	setSKUInfo: function(option) {
		var SKUDATA = null,
			self = this;
		if(!option.data) {
			mui.ajax(URL + option.ajaxUrl, {
				data: {
					productId: option.productId
				},
				dataType: 'json',
				type: 'get',
				timeout: 20000,
				success: function(data) {
					self.skuBind(data.SkuArray, option);
				}
			});
		} else {
			self.skuBind(option.data, option);
		}
	}
}

mui('body').on('tap', '#closeWv', function() {
	if(plus.webview.currentWebview().parent() != null)
		plus.webview.currentWebview().parent().close();
	else
		plus.webview.currentWebview().close();
});

mui('body').on('tap', '#reloadWv', function() {
	plus.webview.currentWebview().reload();
});

function reloadWvLoad() {
	var errorText = document.createElement('div');
	errorText.innerHTML = '<h4>网络不给力，请检查网络！</h4><button id="reloadWv" class="mui-btn mui-btn-negative">重新加载</button>';
	errorText.setAttribute('class', 'empty-show');
	document.body.appendChild(errorText);
}