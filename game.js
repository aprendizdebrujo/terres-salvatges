// ============================================
// LES TERRES SALVATGES - Game.js
// Party System
// ============================================

class Character {
    constructor(name, charClass) {
        this.name = name;
        this.class = charClass;
        this.stats = this.generateStats(charClass);
        this.maxHP = 8 + Math.floor(this.stats.con / 2);
        this.hp = this.maxHP;
        this.level = 1;
        this.experience = 0;
        this.inventory = [];
        this.position = { x: 0, y: 0 };
    }

    generateStats(charClass) {
        const baseStats = {
            str: this.roll3d6(),
            dex: this.roll3d6(),
            con: this.roll3d6(),
            int: this.roll3d6(),
            wis: this.roll3d6(),
            cha: this.roll3d6(),
        };

        const classModifiers = {
            warrior: { str: 2, con: 1 },
            mage: { int: 2, con: -1 },
            rogue: { dex: 2, con: -1 },
            cleric: { wis: 2, str: 1 },
        };

        const mods = classModifiers[charClass] || {};
        for (let stat in mods) {
            baseStats[stat] += mods[stat];
            baseStats[stat] = Math.max(3, Math.min(18, baseStats[stat]));
        }

        return baseStats;
    }

    roll3d6() {
        return Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 3;
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        return this.hp;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHP, this.hp + amount);
        return this.hp;
    }
}

class Game {
    constructor() {
        this.party = [];
        this.maxPartySize = 4;
        this.currentScreen = 'party-creation';
        this.selectedClass = 'warrior';
        this.currentCharIndex = 0;
        this.initializeEventListeners();
        this.updateStatsDisplay();
    }

