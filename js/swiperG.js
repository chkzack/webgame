(function(name, factory) {
	
	if (typeof window === "object")
	{
	    window[name] = factory();
	}
	
})("swiperG", function(){
	
	let loseCount = 0;			// 失败次数
	let container = null;
	let canvasContext = null;
	
	const baseIntervalNum = 1000;	// 用于生成ID的基础乘积数
	// style
	const color = {
		grey: 'rgba(135, 135, 135, 1)',
		black: 'rgba(0, 0, 0, 1)',
		light_grey: 'rgba(235, 235, 235, 1)',
		mid_grey: 'rgba(185, 185, 185, 1)',
		light_blue: 'rgba(75, 125, 245, 1)',
		dark_blue: 'rgba(25, 75, 125, 1)',
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
	const font = {
		default: '1.5rem bolder Arial Black, Gadget, sans-serif',
		title: '1.5rem bolder Impact, Charcoal, sans-serif'
	}	
	const mark = {
		none: 0,
		boom: 1,
		unknown: 2
	}
	
	// block
	let Block = function(index, id, x, y, width, height, ctx){
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
		},
		reseting: function() {
			this._context.fillStyle = color.light_blue;
			this._context.fillRect(this._x, this._y, this._width, this._height);
			this._context.strokeStyle = color.black;
			this._context.strokeRect(this._x, this._y, this._width, this._height);
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
	let Factory = function (options) {
		
		this._blocks = new Array();		// 矩阵数组
		this._boomMap = new Map();	    // 地雷Map
		this._maxBorderBoomCount = 4;	// 最后一次添加炸弹周围炸弹数
		this._boomNum = 0;				// 地雷数量
		
		this._markNum = 0;				// 标记数量
		this._lastMark = undefined;
		
		this._canvasWidth = 600;		// 默认canvas宽度
		this._canvasHeight = 600;		// 默认canvas高度
		this._col = 12;			    	// 默认列数
		this._line = 12;				// 默认行数
		this._lastColNum = this._col - 1;		// 列边界最后数
		this._lastRowNum = this._col * this._line - this._col;// 行边界最后数
		
		this._dialogOpen = false;		// 对话框弹出状态
		this._endGame = false;			// 游戏结束状态
		this._reseting = false;			// 重置中状态
		
		this._options = {};
		
		this.init();
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
			let boomId = x * baseIntervalNum + y;
			let blockIndex = x * this._col + y;
			
			if(!this.boomPositionExists(boomId) && this.borderChecking(blockIndex) < this._maxBorderBoomCount){
				this._boomMap.set(boomId, this._blocks[blockIndex]);
				this._blocks[blockIndex].setBoom();
				--num;
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
			// 上边检测
			if(num > this._lastColNum){  
				if(this._blocks[num - this._col].isBoom()) count++;
			}
			//  下边检测
			if(num < this._lastRowNum){  
				if(this._blocks[num + this._col].isBoom()) count++;
			}
			// 左边检测
			if(num % this._col != 0){	
				if(this._blocks[num - 1].isBoom()) count++;
			}
			// 右边检测
			if(num % this._col != this._lastColNum){  
				if(this._blocks[num + 1].isBoom()) count++;
			}
			// 左上
			if(num > this._lastColNum && num % this._col != 0){  
				if(this._blocks[num - this._col - 1].isBoom()) count++;
			}
			// 右上
			if(num > this._lastColNum && num % this._col != this._lastColNum){
				if(this._blocks[num - this._col + 1].isBoom()) count++;
			}
			// 左下
			if(num < this._lastRowNum && num % this._col != 0){  
				if(this._blocks[num + this._col - 1].isBoom()) count++;
			}
			// 右下
			if(num < this._lastRowNum && num % this._col != this._lastColNum){
				if(this._blocks[num + this._col + 1].isBoom()) count++;
			}
			return count;
		},
		// 展现边界
		showBorder: function(self, firstClick) {
			if(this._reseting || this._endGame || this._dialogOpen) return;
			if(!this.lastMarkCheck()) return;
			
			if(self.isBoom()) {
				// 第一次点中炸弹，结束游戏
				if(true == firstClick) {	
					self.click(true);
					this.showAllBooms(self);
				}
				return ;
			}else{
				// 正常点击
				self.click();	
			}
			// 非炸弹且有数字，不做边界检测
			if(!self.isBoom() && self.getSurroundCount() > 0) {   
				return ;
			}else {		
				// 非炸弹且没数字，做边界检测
				let num = self.getIndex();
				let surroundArray = new Array();
				let num_next = 0;
				// 上边检测
				if(num > this._lastColNum){  
					num_next = num - this._col;
					if(!(num_next < 0) && !this._blocks[num_next].isOpen())
						surroundArray.push(this._blocks[num_next]);
				}
				// 下边检测
				if(num < this._lastRowNum){  
					num_next = num + this._col;
					if(!(num_next > this._blocks.length) && !this._blocks[num_next].isOpen())
						surroundArray.push(this._blocks[num_next]);
				}
				// 左边检测
				if(num % this._col != 0){	
					num_next = num - 1;
					if(!(num_next < 0) && !this._blocks[num_next].isOpen())
						surroundArray.push(this._blocks[num_next]);
				}
				// 右边检测
				if(num % this._col != this._lastColNum){  
					num_next = num + 1;
					if(!(num_next > this._blocks.length) && !this._blocks[num_next].isOpen())
						surroundArray.push(this._blocks[num_next]);
				}
				// 左上
				if(num > this._lastColNum && num % this._col != 0){  
					num_next = num - this._col - 1;
					if(!(num_next < 0) && !this._blocks[num_next].isOpen() && !this._blocks[num_next].isBoom())
						surroundArray.push(this._blocks[num_next]);
				}
				// 左下
				if(num < this._lastRowNum && num % this._col != 0){  
					num_next = num + this._col - 1;
					if(!(num_next > this._blocks.length) && !this._blocks[num_next].isOpen() && !this._blocks[num_next].isBoom())
						surroundArray.push(this._blocks[num_next]);
				}
				// 右上
				if(num > this._lastColNum && num % this._col != this._lastColNum){
					num_next = num - this._col + 1;
					if(!(num_next < 0) && !this._blocks[num_next].isOpen() && !this._blocks[num_next].isBoom())
						surroundArray.push(this._blocks[num_next]);
				}
				// 右下
				if(num < this._lastRowNum && num % this._col != this._lastColNum){
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
		// 计算所有方块周围地雷数
		countBoomNum4AllBlock: function() { 
			for(var i=0; i<this._blocks.length; i++) {
				this._blocks[i].setSurroundCount(this.borderChecking(i));
			}
		},
		// 最后一次标记检测
		lastMarkCheck: function() {
			if(this._lastMark != undefined) { 
				if(this._boomMap.get(this._lastMark._id) == undefined 
					&& this._blocks[this._lastMark._index]._mark == 1) {
						this.showAllBooms(this._lastMark);
						this._lastMark.markError();
						return false;
				}
				--this._markNum;
			}
			return true;
		},
		// 标记操作并检测
		mark: function(self){
			if(!this._endGame && !self.isOpen()) {
				if(!this.lastMarkCheck()){
					this.endGame(false);
					return;
				}else {
					this._lastMark = self;
					self.mark();
					// 游戏获胜结束
					if(this._markNum == 0) {	
						this.endGame(this.lastMarkCheck());
					}
				}
			}
		},
		// 引爆所有，游戏结束
		showAllBooms: function(self) { 
			for(let b of this._boomMap) {
				if(b[0] != self._id) {
					b[1].click();
				}
			}
			this.endGame(false);	// 游戏失败
		},
		// 结束游戏
		endGame: function(isSuccess) {
			this._endGame = true;
			
			if(isSuccess == true) {
				this._drawDialog('Σ( ° △ °|||)︴成，成功了', '点击画面再试一次？', 200);
				loseCount = 0;
			}else {
				if(loseCount < 3) {
					this._drawDialog('(￣△￣；)游戏失败', '点击画面再试一次？', 200);
				}else {
					this._drawDialog('_(:з」∠)_可以调整难度哦', '点击画面再试一次？', 200);
				}
				loseCount ++;
			}
		},
		// 初始化游戏矩阵
		initBlocks: function(canvasWidth) {
			this._cleanCanvas();
			this._boomMap.clear(); 			// 清空炸弹MAP
			this._lastMark = undefined;
			this._markNum = this._boomNum;
			
			let rate = this._canvasWidth / this._col >> 0;
			if(this._blocks.length < 1) {	// 初始化矩阵
				let blockSize = this._col * this._line;
				for(let i=0,col=0,line=0; i<blockSize; i++,col++) {
					if(col == this._col) {	
						col = 0;
						line++;
					}
					let b = new Block(i, line * baseIntervalNum + col, col*rate, line*rate, rate, rate, canvasContext);
					this._blocks.push(b);
				}
			}else {
				for(let b of this._blocks) {	// 重置矩阵
					b.reset();
				}
			}
			// 添加地雷
			this.addRandomBoom(this._boomNum);
			// 计算数字
			this.countBoomNum4AllBlock();
			// 绘制
			this._drawBlocks();
		},
		// 重置游戏
		reset: function(boomNum) {
			if(this._reseting) return;
			if(typeof boomNum == 'string') {
				// 按钮重置游戏
				boomNum = parseInt(boomNum);
				if(typeof boomNum == 'number' && boomNum > 0 && boomNum < this._blocks.length*3/4) {
					this._boomNum = boomNum;
				}
			}else{
				// 屏蔽未弹出对话框时重置游戏
				if(!this._dialogOpen) return;
			}
			this._reseting = true;
			this._cleanCanvas();
			this.initBlocks();
		},
		// 整体初始化
		init: function() {
			// 初始化canvas
			let canvas = document.getElementById('container');
			this._canvasWidth = canvas.width = screen.availWidth>600?600:screen.availWidth;
			this._canvasHeight = canvas.height = screen.availWidth>600?600:screen.availWidth;
			container = canvas;
			canvasContext = canvas.getContext("2d");
			canvasContext.textAlign = 'center';
			
			// 初始化方块矩阵
			this.initBlocks();
			// 监听事件
			this.initInteractiveEvent();
		},
		// 清空画布
		_cleanCanvas: function() {
			//canvasContext.clearRect(0, 0, container.width, container.height);
			canvasContext.fillStyle = color.black;
			canvasContext.clearRect(0, 0, container.width, container.height);
		},
		// 绘制矩形
		_drawBlocks: function() {
			let index = 0;
			let main = this;
			let blocksAnimateId = 0;
			
			let drawBlocks = function() {
				
				if(index < main._blocks.length){
					main._blocks[index].reseting();
					++index;
				}else{
					// 重置游戏相关状态
					for(let b of main._blocks) b.show();
					main._endGame = false;
					main._dialogOpen = false;
					main._reseting = false;
					window.cancelAnimationFrame(blocksAnimateId);
					return;
				}
				
				blocksAnimateId = window.requestAnimationFrame(drawBlocks);
			}
			
			drawBlocks();
			// for(let b of this._blocks) b.show();
		},
		// 弹出对话框
		_drawDialog: function(title, content, delayMillis) {
			if(typeof delayMillis != 'number' && delayMillis < 0) delayMillis = 1000;
			
			let main = this;
			let width = container.clientWidth/2;
			let height = container.clientHeight/2;
			
			let dialogAnimateId = 0;
			let count = 0;
			let countDown = 20;
			let dialogAnimation = function() {
				if(count < countDown) {
					canvasContext.fillStyle = 'rgba(235, 235, 235, '+count/countDown+')';
					canvasContext.fillRect(width/2, height*3/4, width, height/2);
					canvasContext.strokeStyle = 'rgba(0, 0, 0, '+count/countDown+')';
					canvasContext.strokeRect(width/2, height*3/4, width, height/2);
					if(count > countDown/20) {
						canvasContext.fillStyle = 'rgba(0, 0, 0, '+count/countDown+')';
						canvasContext.font = font.title;
						canvasContext.fillText(title, width, height);
						canvasContext.fillText(content, width + 10, height + 30);
					}
					
					++count;
					dialogAnimateId = window.requestAnimationFrame(dialogAnimation);
				}else {
					main._dialogOpen = true;
					window.cancelAnimationFrame(dialogAnimateId);
				}
			}
			
			setTimeout(() => {
				dialogAnimation();
			}, delayMillis);
			
		},
		// 初始化事件
		initInteractiveEvent: function() {
			var main = this; 
			document.getElementById('boomNum').value = this._boomNum;
			// 屏蔽右击事件
			document.oncontextmenu = function(e){return false;}
			// 鼠标事件
			document.addEventListener('mousedown', function(evt) {
				let canvas = document.getElementById('container');
				if(evt.clientX - canvas.offsetLeft > 0 
					&& evt.clientY - canvas.offsetTop > 0 
					&& evt.clientX - canvas.offsetLeft < canvas.clientWidth
					&& evt.clientY - canvas.offsetTop < canvas.clientHeight ) {
					
					let blockId = ((evt.clientY - canvas.offsetTop)/main._canvasWidth * main._line >> 0) * main._col 
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

