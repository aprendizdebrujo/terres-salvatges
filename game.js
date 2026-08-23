// ============================================
// LES TERRES SALVATGES - Game.js
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
        // OSE-style: 3d6 per cada atribut
        // Però amb modificadors segons la classe
        const baseStats = {
            str: this.roll3d6(),
            dex: this.roll3d6(),
            con: this.roll3d6(),
            int: this.roll3d6(),
            wis: this.roll3d6(),
            cha: this.roll3d6(),
        };

        // Modificadors de classe
        const classModifiers = {
            warrior: { str: 2, con: 1 },
            mage: { int: 2, con: -1 },
            rogue: { dex: 2, con: -1 },
            cleric: { wis: 2, str: 1 },
        };

        const mods = classModifiers[charClass] || {};
        for (let stat in mods) {
            baseStats[stat] += mods[stat];
            baseStats[stat] = Math.max(3, Math.min(18, baseStats[stat])); // Limita entre 3 i 18
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
        this.character = null;
        this.currentScreen = 'character-creation';
        this.selectedClass = 'warrior';
        this.game = this; // Reference to self for event listeners
        this.initializeEventListeners();
        this.updateStatsDisplay();
    }

    initializeEventListeners() {
        console.log('Inicializant event listeners...');
        
        // Selecció de classe
        const classBtns = document.querySelectorAll('.class-btn');
        console.log('Botons de classe trobats:', classBtns.length);
        
        classBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('Classe clicada:', e.target.dataset.class);
                this.selectClass(e.target.closest('.class-btn'));
            });
        });

        // Botó de crear personatge
        const createBtn = document.getElementById('create-btn');
        console.log('Botó crear trobat:', createBtn ? 'Sí' : 'No');
        
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                console.log('Botó crear clicat');
                this.createCharacter();
            });
        }

        // Teclat per a moviment (quan estem en joc)
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    selectClass(btn) {
        console.log('selectClass called');
        if (!btn) {
            console.log('No button provided');
            return;
        }
        
        document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedClass = btn.dataset.class;
        console.log('Selected class:', this.selectedClass);
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        console.log('Updating stats display for class:', this.selectedClass);
        
        // Crea un personatge temporal per veure els stats
        const tempChar = new Character('Temp', this.selectedClass);
        
        const elements = {
            'stat-str': tempChar.stats.str,
            'stat-dex': tempChar.stats.dex,
            'stat-con': tempChar.stats.con,
            'stat-int': tempChar.stats.int,
            'stat-wis': tempChar.stats.wis,
            'stat-cha': tempChar.stats.cha,
        };
        
        for (let id in elements) {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = elements[id];
            }
        }
        
        const hp = 8 + Math.floor(tempChar.stats.con / 2);
        const hpEl = document.getElementById('hp-value');
        if (hpEl) {
            hpEl.textContent = hp;
        }
        
        console.log('Stats updated');
    }

    createCharacter() {
        console.log('Creating character...');
        
        const nameInput = document.getElementById('char-name');
        const name = nameInput ? nameInput.value || 'Aventurer' : 'Aventurer';
        
        console.log('Character name:', name);
        console.log('Selected class:', this.selectedClass);
        
        this.character = new Character(name, this.selectedClass);
        
        console.log('Character created:', this.character);
        
        this.showMainGame();
        this.updateCharacterPanel();
        this.initializeGameWorld();
    }

    showMainGame() {
        console.log('Showing main game...');
        
        const creationScreen = document.getElementById('character-creation-screen');
        const gameScreen = document.getElementById('main-game-screen');
        
        if (creationScreen) creationScreen.classList.remove('active');
        if (gameScreen) gameScreen.classList.add('active');
        
        this.currentScreen = 'main-game';
        console.log('Main game shown');
    }

    updateCharacterPanel() {
        console.log('Updating character panel...');
        
        if (!this.character) {
            console.log('No character to update');
            return;
        }
        
        const char = this.character;
        
        // Nom i classe
        const nameEl = document.getElementById('panel-char-name');
        const classEl = document.getElementById('panel-char-class');
        
        if (nameEl) nameEl.textContent = char.name;
        if (classEl) classEl.textContent = this.getClassName(char.class);
        
        // HP
        const hpEl = document.getElementById('panel-hp');
        const maxHpEl = document.getElementById('panel-max-hp');
        
        if (hpEl) hpEl.textContent = char.hp;
        if (maxHpEl) maxHpEl.textContent = char.maxHP;
        
        // HP Bar
        const hpBarFill = document.getElementById('hp-bar-fill');
        if (hpBarFill) {
            const hpPercent = (char.hp / char.maxHP) * 100;
            hpBarFill.style.width = hpPercent + '%';
        }
        
        // Stats
        const statElements = {
            'panel-str': char.stats.str,
            'panel-dex': char.stats.dex,
            'panel-con': char.stats.con,
            'panel-int': char.stats.int,
            'panel-wis': char.stats.wis,
            'panel-cha': char.stats.cha,
        };
        
        for (let id in statElements) {
            const el = document.getElementById(id);
            if (el) el.textContent = statElements[id];
        }
        
        // Retrat
        const portraitSprite = document.getElementById('portrait-sprite');
        if (portraitSprite) {
            portraitSprite.className = `portrait-sprite ${char.class}`;
        }
        
        console.log('Character panel updated');
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

    initializeGameWorld() {
        console.log('Initializing game world...');
        
        const gameWorld = document.getElementById('game-world');
        if (!gameWorld) {
            console.log('game-world element not found');
            return;
        }
        
        gameWorld.innerHTML = `
            <div class="game-view">
                <div class="world-message">
                    <h2>🏘️ Poble de Millbrook</h2>
                    <p>Benvingut a ${this.character.name}!</p>
                    <p style="margin-top: 10px; font-size: 0.9rem; color: #95a5a6;">
                        (Accions disponibles en futures versions)
                    </p>
                </div>
            </div>
        `;
        
        console.log('Game world initialized');
    }

    handleKeyPress(e) {
        if (this.currentScreen !== 'main-game') return;

        const key = e.key.toLowerCase();
        
        // Moviment amb fletxes o WASD
        switch(key) {
            case 'arrowup':
            case 'w':
                this.character.position.y -= 1;
                e.preventDefault();
                break;
            case 'arrowdown':
            case 's':
                this.character.position.y += 1;
                e.preventDefault();
                break;
            case 'arrowleft':
            case 'a':
                this.character.position.x -= 1;
                e.preventDefault();
                break;
            case 'arrowright':
            case 'd':
                this.character.position.x += 1;
                e.preventDefault();
                break;
            case 'h':
                // Tecla de prova: curar 1 HP
                if (this.character.hp < this.character.maxHP) {
                    this.character.heal(1);
                    this.updateCharacterPanel();
                }
                break;
            case 'x':
                // Tecla de prova: damage 1 HP
                if (this.character.hp > 0) {
                    this.character.takeDamage(1);
                    this.updateCharacterPanel();
                }
                break;
        }
    }
}

// Inicia el joc quan carrega el document
let gameInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 DOM Content Loaded - Iniciant Les Terres Salvatges');
    gameInstance = new Game();
    console.log('🎮 Les Terres Salvatges carregat!');
});

// Fallback per si el DOMContentLoaded ja s'ha disparat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded listener activated');
    });
} else {
    console.log('Document already loaded, initializing game now');
    gameInstance = new Game();
}
