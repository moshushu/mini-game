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
                vine: 0,
                fiber: 0,
                herb: 0,
                mushroom: 0,
                crystal: 0
            },
            tools: []
        };

        // 2. 初始化世界状态
        this.world = {
            year: 1,      // 登岛年数
            month: 1,     // 当月 (1-12)
            day: 1,       // 当日 (1-30)
            isNight: false,
            timeInDay: 6, // 0-24 小时，从早上6点开始
            location: '海滩',
            weather: '晴朗',
            building: null // 当前建筑
        };
        
        // 时间配置：现实1分钟 = 游戏1小时
        this.timeScale = 60000; // 60秒 = 1游戏小时

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
            vine: { name: '藤蔓', icon: '🌿' },
            fiber: { name: '纤维', icon: '🧶' },
            herb: { name: '草药', icon: '☘️', usable: true, effect: { health: 20 } },
            mushroom: { name: '蘑菇', icon: '🍄', usable: true, effect: { hunger: 15, health: 5 } },
            crystal: { name: '水晶', icon: '💎' },
            axe: { name: '石斧', icon: '🪓' },
            pickaxe: { name: '石镐', icon: '⛏️' }
        };

        this.recipes = [
            { id: 'axe', name: '石斧', cost: { wood: 5, stone: 3 }, description: '提升砍树效率' },
            { id: 'pickaxe', name: '石镐', cost: { wood: 3, stone: 5 }, description: '提升采石效率' },
            { id: 'fiber', name: '纤维', cost: { vine: 2 }, description: '从藤蔓中加工获得，2个藤蔓=1个纤维', craftType: 'material' }
        ];

        // 5. 定义建筑蓝图
        this.buildings = [
            {
                id: 'shelter',
                name: '简易庇护所',
                icon: '🏚️',
                cost: { wood: 10, fiber: 5 },
                description: '最基本的遮蔽处，提供少量休息恢复',
                effect: { energyRestore: 5, healthRestore: 2 },
                shelterLevel: 1
            },
            {
                id: 'tent',
                name: '帐篷',
                icon: '⛺',
                cost: { wood: 15, fiber: 10, stone: 5 },
                description: '便携式住所，恢复效果较好',
                effect: { energyRestore: 10, healthRestore: 5 },
                shelterLevel: 2
            },
            {
                id: 'hut',
                name: '木屋',
                icon: '🛖',
                cost: { wood: 30, stone: 15, fiber: 10 },
                description: '坚固的木屋，提供良好的保护和恢复',
                effect: { energyRestore: 15, healthRestore: 8, hungerReduce: 5 },
                shelterLevel: 3
            },
            {
                id: 'cabin',
                name: '山间小屋',
                icon: '🏠',
                cost: { wood: 50, stone: 30, fiber: 20 },
                description: '舒适的小屋，大幅恢复各项状态',
                effect: { energyRestore: 25, healthRestore: 15, hungerReduce: 10, thirstReduce: 10 },
                shelterLevel: 4
            },
            {
                id: 'fortress',
                name: '生存堡垒',
                icon: '🏰',
                cost: { wood: 100, stone: 80, fiber: 40 },
                description: '终极庇护所，提供最佳保护和全面恢复',
                effect: { energyRestore: 40, healthRestore: 25, hungerReduce: 15, thirstReduce: 15 },
                shelterLevel: 5
            }
        ];

        // 4. 绑定 DOM 元素
        this.dom = {
            // 左侧角色面板
            characterAvatar: document.getElementById('character-avatar'),
            characterGenderIcon: document.getElementById('character-gender-icon'),
            characterName: document.getElementById('character-name'),
            characterHp: document.getElementById('character-hp'),
                        gameClock: document.getElementById('game-clock'),
                        timeInfo: document.getElementById('time-info'),
                        lightInfo: document.getElementById('light-info'),
            hungerBarSmall: document.getElementById('hunger-bar-small'),
            thirstBarSmall: document.getElementById('thirst-bar-small'),
            energyBarSmall: document.getElementById('energy-bar-small'),
            // 其他元素
            log: document.getElementById('game-log'),
            inventory: document.getElementById('inventory-grid'),
            inventoryModal: document.getElementById('inventory-modal'),
            sceneIcon: document.getElementById('scene-icon'),
            sceneName: document.getElementById('scene-name'),
            buildingDisplay: document.getElementById('building-display'),
            timeInfo: document.getElementById('time-info'),
            gameClock: document.getElementById('game-clock'),
            exploreModal: document.getElementById('explore-modal'),
            exploreList: document.getElementById('explore-list'),
            craftingModal: document.getElementById('crafting-modal'),
            craftingList: document.getElementById('crafting-list'),
            buildingModal: document.getElementById('building-modal'),
            buildingList: document.getElementById('building-list'),
            currentBuilding: document.getElementById('current-building'),
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

        const genderInputs = document.querySelectorAll('input[name="gender"]');

        // 实时更新角色名称显示，并过滤非法字符
        nameInput.addEventListener('input', () => {
            let name = nameInput.value;
            // 过滤掉标点符号和阿拉伯数字，只保留中文和英文字母
            name = name.replace(/[0-9\p{P}\p{S}]/gu, '');
            // 限制长度为5个字符
            if (name.length > 5) {
                name = name.slice(0, 5);
            }
            nameInput.value = name;
            if (this.dom.characterName) {
                this.dom.characterName.innerText = name || '幸存者';
            }
        });

        // 实时更新性别图标显示
        genderInputs.forEach(input => {
            input.addEventListener('change', () => {
                const gender = document.querySelector('input[name="gender"]:checked').value;
                const avatar = gender === 'female' ? '♀️' : '♂️';
                if (this.dom.characterGenderIcon) {
                    this.dom.characterGenderIcon.innerText = avatar;
                }
            });
        });

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
        
        // 初始化设置菜单
        this.setupSettings();
        
        // 初始化光线和时间显示
        this.updateTimeDisplay();
        this.updateLighting();
    }

    // --- 核心动作逻辑 ---

    // 定义可探索的地点
    getExploreLocations() {
        return [
            {
                id: 'beach',
                name: '海滩',
                icon: '🏝️',
                description: '',
                energyCost: 15,
                hasSubLocations: true,
                subLocations: [
                    {
                        id: 'beach_sand',
                        name: '沙滩',
                        icon: '🏖️',
                        description: '细腻的沙滩，可能有漂流物和海鲜。',
                        resources: ['💧 矿泉水', '🥚 海鸥蛋', '🐟 鱼类'],
                        energyCost: 10
                    },
                    {
                        id: 'beach_coconut',
                        name: '椰树林',
                        icon: '🌴',
                        description: '高大的椰树林，可以采摘椰子和藤蔓。',
                        resources: ['🥥 椰子', '🌿 藤蔓'],
                        energyCost: 10
                    },
                    {
                        id: 'beach_shallow',
                        name: '浅海',
                        icon: '🌊',
                        description: '清澈的海水，可以捕鱼和寻找贝类。',
                        resources: ['🐟 鱼类', '🦪 贝类', '💧 淡水'],
                        energyCost: 12
                    }
                ]
            },
            {
                id: 'forest',
                name: '森林',
                icon: '🌲',
                description: '',
                energyCost: 15,
                hasSubLocations: true,
                subLocations: [
                    {
                        id: 'forest_edge',
                        name: '森林边缘',
                        icon: '🌳',
                        description: '森林的外围区域，相对安全。',
                        resources: ['🍒 浆果', '🌿 藤蔓'],
                        energyCost: 10
                    },
                    {
                        id: 'forest_deep',
                        name: '森林深处',
                        icon: '🌲',
                        description: '森林的核心地带，资源丰富但危险。',
                        energyCost: 15,
                        hasSubLocations: true,
                        subLocations: [
                            {
                                id: 'forest_lake',
                                name: '淡水湖泊',
                                icon: '🏞️',
                                description: '森林深处的清澈湖泊，是获取淡水的好地方。',
                                resources: ['💧 淡水', '🐟 鱼类', '🌿 藤蔓'],
                                energyCost: 12
                            },
                            {
                                id: 'forest_cave',
                                name: '山洞',
                                icon: '🕳️',
                                description: '阴暗潮湿的山洞，可能藏有珍贵资源。',
                                resources: ['🪨 石头', '💎 水晶', '🍄 蘑菇', '☘️ 草药'],
                                energyCost: 18
                            }
                        ]
                    }
                ]
            }
        ];
    }

    explore() {
        // 显示探索选择界面
        this.showExploreUI();
        this.dom.exploreModal.classList.remove('hidden');
    }

    showExploreUI(parentLocation = null) {
        if (!this.dom.exploreList) return;
        
        this.dom.exploreList.innerHTML = '';
        
        // 如果有父地点，显示子地点；否则显示主地点列表
        let locations;
        let isSubLocation = false;
        
        // 设置列表样式：主页面横向，子页面纵向
        if (parentLocation && parentLocation.subLocations) {
            locations = parentLocation.subLocations;
            isSubLocation = true;
            this.dom.exploreList.classList.remove('main-level');
            
            // 添加返回按钮
            const backItem = document.createElement('div');
            backItem.className = 'explore-location-item back-btn';
            backItem.innerHTML = `
                <span class="explore-location-icon">⬅️</span>
                <div class="explore-location-info">
                    <div class="explore-location-name">返回</div>
                    <div class="explore-location-desc">回到地点选择</div>
                </div>
            `;
            backItem.onclick = () => this.showExploreUI();
            this.dom.exploreList.appendChild(backItem);
        } else {
            locations = this.getExploreLocations();
            this.dom.exploreList.classList.add('main-level');
        }
        
        locations.forEach(loc => {
            const item = document.createElement('div');
            item.className = 'explore-location-item';
            
            const resourcesHtml = loc.resources ? loc.resources.map(r => `<span class="resource-tag">${r}</span>`).join('') : '';
            const hasSub = loc.hasSubLocations ? '<span class="sub-location-badge">▶</span>' : '';
            const resourcesSection = resourcesHtml ? `<div class="explore-location-resources">${resourcesHtml}</div>` : '';
            
            item.innerHTML = `
                <span class="explore-location-icon">${loc.icon}</span>
                <div class="explore-location-info">
                    <div class="explore-location-name">${loc.name} ${hasSub}</div>
                    <div class="explore-location-desc">${loc.description}</div>
                    ${resourcesSection}
                </div>
            `;
            
            item.onclick = () => {
                if (loc.hasSubLocations) {
                    // 有子地点，显示子地点列表
                    this.showExploreUI(loc);
                } else {
                    // 没有子地点，直接前往
                    this.travelTo(loc, isSubLocation ? parentLocation : null);
                }
            };
            this.dom.exploreList.appendChild(item);
        });
    }

    hideExplore() {
        this.dom.exploreModal.classList.add('hidden');
    }

    // 初始化设置菜单
    setupSettings() {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsMenu = document.getElementById('settings-menu');
        const pauseBtn = document.getElementById('pause-menu-btn');
        const saveBtn = document.getElementById('save-game-btn');
        const newGameBtn = document.getElementById('new-game-btn');
        const exportBtn = document.getElementById('export-save-btn');
        const importBtn = document.getElementById('import-save-btn');
        
        if (!settingsBtn) return;
        
        // 切换菜单显隐
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsMenu.classList.toggle('hidden');
        });
        
        // 点击其他地方关闭菜单
        document.addEventListener('click', () => {
            settingsMenu.classList.add('hidden');
        });
        
        settingsMenu.addEventListener('click', (e) => e.stopPropagation());
        
        // 暂停/继续游戏
        pauseBtn.addEventListener('click', () => {
            this.togglePause();
            pauseBtn.textContent = this.isPaused ? '▶️ 继续游戏' : '⏸️ 暂停游戏';
            settingsMenu.classList.add('hidden');
        });
        
        // 保存游戏
        saveBtn.addEventListener('click', () => {
            this.saveGame();
            this.log('💾 游戏已手动保存。', 'event');
            settingsMenu.classList.add('hidden');
        });
        
        // 新游戏
        newGameBtn.addEventListener('click', () => {
            settingsMenu.classList.add('hidden');
            const confirm = window.confirm('确定要开始新游戏吗？当前进度将丢失。');
            if (confirm) {
                localStorage.removeItem('island_survival_save');
                location.reload();
            }
        });
        
        // 导出存档
        exportBtn.addEventListener('click', () => {
            const saveData = localStorage.getItem('island_survival_save');
            if (!saveData) {
                this.log('没有找到存档数据。', 'danger');
                settingsMenu.classList.add('hidden');
                return;
            }
            const blob = new Blob([saveData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `龙骨岛_存档_${this.character.name || '幸存者'}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.log('📤 存档已导出。', 'event');
            settingsMenu.classList.add('hidden');
        });
        
        // 导入存档
        importBtn.addEventListener('click', () => {
            settingsMenu.classList.add('hidden');
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        localStorage.setItem('island_survival_save', JSON.stringify(data));
                        this.log('📥 存档导入成功，重新加载中…', 'event');
                        setTimeout(() => location.reload(), 1000);
                    } catch (err) {
                        this.log('存档文件无效，请检查文件格式。', 'danger');
                    }
                };
                reader.readAsText(file);
            });
            input.click();
        });
    }

    travelTo(location, parentLocation = null) {
        if (!this.checkAction(location.energyCost || 15)) return;
        
        this.hideExplore();
        
        // 更新当前地点（显示父地点或当前地点）
        const displayLocation = parentLocation || location;
        this.world.location = displayLocation.name;
        this.dom.sceneIcon.innerText = displayLocation.icon;
        this.dom.sceneName.innerText = displayLocation.name;
        
        const subLocName = parentLocation ? ` - ${location.name}` : '';
        this.log(`你来到了 [${displayLocation.name}${subLocName}]。`, 'event');
        
        // 地点专属探索奖励
        let lootMsg = '';
        
        // 沙滩专属奖励
        if (location.id === 'beach_sand') {
            const beachRoll = Math.random();
            if (beachRoll > 0.7) {
                this.player.inventory.bottled_water += 2;
                lootMsg = '你在沙滩上发现了被冲上岸的矿泉水！';
            } else if (beachRoll > 0.4) {
                this.player.inventory.egg += 2;
                lootMsg = '你在沙滩的礁石边发现了海鸥蛋。';
            } else if (beachRoll > 0.2) {
                this.player.inventory.fish += 3;
                lootMsg = '你在浅水区用树枝插到了几条鱼。';
            } else {
                lootMsg = '你在沙滩上搜寻了一番，但什么也没找到。';
            }
        } 
        // 椰树林专属奖励
        else if (location.id === 'beach_coconut') {
            const coconutRoll = Math.random();
            if (coconutRoll > 0.6) {
                this.player.inventory.coconut += 3;
                this.player.inventory.vine += 2;
                lootMsg = '你在椰树林中采摘了多个椰子，还采集了一些藤蔓！';
            } else if (coconutRoll > 0.3) {
                this.player.inventory.coconut += 2;
                lootMsg = '你爬上了椰子树，摘下了几个新鲜的椰子。';
            } else {
                this.player.inventory.vine += 3;
                lootMsg = '你在椰树林中采集了一些坚韧的藤蔓。';
            }
        }
        // 浅海专属奖励
        else if (location.id === 'beach_shallow') {
            const shallowRoll = Math.random();
            if (shallowRoll > 0.7) {
                this.player.inventory.fish += 5;
                this.player.inventory.bottled_water += 1;
                lootMsg = '你在浅海区域捕到了很多鱼，还接满了一瓶淡水！';
            } else if (shallowRoll > 0.4) {
                this.player.inventory.fish += 3;
                lootMsg = '你用自制的鱼叉在浅水区插到了几条大鱼。';
            } else if (shallowRoll > 0.2) {
                this.player.inventory.bottled_water += 2;
                lootMsg = '你在礁石缝隙中找到了一些淡水。';
            } else {
                lootMsg = '你在浅海搜寻了很久，但收获不多。';
            }
        }
        // 森林边缘奖励
        else if (location.id === 'forest_edge') {
            const edgeRoll = Math.random();
            if (edgeRoll > 0.6) {
                this.player.inventory.berries += 4;
                this.player.inventory.vine += 2;
                lootMsg = '你在森林边缘发现了一些浆果和藤蔓。';
            } else if (edgeRoll > 0.3) {
                this.player.inventory.vine += 4;
                lootMsg = '你在森林边缘采集了不少藤蔓。';
            } else {
                this.player.inventory.berries += 2;
                lootMsg = '你采集了一些森林边缘的野生浆果。';
            }
        }
        // 淡水湖泊奖励
        else if (location.id === 'forest_lake') {
            const lakeRoll = Math.random();
            if (lakeRoll > 0.7) {
                this.player.inventory.bottled_water += 3;
                this.player.inventory.fish += 4;
                this.player.inventory.vine += 2;
                lootMsg = '你在湖泊边收获颇丰：接满了淡水，还捕到了很多鱼！';
            } else if (lakeRoll > 0.4) {
                this.player.inventory.bottled_water += 2;
                this.player.inventory.fish += 2;
                lootMsg = '你在湖边接了一些淡水，还捕到了几条鱼。';
            } else if (lakeRoll > 0.2) {
                this.player.inventory.bottled_water += 2;
                lootMsg = '你在湖边找到了清澈的淡水。';
            } else {
                this.player.inventory.vine += 3;
                lootMsg = '你在湖边采集了一些湖边的藤蔓。';
            }
        }
        // 山洞奖励
        else if (location.id === 'forest_cave') {
            const caveRoll = Math.random();
            if (caveRoll > 0.8) {
                this.player.inventory.stone += 8;
                this.player.inventory.herb += 2;
                this.player.inventory.mushroom += 3;
                lootMsg = '你在山洞深处发现了稀有水晶、珍贵草药和大量蘑菇！';
            } else if (caveRoll > 0.55) {
                this.player.inventory.stone += 5;
                this.player.inventory.herb += 1;
                lootMsg = '你在山洞中找到了一些石头和草药。';
            } else if (caveRoll > 0.3) {
                this.player.inventory.mushroom += 4;
                this.player.inventory.stone += 3;
                lootMsg = '山洞潮湿的环境长满了蘑菇，你还捡到了一些石头。';
            } else if (caveRoll > 0.15) {
                this.player.inventory.herb += 1;
                lootMsg = '你在山洞缝隙中发现了一株草药。';
            } else {
                lootMsg = '山洞里阴暗潮湿，你小心翼翼地搜索但没有收获。';
            }
        }
        // 森林奖励（兼容旧版本）
        else if (location.id === 'forest') {
            const forestRoll = Math.random();
            if (forestRoll > 0.7) {
                this.player.inventory.berries += 5;
                this.player.inventory.vine += 3;
                lootMsg = '你在森林深处发现了一片浆果丛，还采集了不少藤蔓！';
            } else if (forestRoll > 0.4) {
                this.player.inventory.vine += 5;
                lootMsg = '你在密林中找到了大量坚韧的藤蔓。';
            } else if (forestRoll > 0.2) {
                this.player.inventory.wood += 8;
                lootMsg = '你发现了一些干燥的枯木，很容易就能带走。';
            } else {
                lootMsg = '森林里很安静，你没有找到什么特别的资源。';
            }
        }
        
        if (lootMsg) this.log(lootMsg, 'event');
        
        this.advanceTime(2);
        this.consumeResources(8, 8, location.energyCost || 15);
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
            // 饱食高时缓慢恢复血量
            this.player.health = Math.min(100, this.player.health + 2);
        }
    }

    advanceTime(hours) {
        this.world.timeInDay += hours;
        
        // 触发随机事件
        if (Math.random() < 0.1 * hours) {
            this.triggerRandomEvent();
        }

        // 处理天数、月份、年份进位
        while (this.world.timeInDay >= 24) {
            this.world.timeInDay -= 24;
            this.world.day++;
            
            // 每月30天
            if (this.world.day > 30) {
                this.world.day = 1;
                this.world.month++;
                
                // 每年12个月
                if (this.world.month > 12) {
                    this.world.month = 1;
                    this.world.year++;
                    this.log(`=== 登岛第 ${this.world.year} 年了！===`, 'event');
                } else {
                    this.log(`--- 第 ${this.world.month} 个月开始了 ---`, 'event');
                }
            } else {
                this.log(`--- 第 ${this.world.day} 天开始了 ---`, 'event');
            }
        }
        
        this.world.isNight = (this.world.timeInDay >= 18 || this.world.timeInDay < 6);
        
        // 更新时间显示
        this.updateTimeDisplay();
        
        // 更新光线效果
        this.updateLighting();
    }
    
    // 更新时间和日期显示
    updateTimeDisplay() {
        const hour = Math.floor(this.world.timeInDay);
        const minute = Math.floor((this.world.timeInDay - hour) * 60);
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        if (this.dom.timeInfo) {
            this.dom.timeInfo.innerText = `第${this.world.year}年 ${this.world.month}月${this.world.day}日`;
        }
        
        // 时段和时间合并到 lightInfo
        if (this.dom.lightInfo) {
            const currentText = this.dom.lightInfo.innerText;
            const lightName = currentText.split(' ')[0] || '黎明';
            this.dom.lightInfo.innerText = `${lightName} ${timeStr}`;
        }
    }
    
    // 根据时间更新光线效果
    updateLighting() {
        const hour = this.world.timeInDay;
        let lightClass = '';
        let lightDescription = '';
        
        if (hour >= 5 && hour < 8) {
            // 05:00-07:59 光线渐亮
            lightClass = 'dawn';
            lightDescription = '黎明';
        } else if (hour >= 8 && hour < 12) {
            // 08:00-11:59 光线充足
            lightClass = 'morning';
            lightDescription = '上午';
        } else if (hour >= 12 && hour < 14) {
            // 12:00-13:59 光照最强
            lightClass = 'noon';
            lightDescription = '正午';
        } else if (hour >= 14 && hour < 18) {
            // 14:00-17:59 光线稍弱
            lightClass = 'afternoon';
            lightDescription = '下午';
        } else if (hour >= 18 && hour < 20) {
            // 18:00-19:59 光线昏黄
            lightClass = 'dusk';
            lightDescription = '黄昏';
        } else {
            // 20:00-04:59 光线昏暗
            lightClass = 'night';
            lightDescription = '夜晚';
        }
        
        // 应用光线类到body
        document.body.className = lightClass;
        
        // 更新光线描述显示（合并时间）
        if (this.dom.lightInfo) {
            const hour2 = Math.floor(this.world.timeInDay);
            const minute2 = Math.floor((this.world.timeInDay - hour2) * 60);
            const timeStr2 = `${hour2.toString().padStart(2, '0')}:${minute2.toString().padStart(2, '0')}`;
            this.dom.lightInfo.innerText = `${lightDescription} ${timeStr2}`;
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
            }
            // {
            //     name: '漂流箱',
            //     msg: '海边飘来了一个神秘的箱子...',
            //     condition: () => this.world.location === '海滩',
            //     action: () => {
            //         this.showTreasureBox();
            //     },
            //     type: 'event'
            // }
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
            
            // 从屏幕上方随机位置开始（更广泛的区域）
            const startX = Math.random() * 60 + 40; // 40-100% 屏幕宽度（右侧到中间）
            const startY = Math.random() * 40; // 0-40% 屏幕高度（上方）
            
            meteor.style.left = `${startX}%`;
            meteor.style.top = `${startY}%`;
            
            // 随机大小和速度
            const scale = Math.random() * 0.5 + 0.8; // 0.8-1.3
            const duration = Math.random() * 0.6 + 1.0; // 1.0-1.6秒
            const delay = Math.random() * 0.3; // 0-0.3秒随机延迟
            
            // 随机角度（25-50度）和距离
            const angle = Math.random() * 25 + 25; // 25-50度
            const distanceX = -(Math.random() * 200 + 350); // -350 到 -550px
            const distanceY = Math.random() * 200 + 350; // 350 到 550px
            
            meteor.style.setProperty('--scale', scale);
            meteor.style.setProperty('--duration', `${duration}s`);
            meteor.style.setProperty('--delay', `${delay}s`);
            meteor.style.setProperty('--angle', `${angle}deg`);
            meteor.style.setProperty('--distance-x', `${distanceX}px`);
            meteor.style.setProperty('--distance-y', `${distanceY}px`);
            
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
                const statNames = { hunger: '饱食', thirst: '水分', energy: '精力', health: '血量' };
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
        // 更新左侧角色面板
        if (this.dom.characterAvatar && this.dom.characterName) {
            // 更新头像（根据性别）
            const avatar = this.character.gender === 'female' ? '♀️' : '♂️';
            this.dom.characterAvatar.innerText = avatar;
            // 更新性别图标
            if (this.dom.characterGenderIcon) {
                this.dom.characterGenderIcon.innerText = avatar;
            }
            // 更新角色名称
            this.dom.characterName.innerText = this.character.name || '幸存者';
        }
        
        // 更新角色名右侧的血量显示
        if (this.dom.characterHp) {
            this.dom.characterHp.textContent = `❤️ ${Math.floor(this.player.health)}/100`;
        }
        if (this.dom.hungerBarSmall) {
            this.dom.hungerBarSmall.style.width = `${this.player.hunger}%`;
            this.dom.hungerBarSmall.parentElement.nextElementSibling.textContent = `饱食 ${Math.floor(this.player.hunger)}%`;
        }
        if (this.dom.thirstBarSmall) {
            this.dom.thirstBarSmall.style.width = `${this.player.thirst}%`;
            this.dom.thirstBarSmall.parentElement.nextElementSibling.textContent = `水分 ${Math.floor(this.player.thirst)}%`;
        }
        if (this.dom.energyBarSmall) {
            this.dom.energyBarSmall.style.width = `${this.player.energy}%`;
            this.dom.energyBarSmall.parentElement.nextElementSibling.textContent = `精力 ${Math.floor(this.player.energy)}%`;
        }

        // 更新背包
        this.updateInventoryUI();
        
        // 更新建筑显示
        if (this.dom.buildingDisplay) {
            if (this.world.building) {
                const building = this.buildings.find(b => b.id === this.world.building);
                this.dom.buildingDisplay.innerText = `${building.icon} ${building.name}`;
                this.dom.buildingDisplay.style.display = 'block';
            } else {
                this.dom.buildingDisplay.style.display = 'none';
            }
        }
        
    }

    updateInventoryUI() {
        if (!this.dom.inventory) return;
        if (!this.player || !this.player.inventory) return;
        
        this.dom.inventory.innerHTML = '';
        
        // 显示资源物品
        for (const [key, count] of Object.entries(this.player.inventory)) {
            if (count > 0) {
                const item = this.items[key];
                const slot = document.createElement('div');
                slot.className = `item-slot ${item.usable ? 'usable' : ''}`;
                
                let tooltip = item.name;
                if (item.usable) {
                    tooltip += ' (点击使用)';
                    slot.onclick = () => {
                        this.useItem(key);
                        this.updateInventoryUI(); // 使用后刷新背包显示
                    };
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
        
        // 显示工具
        this.player.tools.forEach(toolId => {
            const item = this.items[toolId];
            const slot = document.createElement('div');
            slot.className = 'item-slot tool';
            slot.innerHTML = `
                <span class="item-icon">${item.icon}</span>
                <span class="item-name">${item.name}</span>
            `;
            slot.title = item.name;
            this.dom.inventory.appendChild(slot);
        });
        
        // 如果背包为空，显示提示
        if (this.dom.inventory.innerHTML === '') {
            this.dom.inventory.innerHTML = '<div class="empty-inventory">背包是空的</div>';
        }
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
            
            // 工具类：检查是否已拥有；材料类：不限制制作次数
            const isMaterial = recipe.craftType === 'material';
            if (!isMaterial && this.hasTool(recipe.id)) canCraft = false;

            item.innerHTML = `
                <div class="craft-info">
                    <strong>${recipe.name}</strong><br>
                    <span class="craft-cost">消耗: ${costs.join(', ')}</span><br>
                    <span class="craft-desc">${recipe.description}</span>
                </div>
                <button ${canCraft ? '' : 'disabled'} onclick="game.craft('${recipe.id}')">
                    ${!isMaterial && this.hasTool(recipe.id) ? '已拥有' : '制作'}
                </button>
            `;
            this.dom.craftingList.appendChild(item);
        });
        this.dom.craftingModal.classList.remove('hidden');
    }

    hideCrafting() {
        this.dom.craftingModal.classList.add('hidden');
    }

    // --- 建造系统 ---

    showBuilding() {
        this.updateBuildingUI();
        this.dom.buildingModal.classList.remove('hidden');
    }

    hideBuilding() {
        this.dom.buildingModal.classList.add('hidden');
    }

    updateBuildingUI() {
        if (!this.dom.buildingList || !this.player) return;

        // 显示当前建筑
        if (this.dom.currentBuilding) {
            if (this.world.building) {
                const building = this.buildings.find(b => b.id === this.world.building);
                this.dom.currentBuilding.innerHTML = `
                    <div class="current-building-info">
                        <span class="current-building-icon">${building.icon}</span>
                        <div>
                            <div class="current-building-name">当前营地：${building.name}</div>
                            <div class="current-building-effect">${this.getBuildingEffectText(building)}</div>
                        </div>
                    </div>
                `;
                this.dom.currentBuilding.classList.remove('empty');
            } else {
                this.dom.currentBuilding.innerHTML = '<div class="empty">暂无营地 - 露宿野外</div>';
                this.dom.currentBuilding.classList.add('empty');
            }
        }

        // 显示建筑列表
        this.dom.buildingList.innerHTML = '';
        const currentLevel = this.world.building ? 
            this.buildings.find(b => b.id === this.world.building)?.shelterLevel || 0 : 0;

        this.buildings.forEach(building => {
            const item = document.createElement('div');
            item.className = 'building-item';
            
            // 检查是否已建造
            if (this.world.building === building.id) {
                item.classList.add('current');
            }
            // 检查是否满足前置条件（需要比当前建筑更高级）
            else if (building.shelterLevel <= currentLevel) {
                item.classList.add('locked');
            }

            // 检查材料是否足够
            let canBuild = true;
            let costsHtml = '';
            for (const [res, count] of Object.entries(building.cost)) {
                const hasEnough = this.player.inventory[res] >= count;
                if (!hasEnough) canBuild = false;
                costsHtml += `
                    <span class="cost-item ${hasEnough ? 'has-enough' : 'not-enough'}">
                        ${this.items[res].icon} ${this.player.inventory[res]}/${count}
                    </span>
                `;
            }

            // 检查是否满足建造条件
            const isCurrent = this.world.building === building.id;
            const isUpgrade = building.shelterLevel > currentLevel;

            item.innerHTML = `
                <span class="building-icon">${building.icon}</span>
                <div class="building-info">
                    <div class="building-name">${building.name}</div>
                    <div class="building-description">${building.description}</div>
                    <div class="building-cost">${costsHtml}</div>
                    <div class="building-effect-preview">${this.getBuildingEffectText(building)}</div>
                </div>
                <button 
                    ${(!canBuild || isCurrent || !isUpgrade) ? 'disabled' : ''} 
                    onclick="game.build('${building.id}')"
                >
                    ${isCurrent ? '已建造' : (building.shelterLevel <= currentLevel ? '已过时' : '建造')}
                </button>
            `;
            this.dom.buildingList.appendChild(item);
        });
    }

    getBuildingEffectText(building) {
        const effects = [];
        if (building.effect.energyRestore) effects.push(`精力+${building.effect.energyRestore}`);
        if (building.effect.healthRestore) effects.push(`生命+${building.effect.healthRestore}`);
        if (building.effect.hungerReduce) effects.push(`饱食-${building.effect.hungerReduce}`);
        if (building.effect.thirstReduce) effects.push(`水分-${building.effect.thirstReduce}`);
        return effects.join(' | ') || '无特殊效果';
    }

    build(buildingId) {
        const building = this.buildings.find(b => b.id === buildingId);
        if (!building) return;

        // 检查材料
        for (const [res, count] of Object.entries(building.cost)) {
            if (this.player.inventory[res] < count) {
                this.log(`材料不足，无法建造 ${building.name}！`, 'danger');
                return;
            }
        }

        // 扣除材料
        for (const [res, count] of Object.entries(building.cost)) {
            this.player.inventory[res] -= count;
        }

        // 设置当前建筑
        this.world.building = buildingId;

        this.log(`成功建造了 ${building.name}！`, 'event');
        this.updateUI();
        this.updateBuildingUI();
        this.saveGame();
    }

    // --- 背包系统 ---

    showInventory() {
        this.updateInventoryUI();
        this.dom.inventoryModal.classList.remove('hidden');
    }

    hideInventory() {
        this.dom.inventoryModal.classList.add('hidden');
    }

    craft(id) {
        const recipe = this.recipes.find(r => r.id === id);
        if (!recipe) return;

        // 扣除资源
        for (const [res, count] of Object.entries(recipe.cost)) {
            this.player.inventory[res] -= count;
        }

        // 根据制作类型处理
        if (recipe.craftType === 'material') {
            // 材料制作：直接添加到背包
            this.player.inventory[id] = (this.player.inventory[id] || 0) + 1;
        } else {
            // 工具制作：添加到工具栏
            this.player.tools.push(id);
        }
        
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
                vine: 0,
                fiber: 0,
                herb: 0,
                mushroom: 0,
                crystal: 0
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
                    vine: 0,
                    fiber: 0,
                    herb: 0,
                    mushroom: 0,
                    crystal: 0
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