    initializeEventListeners() {
        console.log('Inicializant event listeners...');
        
        // Selecció de classe
        const classBtns = document.querySelectorAll('.class-btn');
        classBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectClass(e.target.closest('.class-btn'));
            });
        });

        // Input de nom
        const nameInput = document.getElementById('char-name');
        if (nameInput) {
            nameInput.addEventListener('input', () => {
                // Actualitza stats en temps real
            });
        }

        // Botó d'afegir personatge
        const addBtn = document.getElementById('add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addCharacterToParty());
        }

        // Botó de començar
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        // Teclat
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    selectClass(btn) {
        if (!btn) return;
        
        document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedClass = btn.dataset.class;
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        const tempChar = new Character('Temp', this.selectedClass);
        
        document.getElementById('stat-str').textContent = tempChar.stats.str;
        document.getElementById('stat-dex').textContent = tempChar.stats.dex;
        document.getElementById('stat-con').textContent = tempChar.stats.con;
        document.getElementById('stat-int').textContent = tempChar.stats.int;
        document.getElementById('stat-wis').textContent = tempChar.stats.wis;
        document.getElementById('stat-cha').textContent = tempChar.stats.cha;
        
        const hp = 8 + Math.floor(tempChar.stats.con / 2);
        document.getElementById('hp-value').textContent = hp;
    }

    addCharacterToParty() {
        const nameInput = document.getElementById('char-name');
        const name = nameInput.value.trim();

        if (!name) {
            alert('⚠️ Escriu un nom per al personatge!');
            return;
        }

        if (this.party.length >= this.maxPartySize) {
            alert('⚠️ Ja tens 4 personatges!');
            return;
        }

        const newChar = new Character(name, this.selectedClass);
        this.party.push(newChar);

        console.log(`Personatge afegit: ${name} (${this.selectedClass})`);
        console.log(`Party size: ${this.party.length}/${this.maxPartySize}`);

        // Neteja el formulari
        nameInput.value = '';
        this.selectedClass = 'warrior';
        document.querySelector('.class-btn.active').classList.remove('active');
        document.querySelector('[data-class="warrior"]').classList.add('active');
        this.updateStatsDisplay();

        // Actualitza la visualització
        this.updatePartyPreview();
        this.updateProgressBar();

        // Habilita botó start si tenim almenys 1 personatge
        const startBtn = document.getElementById('start-btn');
        if (this.party.length >= 1) {
            startBtn.disabled = false;
        }
    }

    updatePartyPreview() {
        const partyList = document.getElementById('party-list');
        partyList.innerHTML = '';

        this.party.forEach((char, index) => {
            const item = document.createElement('div');
            item.className = 'party-member-item';
            item.innerHTML = `
                <div class="party-member-name">${index + 1}. ${char.name}</div>
                <div class="party-member-class">${this.getClassName(char.class)}</div>
                <div class="party-member-hp">❤️ ${char.hp}/${char.maxHP}</div>
            `;
            partyList.appendChild(item);
        });
    }

    updateProgressBar() {
        const progress = (this.party.length / this.maxPartySize) * 100;
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        if (progressFill) {
            progressFill.style.width = progress + '%';
        }

        if (progressText) {
            progressText.textContent = `Personatge ${this.party.length} de ${this.maxPartySize}`;
        }
    }

    getClassName(classId) {
        const names = {
            warrior: 'Guerrer',
            mage: 'Mag',
            rogue: 'Lladre',
            cleric: 'Clergue',
        };
        return names[classId] || 'Aventurer';
    }

    startGame() {
        if (this.party.length === 0) {
            alert('Necessites almenys 1 personatge!');
            return;
        }

        console.log('Iniciant joc amb party:', this.party);
        this.showMainGame();
        this.initializeGameWorld();
        this.updatePartyPanel();
    }

    showMainGame() {
        const creationScreen = document.getElementById('party-creation-screen');
        const gameScreen = document.getElementById('main-game-screen');

        if (creationScreen) creationScreen.classList.remove('active');
        if (gameScreen) gameScreen.classList.add('active');

        this.currentScreen = 'main-game';
    }

    updatePartyPanel() {
        const partyMembers = document.getElementById('party-members');
        partyMembers.innerHTML = '';

        this.party.forEach((char, index) => {
            const card = document.createElement('div');
            card.className = 'party-member-card';
            card.innerHTML = `
                <div class="char-portrait">
                    <div class="portrait-sprite ${char.class}"></div>
                </div>
                <div class="char-info">
                    <div class="char-name">${char.name}</div>
                    <div class="char-class">${this.getClassName(char.class)}</div>
                    <div class="hp-bar">
                        <div class="hp-bar-fill" style="width: ${(char.hp / char.maxHP) * 100}%"></div>
                    </div>
                    <div class="hp-text">${char.hp}/${char.maxHP}</div>
                </div>
            `;
            partyMembers.appendChild(card);
        });
    }

    initializeGameWorld() {
        const gameWorld = document.getElementById('game-world');
        if (!gameWorld) return;

        const leader = this.party[0];
        gameWorld.innerHTML = `
            <div class="game-view">
                <div class="world-message">
                    <h2>🌊 Aigüesbraves</h2>
                    <p>Benvingut al poble!</p>
                    <p style="margin-top: 10px; font-size: 0.9rem; color: #95a5a6;">
                        Liderat per: ${leader.name}
                    </p>
                    <p style="font-size: 0.85rem; color: #7f8c8d; margin-top: 10px;">
                        (Sistema de moviment en desenvolupament)
                    </p>
                </div>
            </div>
        `;
    }

    handleKeyPress(e) {
        if (this.currentScreen !== 'main-game') return;

        const key = e.key.toLowerCase();
        
        switch(key) {
            case 'arrowup':
            case 'w':
                this.party[0].position.y -= 1;
                e.preventDefault();
                break;
            case 'arrowdown':
            case 's':
                this.party[0].position.y += 1;
                e.preventDefault();
                break;
            case 'arrowleft':
            case 'a':
                this.party[0].position.x -= 1;
                e.preventDefault();
                break;
            case 'arrowright':
            case 'd':
                this.party[0].position.x += 1;
                e.preventDefault();
                break;
            case 'h':
                if (this.party[0].hp < this.party[0].maxHP) {
                    this.party[0].heal(1);
                    this.updatePartyPanel();
                }
                break;
            case 'x':
                if (this.party[0].hp > 0) {
                    this.party[0].takeDamage(1);
                    this.updatePartyPanel();
                }
                break;
        }
    }
}

// Inicia el joc
let gameInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 DOM Content Loaded - Iniciant Les Terres Salvatges');
    gameInstance = new Game();
    console.log('🎮 Les Terres Salvatges carregat!');
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded listener activated');
    });
} else {
    console.log('Document already loaded, initializing game now');
    gameInstance = new Game();
}