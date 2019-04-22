(function(name, factory) {
	
	if (typeof window === "object")
	{
	    window[name] = factory();
	}
	
})("swiperG", function(){
	
	let loseCount = 0;			// 失败次数
	let container = null;
	let ctx = null;
	/* 状态 */
	let dislogOpen = false;		// 对话框弹出状态
	let endGame = false;			// 游戏结束状态
	let reseting = false;			// 重置中状态
	
	let blocks = new Array();		// 矩阵数组
	let boomMap = new Map();	    // 地雷Map
	let maxBorderBoomCount = 5;	// 最后一次添加炸弹周围炸弹数
	let boomNum = 0;				// 地雷数量
	
	let markNum = 0;				// 标记数量
	let lastMark = undefined;		// 最后标记的对象
	
	let titleBarHeight = 100;		// 地雷矩阵上边框高度
	let canvasWidth = 600;		// 默认canvas宽度
	let canvasHeight = canvasWidth + titleBarHeight;		// 默认canvas高度
	
	const baseIntervalNum = 1000;	// 用于生成ID的基础乘积数
	// style
	const color = {
		grey: 'rgba(135, 135, 135, 1)',
		black: 'rgba(0, 0, 0, 1)',
		light_grey: 'rgba(235, 235, 235, 1)',
		mid_grey: 'rgba(185, 185, 185, 1)',
		light_blue: 'rgba(75, 125, 245, 1)',
		dark_blue: 'rgba(25, 105, 125, 1)',
		yellow: 'rgba( 225, 225, 0, 1)',
		boom_red: 'rgba(235, 0, 0, 1)',
		boom_black: 'rgba(0, 0, 0, 0.9)',
		boom_white: 'rgba(255, 255, 255, 0.9)',
		num_green: 'rgba(0, 175, 0, 1)',
		num_yellow: 'rgba(175, 175, 0, 1)',
		num_orange: 'rgba(175, 75, 0, 1)',
		num_red: 'rgba(175, 0, 0, 1)',
		num_dark_red: 'rgba(75, 0, 0, 1)',
		num_darker_red: 'rgba(45, 0, 0, 1)',
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
	let Block = function(index, id, x, y, width, height){
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
			ctx.fillStyle = color.light_grey;
			ctx.fillRect(this._x, this._y, this._width, this._height);
			ctx.fillStyle = color.grey;
			ctx.fillRect(this._x, this._y + this._height*7/8, this._width, this._height/8);
			ctx.fillRect(this._x + this._height*7/8, this._y + this._height/8, this._width/8, this._height*7/8);
			
			/* test 
			var grad = ctx.createLinearGradient(this._x, this._y, this._x + this._width, this._y + this._height);
			grad.addColorStop(0, color.light_grey);
			grad.addColorStop(1, color.grey);
			ctx.fillStyle = grad;
			ctx.fillRect(this._x, this._y, this._width, this._height); */
			
			ctx.fillStyle = color.mid_grey;
			ctx.fillRect(this._x + this._width/8, this._y + this._height/8, this._width*3/4, this._height*3/4);
			
			ctx.strokeStyle = color.black;
			ctx.strokeRect(this._x, this._y, this._width, this._height);
		},
		reseting: function() {
			ctx.fillStyle = color.light_blue;
			ctx.fillRect(this._x, this._y, this._width, this._height);
			ctx.strokeStyle = color.black;
			ctx.strokeRect(this._x, this._y, this._width, this._height);
		},
		click: function(firstClick) {
			this.Open();
			if(!this.isBoom()) {
				ctx.fillStyle = color.light_grey;
				ctx.fillRect(this._x, this._y, this._width, this._height);
				ctx.strokeStyle = color.black;
				ctx.strokeRect(this._x, this._y, this._width, this._height);
				ctx.font = font.default;
				switch(this._surroundCount){
					case 1: 
						ctx.fillStyle = color.num_green;
						break;
					case 2: 
						ctx.fillStyle = color.num_yellow;
						break;
					case 3: 
						ctx.fillStyle = color.num_orange;
						break;
					case 4: 
						ctx.fillStyle = color.num_red;
						break;
					case 5: 
						ctx.fillStyle = color.num_dark_red;
						break;
					case 5: 
						ctx.fillStyle = color.num_darker_red;
						break;
					default: break;
				}
				if(this._surroundCount > 0) ctx.fillText(this._surroundCount, this._x + this._width/2, this._y + this._height/2 + 10);
			}else {
				if(this._mark == mark.boom) return;
				this.boomAnimation(firstClick);	// 爆炸动画
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
					ctx.strokeRect(this._x, this._y, this._width, this._height);
					ctx.fillStyle = color.black;
					ctx.fillRect(this._x + this._width*15/32, this._y + this._height/2, this._width/16, this._height/4);
					ctx.fillRect(this._x + this._width/4, this._y + this._height*3/4, this._width/2, this._height/16);
					ctx.fillStyle = color.mark_red;
					ctx.beginPath();
					ctx.moveTo(this._x + this._width*7/16, this._y + this._height*3/16);
					ctx.lineTo(this._x + this._width*13/16, this._y + this._height*7/16);
					ctx.lineTo(this._x + this._width*7/16, this._y + this._height*5/8);
					ctx.fill();
					ctx.closePath();
					break;
				case mark.unknown:
					ctx.font = font.default;
					ctx.fillStyle = color.mark_yellow;
					ctx.fillText('?', this._x + this._width/2, this._y + this._height/2 + 10)
					break;
				default: break;
			}
		},
		markError: function() {
			ctx.strokeStyle = color.boom_red;
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(this._x + this._width*1/8, this._y + this._height*1/8);
			ctx.lineTo(this._x + this._width*7/8, this._y + this._height*7/8);
			ctx.stroke();
			ctx.closePath()
			ctx.beginPath();
			ctx.moveTo(this._x + this._width*7/8, this._y + this._height*1/8);
			ctx.lineTo(this._x + this._width*1/8, this._y + this._height*7/8);
			ctx.stroke();
			ctx.closePath();
		},
		boomAnimation: function(firstClick) {
			
			let pace = 0;
			let r = this._width<this._height?this._width/2:this._height/2;
			let boom = this;
			let animationId = undefined;
			
			let delayAnimation = function() {
				ctx.clearRect(boom._x, boom._y, boom._width, boom._height);
				
				let grad = ctx.createRadialGradient(boom._x + r, boom._y + r, 0, boom._x + r, boom._y + r, r);
				grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
				grad.addColorStop(1, 'rgba(255, 0, 0, 1)');
				
				if(pace < r) {
					ctx.fillStyle = grad;
					ctx.beginPath();
					ctx.ellipse(boom._x + r, boom._y + r, pace, pace, 0, 0, 2 * Math.PI);
					ctx.fill();
					ctx.closePath();
					
					pace += 2;
					animationId = window.requestAnimationFrame(delayAnimation);
				}else {
					window.cancelAnimationFrame(animationId);
					
					ctx.clearRect(boom._x, boom._y, boom._width, boom._height);
					
					if(true == firstClick) {
						ctx.fillStyle = color.boom_red;
					}else{
						ctx.fillStyle = color.light_grey;
					}
					ctx.fillRect(boom._x, boom._y, boom._width, boom._height);
					ctx.strokeStyle = color.black;
					ctx.strokeRect(boom._x, boom._y, boom._width, boom._height);
					
					ctx.shadowBlur = 5;
					ctx.shadowOffsetX = 1;
					ctx.shadowOffsetY = 1;
					
					ctx.fillStyle = color.boom_black;
					ctx.fillRect(boom._x + boom._width/2, boom._y + boom._height/8, boom._width/8, boom._height/8);
					
					ctx.beginPath();
					ctx.ellipse(boom._x + boom._width/2, boom._y + boom._height/2, boom._width/3, boom._width/3, 0, 0, 2 * Math.PI);
					ctx.fill();
					ctx.closePath();
					
					ctx.beginPath();
					ctx.fillStyle = color.boom_white;
					ctx.ellipse(boom._x + boom._width/3, boom._y + boom._height/3, boom._width/16, boom._width/16, 0, 0, 2 * Math.PI);
					ctx.fill();
					ctx.closePath();
				}
			}
			
			delayAnimation();
		}
	}
	
	// main
	let Factory = function (options) {
		
		this._col = 12;			    	// 默认列数
		this._line = 12;				// 默认行数
		this._lastColNum = this._col - 1;		// 列边界最后数
		this._lastRowNum = this._col * this._line - this._col;// 行边界最后数
		
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
			return boomMap.has(boomId);
		},
		// 随机添加炸弹
		addRandomBoom: function(num) { 
			if(typeof num != "number") return ; 
			let x = Math.random() * this._col >> 0;
			let y = Math.random() * this._line >> 0;
			let boomId = x * baseIntervalNum + y;
			let blockIndex = x * this._col + y;
			
			if(!this.boomPositionExists(boomId) && this.borderChecking(blockIndex) < maxBorderBoomCount){
				boomMap.set(boomId, blocks[blockIndex]);
				blocks[blockIndex].setBoom();
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
				if(blocks[num - this._col].isBoom()) count++;
			}
			//  下边检测
			if(num < this._lastRowNum){  
				if(blocks[num + this._col].isBoom()) count++;
			}
			// 左边检测
			if(num % this._col != 0){	
				if(blocks[num - 1].isBoom()) count++;
			}
			// 右边检测
			if(num % this._col != this._lastColNum){  
				if(blocks[num + 1].isBoom()) count++;
			}
			// 左上
			if(num > this._lastColNum && num % this._col != 0){  
				if(blocks[num - this._col - 1].isBoom()) count++;
			}
			// 右上
			if(num > this._lastColNum && num % this._col != this._lastColNum){
				if(blocks[num - this._col + 1].isBoom()) count++;
			}
			// 左下
			if(num < this._lastRowNum && num % this._col != 0){  
				if(blocks[num + this._col - 1].isBoom()) count++;
			}
			// 右下
			if(num < this._lastRowNum && num % this._col != this._lastColNum){
				if(blocks[num + this._col + 1].isBoom()) count++;
			}
			return count;
		},
		// 展现边界
		showBorder: function(self, firstClick) {
			if(reseting || endGame || dislogOpen) return;
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
					if(!(num_next < 0) && !blocks[num_next].isOpen())
						surroundArray.push(blocks[num_next]);
				}
				// 下边检测
				if(num < this._lastRowNum){  
					num_next = num + this._col;
					if(!(num_next > blocks.length) && !blocks[num_next].isOpen())
						surroundArray.push(blocks[num_next]);
				}
				// 左边检测
				if(num % this._col != 0){	
					num_next = num - 1;
					if(!(num_next < 0) && !blocks[num_next].isOpen())
						surroundArray.push(blocks[num_next]);
				}
				// 右边检测
				if(num % this._col != this._lastColNum){  
					num_next = num + 1;
					if(!(num_next > blocks.length) && !blocks[num_next].isOpen())
						surroundArray.push(blocks[num_next]);
				}
				// 左上
				if(num > this._lastColNum && num % this._col != 0){  
					num_next = num - this._col - 1;
					if(!(num_next < 0) && !blocks[num_next].isOpen() && !blocks[num_next].isBoom())
						surroundArray.push(blocks[num_next]);
				}
				// 左下
				if(num < this._lastRowNum && num % this._col != 0){  
					num_next = num + this._col - 1;
					if(!(num_next > blocks.length) && !blocks[num_next].isOpen() && !blocks[num_next].isBoom())
						surroundArray.push(blocks[num_next]);
				}
				// 右上
				if(num > this._lastColNum && num % this._col != this._lastColNum){
					num_next = num - this._col + 1;
					if(!(num_next < 0) && !blocks[num_next].isOpen() && !blocks[num_next].isBoom())
						surroundArray.push(blocks[num_next]);
				}
				// 右下
				if(num < this._lastRowNum && num % this._col != this._lastColNum){
					num_next = num + this._col + 1;
					if(!(num_next > blocks.length) && !blocks[num_next].isOpen() && !blocks[num_next].isBoom())
						surroundArray.push(blocks[num_next]);
				}
				
				for(let b of surroundArray) {
					this.showBorder(b);
				}
				return ;
			}
		},
		// 计算所有方块周围地雷数
		countBoomNum4AllBlock: function() { 
			for(var i=0; i<blocks.length; i++) {
				blocks[i].setSurroundCount(this.borderChecking(i));
			}
		},
		// 最后一次标记检测
		lastMarkCheck: function() {
			if(lastMark != undefined) { 
				if(boomMap.get(lastMark._id) == undefined 
					&& blocks[lastMark._index]._mark == 1) {
						this.showAllBooms(lastMark);
						lastMark.markError();
						return false;
				}
				--markNum;
			}
			return true;
		},
		// 标记操作并检测
		mark: function(self){
			if(!endGame && !self.isOpen()) {
				if(!this.lastMarkCheck()){
					this.endGame(false);
					return;
				}else {
					lastMark = self;
					self.mark();
					// 游戏获胜结束
					if(markNum == 0) {	
						this.endGame(this.lastMarkCheck());
					}
				}
			}
		},
		// 引爆所有，游戏结束
		showAllBooms: function(self) { 
			
			let prev = self._index;
			let next = self._index;
			let main = this;
			let explodeAnimateId = 0;
			
			let explodeAll = function() {
				if(prev > -1) {
					if(blocks[prev].isBoom()) {
						blocks[prev].click();
					}
					--prev;
				}
				if(next < blocks.length) {
					if(blocks[next].isBoom()) {
						blocks[next].click();
					}
					++next;
				}
				if(prev < 0 && next > blocks.length - 1) {
					window.cancelAnimationFrame(explodeAnimateId);
					// 游戏失败
					main.endGame(false);	
				}else{
					explodeAnimateId = window.requestAnimationFrame(explodeAll);
				}
			}
			
			explodeAll();
			/* for(let b of boomMap) {
				if(b[0] != self._id) {
					b[1].click();
				}
			} */
		},
		// 结束游戏
		endGame: function(isSuccess) {
			endGame = true;
			
			if(isSuccess == true) {
				this._drawDialog('Σ( ° △ °|||)︴成，成功了', '点击画面再试一次？', 500);
				loseCount = 0;
			}else {
				if(loseCount < 3) {
					this._drawDialog('(￣△￣；)游戏结束', '点击画面再试一次？', 500);
				}else {
					this._drawDialog('_(:з」∠)_可以调整难度哦', '点击画面再试一次？', 500);
				}
				loseCount ++;
			}
		},
		// 初始化游戏矩阵
		initBlocks: function() {
			this._cleanCanvas();
			boomMap.clear(); 			// 清空炸弹MAP
			lastMark = undefined;
			this._drawTitleBar();
			// 初始化炸弹数量
			if(boomNum < 1 || boomNum > blocks.length*2/3) {
				markNum = boomNum = this._col * this._line / 4;
			}else {
				markNum = boomNum;
			}
			let rate = canvasWidth / this._col >> 0;
			// 初始化矩阵
			if(blocks.length < 1) {
				let blockSize = this._col * this._line;
				for(let i=0,col=0,line=0; i<blockSize; i++,col++) {
					if(col == this._col) {	
						col = 0;
						line++;
					}
					let b = new Block(i, line * baseIntervalNum + col, col*rate, line*rate + titleBarHeight, rate, rate);
					blocks.push(b);
				}
			}else {
				// 重置已有矩阵
				for(let b of blocks) {	
					b.reset();
				}
			}
			// 添加地雷
			this.addRandomBoom(boomNum);
			// 计算数字
			this.countBoomNum4AllBlock();
			// 绘制
			this._drawBlocks();
		},
		// 重置游戏
		reset: function(num) {
			if(reseting) return;
			if(typeof num == 'string') {
				// 按钮重置游戏
				num = parseInt(num);
				if(typeof num == 'number' && num > 0 && num < blocks.length*3/4) {
					boomNum = num;
				}
			}else{
				// 屏蔽未弹出对话框时重置游戏
				if(!dislogOpen) return;
			}
			reseting = true;
			this._cleanCanvas();
			this.initBlocks();
		},
		// 整体初始化
		init: function() {
			// 初始化canvas
			let canvas = document.getElementById('container');
			canvasWidth = canvas.width = screen.availWidth>canvasWidth? canvasWidth: screen.availWidth - titleBarHeight;
			canvasHeight = canvas.height = screen.availWidth>canvasHeight? canvasHeight: screen.availWidth;
			container = canvas;
			ctx = canvas.getContext("2d");
			ctx.textAlign = 'center';
			
			// 初始化方块矩阵
			this.initBlocks();
			// 监听事件
			this.initInteractiveEvent();
		},
		// 清空画布
		_cleanCanvas: function() {
			//ctx.clearRect(0, 0, container.width, container.height);
			let main = this;
			ctx.fillStyle = color.black;
			ctx.clearRect(0, 0 + titleBarHeight, container.width, container.height);
		},
		// 绘制矩形
		_drawBlocks: function() {
			let index = 0;
			let main = this;
			let blocksAnimateId = 0;
			
			let drawBlocks = function() {
				
				if(index < blocks.length){
					blocks[index].reseting();
					++index;
				}else{
					// 重置游戏相关状态
					for(let b of blocks) b.show();
					endGame = false;
					dislogOpen = false;
					reseting = false;
					window.cancelAnimationFrame(blocksAnimateId);
					return;
				}
				
				blocksAnimateId = window.requestAnimationFrame(drawBlocks);
			}
			
			drawBlocks();
			// for(let b of blocks) b.show();
		},
		// 弹出对话框
		_drawDialog: function(title, content, delayMillis) {
			if(typeof delayMillis != 'number' && delayMillis < 0) delayMillis = 1000;
			
			let main = this;
			let width = container.clientWidth/2;
			let height = container.clientHeight/2 + titleBarHeight/2;
			
			let dialogAnimateId = 0;
			let count = 0;
			let countDown = 20;
			let dialogAnimation = function() {
				if(count < countDown) {
					ctx.fillStyle = 'rgba(235, 235, 235, '+count/countDown+')';
					ctx.fillRect(width/2, height*3/4, width, height/2);
					ctx.strokeStyle = 'rgba(0, 0, 0, '+count/countDown+')';
					ctx.strokeRect(width/2, height*3/4, width, height/2);
					if(count > countDown/20) {
						ctx.fillStyle = 'rgba(0, 0, 0, '+count/countDown+')';
						ctx.font = font.title;
						ctx.fillText(title, width, height);
						ctx.fillText(content, width + 10, height + 30);
					}
					
					++count;
					dialogAnimateId = window.requestAnimationFrame(dialogAnimation);
				}else {
					dislogOpen = true;
					window.cancelAnimationFrame(dialogAnimateId);
				}
			}
			
			setTimeout(() => {
				dialogAnimation();
			}, delayMillis);
			
		},
		_drawTitleBar: function() {
			ctx.fillStyle = color.grey;
			ctx.fillRect(0, 0, container.width, titleBarHeight);
			ctx.fillStyle = color.mid_grey;
			ctx.fillRect(5, 5, container.width - 10, titleBarHeight - 10);
			ctx.strokeStyle = color.black;
			ctx.strokeRect(0, 0, container.width, titleBarHeight);
			
			this._drawFaceArea();
			this._drawTimeArea();
			this._drawBoomArea();
		},
		_drawFaceArea: function() {
			let width = titleBarHeight*3/7;
			let height = width;
			let width_half = width/2;
			
			let x = container.width/2 - width_half;
			let y = titleBarHeight/2 - width_half;
			
			ctx.fillStyle = color.light_grey;
			ctx.fillRect(x, y, width, width);
			
			ctx.fillStyle = color.grey;
			ctx.fillRect(x, y + height*7/8, width, height/8);
			ctx.fillRect(x + height*7/8, y + height/8, width/8, height*7/8);
			
			ctx.fillStyle = color.mid_grey;
			ctx.fillRect(x + width/8, y + height/8, width*3/4, height*3/4);
			
			ctx.fillStyle = color.yellow;
			ctx.beginPath();
			ctx.ellipse(x + width/2, y + width/2, width*3/8, height*3/8, 0, 0, 2*Math.PI);
			ctx.closePath();
			ctx.fill();
			
			ctx.strokeStyle = color.black;
			ctx.strokeRect(x, y, width, height);
		},
		_drawTimeArea: function() {
			let width = container.width/5;
			let height = titleBarHeight*3/5;
			let x = 20;
			let y = titleBarHeight/5;
			
			ctx.fillStyle = color.black;
			ctx.fillRect(x, y, width, height);
		},
		_drawBoomArea: function() {
			let width = container.width/5;
			let height = titleBarHeight*3/5;
			let x = container.width - width - 20;
			let y = titleBarHeight/5;
			
			ctx.fillStyle = color.black;
			ctx.fillRect(x, y, width, height);
		},
		// 初始化事件
		initInteractiveEvent: function() {
			var main = this; 
			document.getElementById('boomNum').value = boomNum;
			// 屏蔽右击事件
			document.oncontextmenu = function(e){return false;}
			// 鼠标事件
			document.addEventListener('mousedown', function(evt) {
				let canvas = document.getElementById('container');
				if(evt.clientX - canvas.offsetLeft > 0 
					&& evt.clientY - canvas.offsetTop - titleBarHeight > 0 
					&& evt.clientX - canvas.offsetLeft < canvas.clientWidth
					&& evt.clientY - canvas.offsetTop - titleBarHeight < canvas.clientHeight ) {
					
					let blockId = ((evt.clientY - canvas.offsetTop - titleBarHeight)/canvasWidth * main._line >> 0) * main._col 
										+ (evt.clientX - canvas.offsetLeft)/canvasWidth * main._col >> 0;
					if(!endGame) {
						if(evt.which == 1) {
							main.showBorder(blocks[blockId], true);
						}
						if(evt.which == 3) {
							main.mark(blocks[blockId]);
						}
						
						if(evt.which == 2) {
							main.showBorder(blocks[blockId], true);
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

