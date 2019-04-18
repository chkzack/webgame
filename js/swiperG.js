(function(name, factory) {
	
	if (typeof window === "object")
	{
	    window[name] = factory();
	}
	
})("swiperG", function(){
	
	// style
	const color = {
		grey: 'rgba(135, 135, 135, 1)',
		black: 'rgba(0, 0, 0, 1)',
		light_grey: 'rgba(235, 235, 235, 1)',
		mid_grey: 'rgba(185, 185, 185, 1)',
		boom_red: 'rgba(235, 0, 0, 1)',
		boom_black: 'rgba(0, 0, 0, 0.9)',
		boom_white: 'rgba(255, 255, 255, 0.9)',
		num_green: 'rgba(0, 125, 0, 1)',
		num_yellow: 'rgba(75, 125, 0, 1)',
		num_orange: 'rgba(125, 75, 0, 1)',
		num_red: 'rgba(125, 0, 0, 1)',
		mark_red: 'rgba(225, 25, 0, 1)',
		mark_yellow: 'rgba(255, 255, 0, 1)'
	}
		
	const	font = {
		default: '1.5rem bolder Arial Black, Gadget, sans-serif',
		title: '1.5rem bolder Impact, Charcoal, sans-serif'
	}	
	
	const mark = {
		none: 0,
		boom: 1,
		unknown: 2
	}
	
	// block
	var Block = function(index, id, x, y, width, height, ctx){
		this._index = index;
		this._id = id;				// 模块ID
		this._isBoom = false;		// 是否炸弹
		this._surroundCount = 0;    // 周围环绕数量
		this._isOpen = false;		// 是否打开
		this._mark = mark.none;				// 标记 0：无标记 1：地雷标记 2：疑问标记
		
		this._x = x;				// 画布坐标x
		this._y = y;				// 画布坐标y
		this._width = width;			// 方块宽度
		this._height = height;			// 方块高度
		this._context = ctx;
	}
	
	Block.prototype = {
		isBoom: function() {
			return this._isBoom;
		},
		setBoom: function() {
			this._isBoom = true;
		},
		getIndex: function() {
			return this._index;
		},
		reset: function() {
			this._isBoom = false;
			this._isOpen = false;
			this._surroundCount = 0; 
		},
		setSurroundCount: function(num) {
			if(typeof num == "number" && num > 0) this._surroundCount = num;
		},
		isOpen: function() {
			return this._isOpen;
		},
		Open: function() {
			this._isOpen = true;
		},
		getSurroundCount: function() {
			return this._surroundCount;
		},
		show: function() {
			this._context.fillStyle = color.light_grey;
			this._context.fillRect(this._x, this._y, this._width, this._height);
			this._context.fillStyle = color.grey;
			this._context.fillRect(this._x, this._y + this._height*7/8, this._width, this._height/8);
			this._context.fillRect(this._x + this._height*7/8, this._y + this._height/8, this._width/8, this._height*7/8);
			
			/* test 
			var grad = this._context.createLinearGradient(this._x, this._y, this._x + this._width, this._y + this._height);
			grad.addColorStop(0, color.light_grey);
			grad.addColorStop(1, color.grey);
			this._context.fillStyle = grad;
			this._context.fillRect(this._x, this._y, this._width, this._height); */
			
			this._context.fillStyle = color.mid_grey;
			this._context.fillRect(this._x + this._width/8, this._y + this._height/8, this._width*3/4, this._height*3/4);
			
			this._context.strokeStyle = color.black;
			this._context.strokeRect(this._x, this._y, this._width, this._height);
			this._context.save();
		},
		click: function(firstClick) {
			this.Open();
			if(!this.isBoom()) {
				this._context.fillStyle = color.light_grey;
				this._context.fillRect(this._x, this._y, this._width, this._height);
				this._context.strokeStyle = color.black;
				this._context.strokeRect(this._x, this._y, this._width, this._height);
				this._context.font = font.default;
				switch(this._surroundCount){
					case 1: 
						this._context.fillStyle = color.num_green;
						break;
					case 2: 
						this._context.fillStyle = color.num_yellow;
						break;
					case 3: 
						this._context.fillStyle = color.num_orange;
						break;
					case 4: 
						this._context.fillStyle = color.num_red;
						break;
					default: break;
				}
				if(this._surroundCount > 0) this._context.fillText(this._surroundCount, this._x + this._width/2, this._y + this._height/2 + 10);
				this._context.save();
			}else {
				if(this._mark == mark.boom) return;
				/* 
				this._context.clearRect(this._x, this._y, this._width, this._height);
				
				if(true == firstClick) {
					this._context.fillStyle = color.boom_red;
				}else{
					this._context.fillStyle = color.light_grey;
				}
				this._context.fillRect(this._x, this._y, this._width, this._height);
				this._context.strokeStyle = color.black;
				this._context.strokeRect(this._x, this._y, this._width, this._height);
				
				this._context.shadowBlur = 5;
				this._context.shadowOffsetX = 1;
				this._context.shadowOffsetY = 1;
				
				this._context.fillStyle = color.boom_black;
				this._context.fillRect(this._x + this._width/2, this._y + this._height/8, this._width/8, this._height/8);
				
				this._context.beginPath();
				this._context.ellipse(this._x + this._width/2, this._y + this._height/2, this._width/3, this._width/3, 0, 0, 2 * Math.PI);
				this._context.fill();
				this._context.closePath();
				
				this._context.beginPath();
				this._context.fillStyle = color.boom_white;
				this._context.ellipse(this._x + this._width/3, this._y + this._height/3, this._width/16, this._width/16, 0, 0, 2 * Math.PI);
				this._context.fill();
				this._context.closePath(); */
				
				this.boomAnimation(firstClick);	// 爆炸动画
				
				this._context.save();
			}
		},
		mark: function() {
			if(this.isOpen()) return;
			if(++this._mark > 2) this._mark = 0;
			this.show();
			switch(this._mark) {
				case mark.none:
					break;
				case mark.boom:
					this._context.strokeRect(this._x, this._y, this._width, this._height);
					this._context.fillStyle = color.black;
					this._context.fillRect(this._x + this._width*15/32, this._y + this._height/2, this._width/16, this._height/4);
					this._context.fillRect(this._x + this._width/4, this._y + this._height*3/4, this._width/2, this._height/16);
					this._context.fillStyle = color.mark_red;
					this._context.beginPath();
					this._context.moveTo(this._x + this._width*7/16, this._y + this._height*3/16);
					this._context.lineTo(this._x + this._width*13/16, this._y + this._height*7/16);
					this._context.lineTo(this._x + this._width*7/16, this._y + this._height*5/8);
					this._context.fill();
					this._context.closePath();
					break;
				case mark.unknown:
					this._context.font = font.default;
					this._context.fillStyle = color.mark_yellow;
					this._context.fillText('?', this._x + this._width/2, this._y + this._height/2 + 10)
					break;
				default: break;
			}
		},
		markError: function() {
			this._context.strokeStyle = color.boom_red;
			this._context.lineWidth = 3;
			this._context.beginPath();
			this._context.moveTo(this._x + this._width*1/8, this._y + this._height*1/8);
			this._context.lineTo(this._x + this._width*7/8, this._y + this._height*7/8);
			this._context.stroke();
			this._context.closePath()
			this._context.beginPath();
			this._context.moveTo(this._x + this._width*7/8, this._y + this._height*1/8);
			this._context.lineTo(this._x + this._width*1/8, this._y + this._height*7/8);
			this._context.stroke();
			this._context.closePath();
		},
		boomAnimation: function(firstClick) {
			
			let pace = 0;
			let r = this._width<this._height?this._width/2:this._height/2;
			let boom = this;
			let animationId = undefined;
			
			let delayAnimation = function() {
				boom._context.clearRect(boom._x, boom._y, boom._width, boom._height);
				
				let grad = boom._context.createRadialGradient(boom._x + r, boom._y + r, 0, boom._x + r, boom._y + r, r);
				grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
				grad.addColorStop(1, 'rgba(255, 0, 0, 1)');
				
				if(pace < r) {
					boom._context.fillStyle = grad;
					boom._context.beginPath();
					boom._context.ellipse(boom._x + r, boom._y + r, pace, pace, 0, 0, 2 * Math.PI);
					boom._context.fill();
					boom._context.closePath();
					
					pace += 2;
					animationId = window.requestAnimationFrame(delayAnimation);
				}else {
					window.cancelAnimationFrame(animationId);
					
					boom._context.clearRect(boom._x, boom._y, boom._width, boom._height);
					
					if(true == firstClick) {
						boom._context.fillStyle = color.boom_red;
					}else{
						boom._context.fillStyle = color.light_grey;
					}
					boom._context.fillRect(boom._x, boom._y, boom._width, boom._height);
					boom._context.strokeStyle = color.black;
					boom._context.strokeRect(boom._x, boom._y, boom._width, boom._height);
					
					boom._context.shadowBlur = 5;
					boom._context.shadowOffsetX = 1;
					boom._context.shadowOffsetY = 1;
					
					boom._context.fillStyle = color.boom_black;
					boom._context.fillRect(boom._x + boom._width/2, boom._y + boom._height/8, boom._width/8, boom._height/8);
					
					boom._context.beginPath();
					boom._context.ellipse(boom._x + boom._width/2, boom._y + boom._height/2, boom._width/3, boom._width/3, 0, 0, 2 * Math.PI);
					boom._context.fill();
					boom._context.closePath();
					
					boom._context.beginPath();
					boom._context.fillStyle = color.boom_white;
					boom._context.ellipse(boom._x + boom._width/3, boom._y + boom._height/3, boom._width/16, boom._width/16, 0, 0, 2 * Math.PI);
					boom._context.fill();
					boom._context.closePath();
				}
			}
			
			delayAnimation();
			
		}
	}
	
	// main
	var Factory = function (options) {
		this._boomNum = 50;				// 地雷数量
		this._canvasWidth = 600;		// 默认canvas宽度
		this._col = 15;			    // 默认列数
		this._line = 15;				// 默认行数
		this._endGame = false;			// 游戏结束标志
		this._boomMap = new Map();	    // 地雷Map
		this._blocks = new Array();		// 矩阵数组
		this._options = {};
		this._baseIntervalNum = 1000;	// 用于生成ID的基础乘积数
		this._lastColNum = this._col - 1;		// 列边界最后数
		this._lastRowNum = this._col * this._line - this._col;// 行边界最后数
		this._lastMark = undefined;
		this._maxBorderBoomCount = 4;	// 最后一次添加炸弹周围炸弹数
		this._markNum = 0;				// 标记数量
		this._loseCount = 0;
		
		this._container = null;
		this._canvasContext = null;
		
		this.init();
		window.swiperG = this;
	}
	
	// method
	Factory.prototype = {
		// 构造函数
		constructor: Factory,
		// 设置本地参数
		setOptions: function (options)
		{
		    if (typeof options === "object")
		    {
		        for (var key in options)
		        {
		            if (options.hasOwnProperty(key))
		            {
		                this._options[key] = options[key];
		            }
		        }
		    }
		},
		// 炸弹位置是否已占用
		boomPositionExists: function(boomId) { 
			return this._boomMap.has(boomId);
		},
		// 随机添加炸弹
		addRandomBoom: function(num) { 
			if(typeof num != "number") return ; 
			let x = Math.random() * this._col >> 0;
			let y = Math.random() * this._line >> 0;
			let boomId = x * this._baseIntervalNum + y;
			let blockIndex = x * this._col + y;
			
			if(!this.boomPositionExists(boomId) && this.borderChecking(blockIndex) < this._maxBorderBoomCount){
				this._boomMap.set(boomId, this._blocks[blockIndex]);
				this._blocks[blockIndex].setBoom();
				num --;
				if(num <= 0){
					return ;
				}else{
					this.addRandomBoom(num);
				} 
			}else{
				this.addRandomBoom(num);
			}
		},
		// 边界检测
		borderChecking: function(num, count) { 
			if(typeof count == "undefined") count = 0;
			if(num > this._lastColNum){  //  上边检测
				if(this._blocks[num - this._col].isBoom()) count++;
			}
			if(num < this._lastRowNum){  //  下边检测
				if(this._blocks[num + this._col].isBoom()) count++;
			}
			if(num % this._col != 0){	// 左边检测
				if(this._blocks[num - 1].isBoom()) count++;
			}
			if(num % this._col != this._lastColNum){  //  右边检测
				if(this._blocks[num + 1].isBoom()) count++;
			}
			
			if(num > this._lastColNum && num % this._col != 0){  // 左上
				if(this._blocks[num - this._col - 1].isBoom()) count++;
			}
			if(num > this._lastColNum && num % this._col != this._lastColNum){  // 右上
				if(this._blocks[num - this._col + 1].isBoom()) count++;
			}
			if(num < this._lastRowNum && num % this._col != 0){  // 左下
				if(this._blocks[num + this._col - 1].isBoom()) count++;
			}
			if(num < this._lastRowNum && num % this._col != this._lastColNum){  // 右下
				if(this._blocks[num + this._col + 1].isBoom()) count++;
			}
			return count;
		},
		// 展现边界
		showBorder: function(self, firstClick) {
			
			if(!this.lastMarkCheck()) return;
			
			if(self.isBoom()) {
				if(true == firstClick) {	// 第一次点中炸弹，结束游戏
					self.click(true);
					this.showAllBooms(self);
					this._endGame = true;
				}
				return ;
			}else{
				self.click();	// 正常点击
			}

			if(!self.isBoom() && self.getSurroundCount() > 0) {   // 非炸弹且有数字，不做边界检测
				return ;
			}else {		// 非炸弹且没数字，做边界检测
				let num = self.getIndex();
				let surroundArray = new Array();
				let num_next = 0;
				
				if(num > this._lastColNum){  //  上边检测
					num_next = num - this._col;
					if(!(num_next < 0) && !this._blocks[num_next].isOpen())
						surroundArray.push(this._blocks[num_next]);
				}
				if(num < this._lastRowNum){  //  下边检测
					num_next = num + this._col;
					if(!(num_next > this._blocks.length) && !this._blocks[num_next].isOpen())
						surroundArray.push(this._blocks[num_next]);
				}
				if(num % this._col != 0){	// 左边检测
					num_next = num - 1;
					if(!(num_next < 0) && !this._blocks[num_next].isOpen())
						surroundArray.push(this._blocks[num_next]);
				}
				if(num % this._col != this._lastColNum){  //  右边检测
					num_next = num + 1;
					if(!(num_next > this._blocks.length) && !this._blocks[num_next].isOpen())
						surroundArray.push(this._blocks[num_next]);
				}
				
				if(num > this._lastColNum && num % this._col != 0){  // 左 上
					num_next = num - this._col - 1;
					if(!(num_next < 0) && !this._blocks[num_next].isOpen() && !this._blocks[num_next].isBoom())
						surroundArray.push(this._blocks[num_next]);
				}
				if(num < this._lastRowNum && num % this._col != 0){  // 左下
					num_next = num + this._col - 1;
					if(!(num_next > this._blocks.length) && !this._blocks[num_next].isOpen() && !this._blocks[num_next].isBoom())
						surroundArray.push(this._blocks[num_next]);
				}
				if(num > this._lastColNum && num % this._col != this._lastColNum){  // 右上
					num_next = num - this._col + 1;
					if(!(num_next < 0) && !this._blocks[num_next].isOpen() && !this._blocks[num_next].isBoom())
						surroundArray.push(this._blocks[num_next]);
				}
				if(num < this._lastRowNum && num % this._col != this._lastColNum){  // 右下
					num_next = num + this._col + 1;
					if(!(num_next > this._blocks.length) && !this._blocks[num_next].isOpen() && !this._blocks[num_next].isBoom())
						surroundArray.push(this._blocks[num_next]);
				}
				
				for(let b of surroundArray) {
					this.showBorder(b);
				}
				return ;
			}
		},
		// 引爆所有，游戏结束
		showAllBooms: function(self) { 
			for(let b of this._boomMap) {
				if(b[0] != self._id) {
					b[1].click();
				}
			}
			
			// 画出对话框
			let main = this;
			let width = main._container.clientWidth/2;
			let height = main._container.clientHeight/2;
			setTimeout(() => {
				main._canvasContext.fillStyle = color.light_grey;
				main._canvasContext.fillRect(width/2, height*3/4, width, height/2);
				main._canvasContext.strokeStyle = color.black;
				main._canvasContext.strokeRect(width/2, height*3/4, width, height/2);
				main._canvasContext.fillStyle = color.black;
				main._canvasContext.font = font.title;
				if(main._loseCount < 3) {
					main._canvasContext.fillText('(￣△￣；)', width, height);
				}else {
					main._canvasContext.fillText('_(:з」∠)_可以调整难度哦', width, height);
				}
				main._canvasContext.fillText('再试一次？', width + 10, height + 30);
				
				main._loseCount ++;
			}, 500);
			
		},
		// 计算地雷周围数字
		countBoomNum4AllBlock: function() { 
			for(var i=0; i<this._blocks.length; i++) {
				this._blocks[i].setSurroundCount(this.borderChecking(i));
			}
		},
		lastMarkCheck: function() {
			if(this._lastMark != undefined 
				&& this._boomMap.get(this._lastMark._id) == undefined 
				&& this._blocks[this._lastMark._index]._mark == 1) {
					this.showAllBooms(this._lastMark);
					this._lastMark.markError();
					this._endGame = true;
					return false;
			}
			return true;
		},
		// 设立标志
		mark: function(self){
			if(!this._endGame && !self.isOpen() && this.lastMarkCheck()) {
				this._lastMark = self;
				self.mark();
				
				switch(self._mark) {
					case mark.default: 
						break;
					case mark.boom:
						this._markNum++;
						break;
					case mark.unknown:
						this._markNum--;
						break;
				}
				
				if(this._markNum == this._boomNum) {
					this.lastMarkCheck();
					this._endGame = true;
					
					let main = this;
					let width = main._container.clientWidth/2;
					let height = main._container.clientHeight/2;
					setTimeout(() => {
						main._canvasContext.fillStyle = color.light_grey;
						main._canvasContext.fillRect(width/2, height*3/4, width, height/2);
						main._canvasContext.strokeStyle = color.black;
						main._canvasContext.strokeRect(width/2, height*3/4, width, height/2);
						main._canvasContext.fillStyle = color.black;
						main._canvasContext.font = font.title;
						main._canvasContext.fillText('Σ( ° △ °|||)︴成，成功了', width, height);
						main._canvasContext.fillText('再试一次？', width + 10, height + 30);
						
						main._loseCount = 0;
					}, 500);
				}
			}
		},
		initGame(canvasWidth) {
			// 初始化矩阵
			if(typeof canvasWidth != 'number' || canvasWidth < 1) {
				canvasWidth = this._canvasWidth;
			}else{
				this._canvasWidth = canvasWidth;
			}
			var rate = canvasWidth / this._col >> 0;
			if(this._blocks.length < 1) {	// 初始化矩阵
				var blockSize = this._col * this._line;
				for(var i=0,col=0,line=0; i<blockSize; i++,col++) {
					if(col == this._col) {	
						col = 0;
						line++;
					}
					var b = new Block(i, line * this._baseIntervalNum + col, col*rate, line*rate, rate, rate, this._canvasContext);
					this._blocks.push(b);
				}
			}else {
				for(var b of this._blocks) {	// 重置矩阵
					b.reset();
				}
			}
			// 添加地雷
			this.addRandomBoom(this._boomNum);
			// 计算数字
			this.countBoomNum4AllBlock();
			// 挂载方阵
			for(let b of this._blocks) b.show();
		},
		// 初始化游戏
		init: function() {
			// 初始化canvas
			var canvas = document.getElementById('container');
			canvas.width = screen.availWidth>600?600:screen.availWidth;
			canvas.height = screen.availWidth>600?600:screen.availWidth;
			this._container = canvas;
			this._canvasContext = canvas.getContext("2d");
			this._canvasContext.textAlign = 'center';
			// 游戏全局初始化
			this.initGame(canvas.width);
			// 监听事件
			this.initInteractiveEvent();
		},
		// 重置
		reset: function(num) {
			this._canvasContext.clearRect(0, 0, this._canvasContext.width, this._canvasContext.height);
			num = parseInt(num);
			if(typeof num == 'number' && num > 0 && num < this._blocks.length*3/4) {
				this._boomNum = num;
			}
			if(this._boomMap.size > 0) 
				this._boomMap.clear(); // 清空炸弹MAP
			this._lastMark = undefined;
			this._markNum = 0;
			this.initGame();
			this._endGame = false;
		},
		initInteractiveEvent: function() {
			var main = this; 
			document.getElementById('boomNum').value = this._boomNum;
			// 屏蔽右击事件
			document.oncontextmenu = function(e){return false;}
			/*
			document.addEventListener('mousemove', function(evt) {
				var canvas = document.getElementById('container');
				document.getElementById('mouse_x').value = evt.clientX - canvas.offsetLeft;
				document.getElementById('mouse_y').value = evt.clientY - canvas.offsetTop;
				document.getElementById('block_id').value = ((evt.clientY - canvas.offsetTop)/window.swiperG._canvasWidth * window.swiperG._line >> 0) * window.swiperG._col 
																+ (evt.clientX - canvas.offsetLeft)/window.swiperG._canvasWidth * window.swiperG._col >> 0;
			});
			*/
			document.addEventListener('mousedown', function(evt) {
				var canvas = document.getElementById('container');
				if(evt.clientX - canvas.offsetLeft > 0 
					&& evt.clientY - canvas.offsetTop > 0 
					&& evt.clientX - canvas.offsetLeft < canvas.clientWidth
					&& evt.clientY - canvas.offsetTop < canvas.clientHeight ) {
						
					var blockId = ((evt.clientY - canvas.offsetTop)/main._canvasWidth * main._line >> 0) * main._col 
										+ (evt.clientX - canvas.offsetLeft)/main._canvasWidth * main._col >> 0;
					if(!main._endGame) {
						if(evt.which == 1) {
							main.showBorder(main._blocks[blockId], true);
						}
						if(evt.which == 3) {
							main.mark(main._blocks[blockId]);
						}
						
						if(evt.which == 2) {
							main.showBorder(main._blocks[blockId], true);
						}
					}else {
						main.reset();
					}
				}
			});
			document.getElementById('resetGame').addEventListener('click', function(){
				main.reset(document.getElementById('boomNum').value);
			});
		}
	}
	
	// export
	return Factory;
});

