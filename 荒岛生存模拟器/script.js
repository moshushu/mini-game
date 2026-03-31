class Game {
    constructor() {
        // 角色信息
        this.character = {
            name: '',
            gender: 'male'
        };

        // 1. 初始化玩家状态
        this.player = {
            health: 100,
            hunger: 100,
            thirst: 100,
            energy: 100,
            inventory: {
                wood: 0,
                stone: 0,
                berries: 0,
                fish: 0,
                canned_food: 0,
                bottled_water: 0,
                cola: 0,
                coconut: 0,
                egg: 0,
                fiber: 0
            },
            tools: []
        };

        // 2. 初始化世界状态
        this.world = {
            day: 1,
            isNight: false,
            timeInDay: 0, // 0-24 小时
            location: '海滩',
            weather: '晴朗'
        };

        // 3. 定义物品与配方
        this.items = {
            wood: { name: '木头', icon: '🪵' },
            stone: { name: '石头', icon: '🪨' },
            berries: { name: '浆果', icon: '🍒', usable: true, effect: { hunger: 10, thirst: 5 } },
            fish: { name: '生鱼', icon: '🐟', usable: true, effect: { hunger: 15, health: -5 } },
            canned_food: { name: '罐头', icon: '🥫', usable: true, effect: { hunger: 35, thirst: -5 } },
            bottled_water: { name: '矿泉水', icon: '💧', usable: true, effect: { thirst: 30 } },
            cola: { name: '可乐', icon: '🥤', usable: true, effect: { thirst: 20, energy: 15 } },
            coconut: { name: '椰子', icon: '🥥', usable: true, effect: { thirst: 15, hunger: 10 } },
            egg: { name: '鸡蛋', icon: '🥚', usable: true, effect: { hunger: 20, energy: 5 } },
            fiber: { name: '纤维', icon: '🧶' },
            axe: { name: '石斧', icon: '🪓' },
            pickaxe: { name: '石镐', icon: '⛏️' }
        };

        this.recipes = [
            { id: 'axe', name: '石斧', cost: { wood: 5, stone: 3 }, description: '提升砍树效率' },
            { id: 'pickaxe', name: '石镐', cost: { wood: 3, stone: 5 }, description: '提升采石效率' }
        ];

        // 4. 绑定 DOM 元素
        this.dom = {
            health: document.getElementById('health-bar'),
            healthValue: document.getElementById('health-value'),
            hunger: document.getElementById('hunger-bar'),
            hungerValue: document.getElementById('hunger-value'),
            thirst: document.getElementById('thirst-bar'),
            thirstValue: document.getElementById('thirst-value'),
            energy: document.getElementById('energy-bar'),
            energyValue: document.getElementById('energy-value'),
            log: document.getElementById('game-log'),
            inventory: document.getElementById('inventory-grid'),
            sceneIcon: document.getElementById('scene-icon'),
            sceneName: document.getElementById('scene-name'),
            timeInfo: document.getElementById('time-info'),
            gameClock: document.getElementById('game-clock'),
            craftingModal: document.getElementById('crafting-modal'),
            craftingList: document.getElementById('crafting-list'),
            characterCreation: document.getElementById('character-creation'),
            gameContainer: document.getElementById('game-container')
        };

        // 检查是否有存档，如果没有则显示角色创建界面
        this.checkAndShowCharacterCreation();
    }

    // 检查并显示角色创建界面
    checkAndShowCharacterCreation() {
        const saved = localStorage.getItem('island_survival_save');
        if (saved) {
            // 有存档，先加载数据，再初始化游戏
            this.loadGame();
            // 确保角色创建界面隐藏，游戏界面显示
            this.dom.characterCreation.classList.add('hidden');
            this.dom.gameContainer.classList.remove('hidden');
            this.init();
        } else {
            // 没有存档，显示角色创建界面
            this.setupCharacterCreation();
        }
    }

    // 设置角色创建界面
    setupCharacterCreation() {
        const startBtn = document.getElementById('start-game-btn');
        const nameInput = document.getElementById('player-name');

        startBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (!name) {
                alert('请输入角色名称！');
                return;
            }

            const gender = document.querySelector('input[name="gender"]:checked').value;
            
            this.character.name = name;
            this.character.gender = gender;

            // 隐藏角色创建界面，显示游戏界面
            this.dom.characterCreation.classList.add('hidden');
            this.dom.gameContainer.classList.remove('hidden');

            // 初始化游戏
            this.init();
        });

        // 支持回车键开始游戏
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                startBtn.click();
            }
        });
    }

    init() {
        // 游戏时间配置：5分钟 = 游戏内1天(24小时)
        this.dayDuration = 5 * 60 * 1000; // 5分钟(毫秒)
        this.hourRealTime = this.dayDuration / 24; // 每小时的实际毫秒数 ≈ 12.5秒
        
        // 暂停状态
        this.isPaused = false;
        
        // 清理可能存在的旧定时器
        if (this.gameTimeInterval) {
            clearInterval(this.gameTimeInterval);
        }
        if (this.consumeInterval) {
            clearInterval(this.consumeInterval);
        }
        
        this.updateUI();
        
        // 显示欢迎消息，包含角色名称
        const genderText = this.character.gender === 'male' ? '幸存者' : '幸存者';
        this.log(`欢迎 ${this.character.name}！你作为一名${genderText}来到了荒岛，努力活下去吧。`);
        
        // 启动游戏时间计时器 - 自动推进时间
        this.gameTimeInterval = setInterval(() => {
            if (this.player.health > 0 && !this.isPaused) {
                this.advanceTime(1); // 每小时推进
                this.updateUI(); // 确保UI更新
            }
        }, this.hourRealTime);
        
        // 启动生存消耗计时器 (每小时消耗)
        this.consumeInterval = setInterval(() => {
            if (this.player.health > 0 && !this.isPaused) {
                this.consumeResources(2, 3, 1); // 每小时消耗饥饿、水分、精力
                this.log('😮‍💨 自然消耗：饥饿-2 水分-3 精力-1', 'consume');
                this.updateUI();
                this.saveGame();
            }
        }, this.hourRealTime);
    }

    // --- 核心动作逻辑 ---

    collect(type) {
        if (!this.checkAction(10)) return;

        let amount = 0;
        let msg = '';
        const isDay = !this.world.isNight;

        switch (type) {
            case 'wood':
                amount = this.hasTool('axe') ? 5 : 2;
                this.player.inventory.wood += amount;
                msg = `你费力地砍伐了一些树木，获得了 ${amount} 个木头。`;
                break;
            case 'stone':
                amount = this.hasTool('pickaxe') ? 4 : 1;
                this.player.inventory.stone += amount;
                msg = `你搜寻周围的碎石，获得了 ${amount} 个石头。`;
                break;
            case 'food':
                const foodRoll = Math.random();
                let foodItem = 'berries';
                if (foodRoll > 0.9) {
                    foodItem = 'canned_food';
                    msg = `你在废弃的补给箱里发现了一盒 [罐头]！`;
                } else if (foodRoll > 0.6) {
                    foodItem = 'fish';
                    msg = `你从水里徒手抓到了一条 [生鱼]。虽然不太干净，但能充饥。`;
                } else {
                    foodItem = 'berries';
                    msg = `你采集了一些野生的 [浆果]。`;
                }
                this.player.inventory[foodItem] += 1;
                break;
            case 'water':
                const waterRoll = Math.random();
                let waterItem = 'bottled_water';
                if (waterRoll > 0.8) {
                    waterItem = 'cola';
                    msg = `你在溪流边的废墟中意外发现了一瓶 [可乐]！`;
                } else if (waterRoll > 0.5) {
                    waterItem = 'coconut';
                    msg = `你从树上摘下了一个 [椰子]。`;
                } else {
                    waterItem = 'bottled_water';
                    msg = `你接满了一瓶 [矿泉水]。`;
                }
                this.player.inventory[waterItem] += 1;
                break;
        }

        this.log(msg);
        this.advanceTime(1);
        this.consumeResources(5, 5, 10);
        this.updateUI();
        this.saveGame();
    }

    explore() {
        if (!this.checkAction(20)) return;

        const locations = ['海滩', '森林', '山洞', '山顶'];
        const oldLoc = this.world.location;
        let newLoc = oldLoc;
        while (newLoc === oldLoc) {
            newLoc = locations[Math.floor(Math.random() * locations.length)];
        }

        this.world.location = newLoc;
        const icons = { '海滩': '🏝️', '森林': '🌲', '山洞': '🕳️', '山顶': '🏔️' };
        this.dom.sceneIcon.innerText = icons[newLoc];
        this.dom.sceneName.innerText = newLoc;

        this.log(`你探索了周围，来到了 [${newLoc}]。`, 'event');
        
        // 不同地点产出特定资源
        let lootMsg = '';
        if (newLoc === '海滩') {
            if (Math.random() > 0.4) {
                this.player.inventory.bottled_water += 1;
                lootMsg = '你在沙滩上捡到了一个漂流瓶。';
            }
        } else if (newLoc === '森林') {
            if (Math.random() > 0.4) {
                this.player.inventory.berries += 2;
                lootMsg = '你在密林中发现了一些浆果。';
            }
        } else if (newLoc === '山洞') {
            if (Math.random() > 0.4) {
                this.player.inventory.stone += 3;
                lootMsg = '你在山洞深处找到了不少坚硬的石头。';
            }
        } else if (newLoc === '山顶') {
            if (Math.random() > 0.4) {
                this.player.inventory.fiber += 2;
                lootMsg = '你在山顶采集了一些韧性很强的藤蔓（纤维）。';
            }
        }

        if (lootMsg) this.log(lootMsg);

        this.advanceTime(2);
        this.consumeResources(10, 10, 20);
        this.updateUI();
        this.saveGame();
    }

    rest(type) {
        let hours = type === 'nap' ? 2 : 8;
        let energyGain = type === 'nap' ? 20 : 60;
        
        if (type === 'sleep' && !this.world.isNight) {
            this.log('白天太吵了，你很难睡个好觉。', 'event');
            energyGain = 30;
        }

        this.player.energy = Math.min(100, this.player.energy + energyGain);
        this.log(`你休息了 ${hours} 小时，精力恢复了。`, 'event');
        
        this.advanceTime(hours);
        this.consumeResources(hours * 2, hours * 3, 0);
        this.updateUI();
        this.saveGame();
    }

    // --- 状态管理 ---

    consumeResources(h, t, e) {
        this.player.hunger = Math.max(0, this.player.hunger - h);
        this.player.thirst = Math.max(0, this.player.thirst - t);
        this.player.energy = Math.max(0, this.player.energy - e);

        // 如果饥饿或渴度为0，扣除生命值
        if (this.player.hunger <= 0 || this.player.thirst <= 0) {
            this.player.health = Math.max(0, this.player.health - 5);
            if (this.player.health <= 0) {
                this.gameOver();
            } else {
                this.log('你感到极度虚弱，生命正在流逝！', 'danger');
            }
        } else if (this.player.hunger > 80 && this.player.thirst > 80 && this.player.health < 100) {
            // 饱食度高时缓慢恢复生命
            this.player.health = Math.min(100, this.player.health + 2);
        }
    }

    advanceTime(hours) {
        this.world.timeInDay += hours;
        
        // 触发随机事件
        if (Math.random() < 0.1 * hours) {
            this.triggerRandomEvent();
        }

        if (this.world.timeInDay >= 24) {
            this.world.timeInDay -= 24;
            this.world.day++;
            this.log(`--- 第 ${this.world.day} 天开始了 ---`, 'event');
        }
        
        this.world.isNight = (this.world.timeInDay >= 18 || this.world.timeInDay < 6);
        this.dom.timeInfo.innerText = `第 ${this.world.day} 天 | ${this.world.isNight ? '夜晚' : '白天'}`;
        
        // 更新时钟显示
        const hour = Math.floor(this.world.timeInDay);
        const minute = Math.floor((this.world.timeInDay - hour) * 60);
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        if (this.dom.gameClock) {
            this.dom.gameClock.innerText = timeStr;
        }
    }

    triggerRandomEvent() {
        const events = [
            {
                name: '暴雨',
                msg: '天空突然降下暴雨。你收集了一些雨水。',
                action: () => {
                    this.player.thirst = Math.min(100, this.player.thirst + 30);
                    this.world.weather = '暴雨';
                },
                type: 'event'
            },
            {
                name: '大风',
                msg: '狂风大作，你感到一阵寒意，生命值轻微下降。',
                action: () => {
                    this.player.health = Math.max(0, this.player.health - 5);
                },
                type: 'danger'
            },
            {
                name: '野果丛',
                msg: '你路过一片茂密的野果丛，采集了一些浆果。',
                action: () => {
                    this.player.inventory.berries += 3;
                },
                type: 'event'
            },
            {
                name: '流星',
                msg: '夜晚的流星划过天际。你感到心情舒畅，精力有所恢复。',
                condition: () => this.world.isNight,
                action: () => {
                    this.showMeteorShower();
                },
                type: 'event'
            },
            {
                name: '漂流箱',
                msg: '海边飘来了一个神秘的箱子...',
                condition: () => this.world.location === '海滩',
                action: () => {
                    this.showTreasureBox();
                },
                type: 'event'
            }
        ];

        // 过滤满足条件的事件
        const availableEvents = events.filter(e => !e.condition || e.condition());
        if (availableEvents.length === 0) return;

        const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        this.log(`【事件】${event.msg}`, event.type);
        event.action();
        this.updateUI();
    }

    // 测试流星事件（用于开发测试）
    testMeteorShower() {
        this.log('【测试】触发流星事件...', 'event');
        this.showMeteorShower();
    }

    // 显示宝箱动画
    showTreasureBox() {
        // 创建宝箱容器
        const boxContainer = document.createElement('div');
        boxContainer.className = 'treasure-box-container';
        boxContainer.innerHTML = `
            <div class="treasure-box-wrapper">
                <div class="treasure-box" id="treasure-box">
                    <div class="box-body">📦</div>
                    <div class="box-lid">🎁</div>
                    <div class="box-glow"></div>
                </div>
                <div class="click-hint">点击打开宝箱</div>
            </div>
        `;
        document.body.appendChild(boxContainer);

        // 点击宝箱打开
        const box = boxContainer.querySelector('#treasure-box');
        box.addEventListener('click', () => {
            this.openTreasureBox(boxContainer);
        });
    }

    // 打开宝箱
    openTreasureBox(container) {
        const box = container.querySelector('#treasure-box');
        const hint = container.querySelector('.click-hint');
        
        // 添加打开动画类
        box.classList.add('opened');
        hint.textContent = '';
        
        // 随机奖励
        const rewards = [
            { type: 'canned_food', count: 2, name: '罐头', icon: '🥫' },
            { type: 'bottled_water', count: 2, name: '矿泉水', icon: '💧' },
            { type: 'cola', count: 1, name: '可乐', icon: '🥤' },
            { type: 'coconut', count: 2, name: '椰子', icon: '🥥' },
            { type: 'fish', count: 3, name: '生鱼', icon: '🐟' },
            { type: 'berries', count: 5, name: '浆果', icon: '🍒' }
        ];
        
        // 随机选择2-3个奖励
        const numRewards = Math.floor(Math.random() * 2) + 2;
        const selectedRewards = [];
        const rewardCopy = [...rewards];
        
        for (let i = 0; i < numRewards && rewardCopy.length > 0; i++) {
            const index = Math.floor(Math.random() * rewardCopy.length);
            selectedRewards.push(rewardCopy.splice(index, 1)[0]);
        }
        
        // 显示奖励
        setTimeout(() => {
            // 创建奖励展示区域
            const rewardsContainer = document.createElement('div');
            rewardsContainer.className = 'rewards-container';
            
            let rewardsHtml = '<div class="rewards-title">🎉 获得奖励</div><div class="rewards-list">';
            selectedRewards.forEach(reward => {
                this.player.inventory[reward.type] += reward.count;
                rewardsHtml += `
                    <div class="reward-item">
                        <span class="reward-icon">${reward.icon}</span>
                        <span class="reward-name">${reward.name}</span>
                        <span class="reward-count">x${reward.count}</span>
                    </div>
                `;
            });
            rewardsHtml += '</div><button class="close-rewards-btn">收下奖励</button>';
            
            rewardsContainer.innerHTML = rewardsHtml;
            container.querySelector('.treasure-box-wrapper').appendChild(rewardsContainer);
            
            // 添加收下奖励按钮事件
            rewardsContainer.querySelector('.close-rewards-btn').addEventListener('click', () => {
                container.style.opacity = '0';
                setTimeout(() => {
                    container.remove();
                    this.updateUI();
                    this.saveGame();
                }, 300);
            });
            
            // 记录日志
            const rewardNames = selectedRewards.map(r => `${r.name}x${r.count}`).join('、');
            this.log(`你打开了漂流箱，获得了：${rewardNames}`, 'event');
            
        }, 600);
    }

    // 显示流星动画
    showMeteorShower() {
        // 创建流星容器
        const meteorContainer = document.createElement('div');
        meteorContainer.className = 'meteor-container';
        document.body.appendChild(meteorContainer);

        // 流星数量 - 成群出现
        const meteorCount = Math.floor(Math.random() * 5) + 8; // 8-12颗流星
        let meteorsFallen = 0;

        // 创建流星
        const createMeteor = (index) => {
            const meteor = document.createElement('div');
            meteor.className = 'meteor';
            
            // 从右上角区域开始（屏幕右上1/4区域）
            const startX = Math.random() * 25 + 70; // 70-95% 屏幕宽度（右侧）
            const startY = Math.random() * 25; // 0-25% 屏幕高度（上方）
            
            meteor.style.left = `${startX}%`;
            meteor.style.top = `${startY}%`;
            
            // 随机大小和速度
            const scale = Math.random() * 0.6 + 0.7; // 0.7-1.3
            const duration = Math.random() * 0.8 + 0.8; // 0.8-1.6秒
            const delay = Math.random() * 0.5; // 0-0.5秒随机延迟
            
            meteor.style.setProperty('--scale', scale);
            meteor.style.setProperty('--duration', `${duration}s`);
            meteor.style.setProperty('--delay', `${delay}s`);
            
            meteorContainer.appendChild(meteor);
            
            // 动画结束后移除
            setTimeout(() => {
                meteor.remove();
                meteorsFallen++;
                
                // 所有流星落下后自动恢复精力并关闭
                if (meteorsFallen === meteorCount) {
                    setTimeout(() => {
                        // 自动恢复精力
                        const energyGain = Math.floor(Math.random() * 10) + 15; // 15-25点精力
                        this.player.energy = Math.min(100, this.player.energy + energyGain);
                        
                        // 显示恢复效果
                        this.showMeteorEffect(meteorContainer, energyGain);
                    }, 500);
                }
            }, (duration + delay) * 1000);
        };

        // 快速连续创建流星，形成流星雨效果
        for (let i = 0; i < meteorCount; i++) {
            setTimeout(() => createMeteor(i), i * 150);
        }

        // 记录日志
        this.log('🌠 流星雨划过夜空！你感到精神振奋。', 'event');
    }

    // 显示流星效果
    showMeteorEffect(container, energyGain) {
        // 创建效果文字
        const effect = document.createElement('div');
        effect.className = 'meteor-effect-text';
        effect.innerHTML = `
            <div class="effect-icon">✨</div>
            <div class="effect-value">精力 +${energyGain}</div>
        `;
        container.appendChild(effect);

        // 淡出并移除容器
        setTimeout(() => {
            container.style.opacity = '0';
            setTimeout(() => {
                container.remove();
                this.updateUI();
                this.saveGame();
            }, 500);
        }, 1200);
    }

    checkAction(energyCost) {
        if (this.player.health <= 0) {
            this.log('你已经无法动弹了...', 'danger');
            return false;
        }
        if (this.player.energy < energyCost) {
            this.log('你太累了，需要休息。', 'event');
            return false;
        }
        return true;
    }

    hasTool(toolId) {
        return this.player.tools.includes(toolId);
    }

    useItem(key) {
        const item = this.items[key];
        if (!item || !item.usable || this.player.inventory[key] <= 0) return;

        this.player.inventory[key]--;
        
        let msg = `你使用了 [${item.name}]。`;
        if (item.effect) {
            for (const [stat, value] of Object.entries(item.effect)) {
                this.player[stat] = Math.min(100, this.player[stat] + value);
                const statNames = { hunger: '饥饿度', thirst: '水分', energy: '精力', health: '生命值' };
                const sign = value >= 0 ? '+' : '';
                msg += ` ${statNames[stat]}${sign}${value}`;
            }
        }

        this.log(msg, 'event');
        this.updateUI();
        this.saveGame();
    }

    // --- UI 更新 ---

    updateUI() {
        this.dom.health.style.width = `${this.player.health}%`;
        this.dom.healthValue.innerText = `${Math.ceil(this.player.health)}/100`;
        
        this.dom.hunger.style.width = `${this.player.hunger}%`;
        this.dom.hungerValue.innerText = `${Math.ceil(this.player.hunger)}/100`;
        
        this.dom.thirst.style.width = `${this.player.thirst}%`;
        this.dom.thirstValue.innerText = `${Math.ceil(this.player.thirst)}/100`;
        
        this.dom.energy.style.width = `${this.player.energy}%`;
        this.dom.energyValue.innerText = `${Math.ceil(this.player.energy)}/100`;

        // 更新背包
        this.dom.inventory.innerHTML = '';
        for (const [key, count] of Object.entries(this.player.inventory)) {
            if (count > 0) {
                const item = this.items[key];
                const slot = document.createElement('div');
                slot.className = `item-slot ${item.usable ? 'usable' : ''}`;
                
                let tooltip = item.name;
                if (item.usable) {
                    tooltip += ' (点击使用)';
                    slot.onclick = () => this.useItem(key);
                }
                
                slot.innerHTML = `
                    <span class="item-icon">${item.icon}</span>
                    <span class="item-name">${item.name}</span>
                    <span class="item-count">${count}</span>
                `;
                slot.title = tooltip;
                this.dom.inventory.appendChild(slot);
            }
        }
        
        // 更新工具显示
        this.player.tools.forEach(toolId => {
            const item = this.items[toolId];
            const slot = document.createElement('div');
            slot.className = 'item-slot tool';
            slot.innerHTML = `<span class="item-icon">${item.icon}</span>`;
            slot.title = item.name;
            this.dom.inventory.appendChild(slot);
        });
    }

    log(message, type = '') {
        const li = document.createElement('li');
        if (type) li.className = type;
        const time = `[${Math.floor(this.world.timeInDay)}:00] `;
        li.innerText = time + message;
        this.dom.log.appendChild(li); // 新消息在最下面
        // 自动滚动到最底部
        this.dom.log.parentElement.scrollTop = this.dom.log.parentElement.scrollHeight;
    }

    // --- 制作系统 ---

    showCrafting() {
        this.dom.craftingList.innerHTML = '';
        this.recipes.forEach(recipe => {
            const item = document.createElement('div');
            item.className = 'crafting-item';
            
            let costs = [];
            let canCraft = true;
            for (const [res, count] of Object.entries(recipe.cost)) {
                costs.push(`${this.items[res].icon} x${count}`);
                if (this.player.inventory[res] < count) canCraft = false;
            }
            
            if (this.hasTool(recipe.id)) canCraft = false;

            item.innerHTML = `
                <div class="craft-info">
                    <strong>${recipe.name}</strong><br>
                    <span class="craft-cost">消耗: ${costs.join(', ')}</span>
                </div>
                <button ${canCraft ? '' : 'disabled'} onclick="game.craft('${recipe.id}')">
                    ${this.hasTool(recipe.id) ? '已拥有' : '制作'}
                </button>
            `;
            this.dom.craftingList.appendChild(item);
        });
        this.dom.craftingModal.classList.remove('hidden');
    }

    hideCrafting() {
        this.dom.craftingModal.classList.add('hidden');
    }

    craft(id) {
        const recipe = this.recipes.find(r => r.id === id);
        if (!recipe) return;

        // 扣除资源
        for (const [res, count] of Object.entries(recipe.cost)) {
            this.player.inventory[res] -= count;
        }

        this.player.tools.push(id);
        this.log(`成功制作了 [${recipe.name}]！`, 'event');
        this.updateUI();
        this.hideCrafting();
        this.saveGame();
    }

    // --- 数据持久化 ---

    saveGame() {
        const data = {
            player: this.player,
            world: this.world,
            character: this.character
        };
        localStorage.setItem('island_survival_save', JSON.stringify(data));
    }

    loadGame() {
        try {
            const saved = localStorage.getItem('island_survival_save');
            if (saved) {
                const data = JSON.parse(saved);
                if (data && data.player && data.world) {
                    this.player = { ...this.player, ...data.player };
                    this.world = { ...this.world, ...data.world };
                    if (data.character) {
                        this.character = { ...this.character, ...data.character };
                    }
                }
            }
        } catch (e) {
            console.log('存档加载失败，使用默认设置');
            localStorage.removeItem('island_survival_save');
        }
    }

    gameOver() {
        this.log('💀 你在荒岛上倒下了... 游戏结束。', 'danger');
        
        // 停止游戏定时器
        if (this.gameTimeInterval) {
            clearInterval(this.gameTimeInterval);
            this.gameTimeInterval = null;
        }
        if (this.consumeInterval) {
            clearInterval(this.consumeInterval);
            this.consumeInterval = null;
        }
        
        // 延迟显示确认对话框，让玩家看到死亡消息
        setTimeout(() => {
            if (confirm('游戏结束！是否重新开始？')) {
                // 清除存档
                localStorage.removeItem('island_survival_save');
                
                // 重置所有游戏状态
                this.resetGameState();
                
                // 显示角色创建界面，隐藏游戏界面
                this.dom.gameContainer.classList.add('hidden');
                this.dom.characterCreation.classList.remove('hidden');
                
                // 重置输入框
                const nameInput = document.getElementById('player-name');
                if (nameInput) nameInput.value = '';
                const maleRadio = document.querySelector('input[name="gender"][value="male"]');
                if (maleRadio) maleRadio.checked = true;
                
                // 重新设置角色创建界面事件监听
                this.setupCharacterCreation();
            }
        }, 100);
    }

    // 重置游戏状态的辅助方法
    resetGameState() {
        // 重置玩家状态
        this.player = {
            health: 100,
            hunger: 100,
            thirst: 100,
            energy: 100,
            inventory: {
                wood: 0,
                stone: 0,
                berries: 0,
                fish: 0,
                canned_food: 0,
                bottled_water: 0,
                cola: 0,
                coconut: 0,
                egg: 0,
                fiber: 0
            },
            tools: []
        };
        
        // 重置世界状态
        this.world = {
            day: 1,
            isNight: false,
            timeInDay: 6,
            location: '海滩',
            weather: '晴朗'
        };
        
        // 重置角色信息
        this.character = {
            name: '',
            gender: 'male'
        };
        
        // 重置暂停状态
        this.isPaused = false;
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) pauseBtn.innerText = '⏸️';
        
        // 清空日志
        this.dom.log.innerHTML = '<li>你在一场海难中幸存，漂流到了这座荒岛...</li>';
        
        // 重置场景显示
        this.dom.sceneIcon.innerText = '🏝️';
        this.dom.sceneName.innerText = '海滩';
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('pause-btn');
        if (this.isPaused) {
            btn.innerText = '▶️';
            this.log('⏸️ 游戏已暂停', 'event');
        } else {
            btn.innerText = '⏸️';
            this.log('▶️ 游戏继续', 'event');
        }
    }

    restart() {
        if (confirm('确定要重新开始游戏吗？当前进度将丢失。')) {
            // 清除存档
            localStorage.removeItem('island_survival_save');
            
            // 重置玩家状态
            this.player = {
                health: 100,
                hunger: 100,
                thirst: 100,
                energy: 100,
                inventory: {
                    wood: 0,
                    stone: 0,
                    berries: 0,
                    fish: 0,
                    canned_food: 0,
                    bottled_water: 0,
                    cola: 0,
                    coconut: 0,
                    egg: 0,
                    fiber: 0
                },
                tools: []
            };
            
            // 重置世界状态
            this.world = {
                day: 1,
                isNight: false,
                timeInDay: 6, // 从早上6点开始
                location: '海滩',
                weather: '晴朗'
            };
            
            // 重置角色信息
            this.character = {
                name: '',
                gender: 'male'
            };
            
            // 重置暂停状态
            this.isPaused = false;
            const pauseBtn = document.getElementById('pause-btn');
            if (pauseBtn) pauseBtn.innerText = '⏸️';
            
            // 清空日志
            this.dom.log.innerHTML = '';
            
            // 重置场景显示
            this.dom.sceneIcon.innerText = '🏝️';
            this.dom.sceneName.innerText = '海滩';
            
            // 显示角色创建界面，隐藏游戏界面
            this.dom.gameContainer.classList.add('hidden');
            this.dom.characterCreation.classList.remove('hidden');
            
            // 重置输入框
            document.getElementById('player-name').value = '';
            document.querySelector('input[name="gender"][value="male"]').checked = true;
            
            // 重新设置角色创建界面
            this.setupCharacterCreation();
        }
    }
}

// 启动游戏
const game = new Game();
window.game = game; // 暴露给 HTML 按钮调用
