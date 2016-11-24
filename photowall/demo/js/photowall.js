$(function() {
	var $img_pre = $('#img_pre');
	var $img_next = $('#img_next');
	var $loading = $('#loading');
	//每个div的宽
	var kidDivWidth = 160;
	//每个div的高
	var kidDivHeight = 148;
	//获取容器对象
	var $wrapper = $('#wrapper');
	//获取容器对象的子div
	var $kids = $wrapper.children('div');
	//获取子div的img标签
	var $kids_imgs = $kids.find('img');
	var div_len = $kids.length;
	//每行的div的数量
	var per_line = 6;
	//每列的div的数量
	var per_col = Math.ceil(div_len / per_line);
	//容器的宽、高
	var wrapperWidth = kidDivWidth * per_line;
	var wrapperHeight = kidDivHeight * per_col;
	//第一个div在沿着窗口宽高的间距
	var space_w, space_h;
	//图片显示模式,"single"为显示一张，"grid"为显示所有
	var mode = 'single';
	//图像的宽、高
	var imgWidth = kidDivWidth - 10;
	var imgHeight = kidDivHeight - 10;
	//设置使图像居中的margin
	var marginTop = (kidDivWidth - imgWidth) / 2;
	var marginLeft = (kidDivHeight - imgHeight) / 2;
	//鼠标按下时的位置
	var mouseX = 0;
	var mouseY = 0;
	//鼠标移动的偏移量
	var dx = 0;
	var dy = 0;
	//鼠标按下的标志
	var mouse_down = false;
	//鼠标点击的标志
	var clickflag = true;
	//让图片居中所需的偏移量
	var middle_posx = 0,
		middle_posy = 0;
	//记录每个div的背景当前的background-position
	var curPos = function() {
		this.x = [];
		this.y = [];
	};
	curPos.prototype.init = function() {
		for (var i = 0; i < div_len; i++) {
			this.x[i] = 0;
			this.y[i] = 0;
		}
	};
	var cur_pos = new curPos();
	cur_pos.init();
	//当前显示的图像
	var current = -1;
	var positionsArray = [];
	for (var i = 0; i < div_len; i++) {
		positionsArray[i] = i;
	}
	$kids.width(kidDivWidth);
	$kids.height(kidDivHeight);
	//存储各图像的宽高
	var imgSize = [];
	//图像的路径
	var imgsrc = "";
	//图像加载量
	var loaded = 0;
	$kids_imgs.each(function() {
		var $this = $(this);
		$('<img/>').load(function() {
			imgSize[$this.attr('src')] = {
				width: $this.width(),
				height: $this.height()
			};
			++loaded;
			if (loaded === div_len)
				start();
		}).error(function() {
			imgSize[$this.attr('src')] = {
				width: $this.width(),
				height: $this.height()
			};
			++loaded;
			if (loaded === div_len)
				start();
		}).attr('src', $this.attr('src'));
	});

	function start() {
		$loading.hide();
		disperse();
	}
	//计算图片的位置，分散每张图片
	function disperse() {
		if (!clickflag) return;
		setflag();
		removeNavigation();
		calspace(per_line, per_col);
		$kids.each(function(index) {
			var $kid = $(this);
			//图像的位置
			var pos_top = space_h * (Math.ceil((index + 1) / per_line)) - $kid.height() / 2;
			var pos_left = space_w * (index % per_line + 1) - $kid.width() / 2;
			//图像旋转的角度
			var r = Math.floor(Math.random() * 121) - 60;
			//布置图像
			$kid.css('transform', 'rotate(' + r + 'deg)');
			$kid.stop().animate({
					top: pos_top + 'px',
					left: pos_left + 'px'
				},
				1200,
				function() {
					if (index === div_len - 1)
						setflag();
				}).find('img').fadeIn(1200, function() {
				$kid.css('background-image', 'none');
				$(this).animate({
						width: imgWidth + 'px',
						height: imgHeight + 'px',
						marginTop: marginTop + 'px',
						marginLeft: marginLeft + 'px'
					},
					150);
			});
		});
	}

	$kids.bind('click', function() {
		if (!clickflag) return;
		setflag();
		var $this = $(this);
		current = $this.index();
		if (mode === 'single') { //combination
			mode = 'grid';
			imgsrc = $this.find('img').attr('src');
			calImgMiddlepos(wrapperWidth, wrapperHeight, imgsrc);
			$kids.each(function(index) {
				var $kid = $(this);
				var $img = $kid.find('img');
				$img.stop().animate({
						width: '100%',
						height: '100%',
						marginTop: '0px',
						marginLeft: '0px'
					},
					150,
					function() {
						//设置背景
						var f_l = $(window).width() / 2 - wrapperWidth / 2;
						var f_t = $(window).height() / 2 - wrapperHeight / 2;
						var t = f_t + Math.floor(index / per_line) * kidDivHeight;
						var l = f_l + (index % per_line) * kidDivWidth;
						setBackground($kid, index);
						$kid.stop().animate({
								top: t + 'px',
								left: l + 'px'
							},
							1200,
							function() {
								if (index === div_len - 1) {
									addNavigation();
									setflag();
								}
							});
						$img.fadeOut(1200);
					});
			});
		} else { //disperse();
			mode = 'single';
			setflag();
			disperse();
		}
	});
	$kids_imgs.on('dragstart', false);

	$img_pre.bind('click', function() {
		if (!clickflag) return;
		setflag();
		--current;
		if (current < 0)
			current = div_len - 1;
		var $prev_div = $wrapper.children('div:nth-child(' + (current + 1) + ')');
		if ($prev_div.length > 0) {
			imgsrc = $prev_div.find('img').attr('src');
			calImgMiddlepos(wrapperWidth, wrapperHeight, imgsrc);
			var posarr = shuffle(positionsArray.slice(0));
			$kids.each(function(i) {
				var t = $(this);
				setTimeout(function() {
					setBackground(t, i);
					if (i === div_len - 1)
						setflag();
				}, posarr.shift() * 20);
			});
		}
	});
	$img_next.bind('click', function() {
		if (!clickflag) return;
		setflag();
		++current;
		if (current > div_len - 1)
			current = 0;
		var $next_div = $wrapper.children('div:nth-child(' + (current + 1) + ')');
		if ($next_div.length > 0) {
			imgsrc = $next_div.find('img').attr('src');
			calImgMiddlepos(wrapperWidth, wrapperHeight, imgsrc);
			var posarr = shuffle(positionsArray.slice(0));
			$kids.each(function(i) {
				var t = $(this);
				setTimeout(function() {
					setBackground(t, i);
					if (i === div_len - 1)
						setflag();
				}, posarr.shift() * 20);
			});
		}
	});
	$wrapper.bind('mousedown', function(event) {
		mouse_down = true;
		var x = getMousePos(event).x;
		var y = getMousePos(event).y;
		mouseX = getPosInObj($(this)[0], x, y).x;
		mouseY = getPosInObj($(this)[0], x, y).y;
	});
	$wrapper.bind('mousemove', function(event) {
		if (mouse_down) {
			var x2 = getMousePos(event).x;
			var y2 = getMousePos(event).y;
			var mouseX2 = getPosInObj($(this)[0], x2, y2).x;
			var mouseY2 = getPosInObj($(this)[0], x2, y2).y;
			dx = mouseX - mouseX2;
			dy = mouseY - mouseY2;
			$kids.each(function(index, el) {
				var back_pos = calMoveBackPos(index, dx, dy);
				$(el).css('background-position', back_pos.left + "px " + back_pos.top + "px");
			});
		}
	});
	$(window).bind('mouseup', function(event) {
		mouse_down = false;
		$kids.each(function(index, el) {
			var arr = $(el).css('background-position').split(/px[\s]?/);
			recordCurPos(index, arr);
		});
	});
	$(window).bind('resize', function() {
		disperse();
	});

	function setBackground($el, index) {
		var back_pos = calBackPos(index);
		$el.css({
			'background-image': 'url(' + imgsrc + ')',
			'background-position': back_pos.left + 'px ' + back_pos.top + 'px',
			'transform': 'rotate(0deg)'
		});
		var arr = $el.css('background-position').split(/px[\s]?/);
		recordCurPos(index, arr);
	}
	//移除按钮
	function removeNavigation() {
		$img_next.stop().animate({
			'right': '-50px'
		}, 300);
		$img_pre.stop().animate({
			'left': '-50px'
		}, 300);
	}

	//添加按钮
	function addNavigation() {
		$img_next.stop().animate({
			'right': '0px'
		}, 300);
		$img_pre.stop().animate({
			'left': '0px'
		}, 300);
	}

	function setflag() {
		clickflag = !clickflag;
	}

	function calspace(pl, pc) {
		space_w = $(window).width() / (pl + 1);
		space_h = $(window).height() / (pc + 1);
	}
	//计算背景的位置
	function calBackPos(index) {
		return {
			left: -1 * kidDivWidth * (index % per_line) + middle_posx,
			top: -1 * kidDivHeight * Math.floor(index / per_line) + middle_posy
		};
	}
	//计算展示图片时使其居中所需的偏移量
	function calImgMiddlepos(wrapw, wraph, imgsrc) {
		var w = imgSize[imgsrc].width;
		var h = imgSize[imgsrc].height;
		middle_posx = (wrapw - w) / 2;
		middle_posy = (wraph - h) / 2;
	}
	//计算移动图片时背景的位置
	function calMoveBackPos(index, dx, dy) {
		return {
			left: cur_pos.x[index] - dx,
			top: cur_pos.y[index] - dy
		};
	}

	function recordCurPos(index, arr) {
		cur_pos.x[index] = parseInt(arr[0]);
		cur_pos.y[index] = parseInt(arr[1]);
	}
	//获取鼠标在屏幕中的坐标
	function getMousePos(event) {
		var e = event || window.event;
		return {
			x: e.pageX || (e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft)),
			y: e.pageY || (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop))
		};
	}
	//获取鼠标相对于对象的坐标
	function getPosInObj(el, x, y) {
		return {
			x: x - el.offsetLeft,
			y: y - el.offsetTop
		};
	}
	// randommize the array
	function shuffle(array) {
		for (var j, x, i = array.length; i; j = parseInt(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
		return array;
	};
	//seconde method to randommize the array
	function shuffle2(array) {
		return array.sort(function() {
			return 0.5 - Math.random()
		});
	}
});