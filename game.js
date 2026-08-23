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
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Selecció de classe
        document.querySelectorAll('.class-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectClass(e.target.closest('.class-btn')));
        });

        // Input de nom
        document.getElementById('char-name').addEventListener('input', (e) => {
            // Podria fer coses aquí si necessita
        });

        // Botó de crear personatge
        document.getElementById('create-btn').addEventListener('click', () => this.createCharacter());

        // Teclat per a moviment (quan estem en joc)
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    selectClass(btn) {
        document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedClass = btn.dataset.class;
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        // Crea un personatge temporal per veure els stats
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

    createCharacter() {
        const name = document.getElementById('char-name').value || 'Aventurer';
        this.character = new Character(name, this.selectedClass);
        
        this.showMainGame();
        this.updateCharacterPanel();
        this.initializeGameWorld();
    }

    showMainGame() {
        document.getElementById('character-creation-screen').classList.remove('active');
        document.getElementById('main-game-screen').classList.add('active');
        this.currentScreen = 'main-game';
    }

    updateCharacterPanel() {
        const char = this.character;
        
        // Nom i classe
        document.getElementById('panel-char-name').textContent = char.name;
        document.getElementById('panel-char-class').textContent = this.getClassName(char.class);
        
        // HP
        document.getElementById('panel-hp').textContent = char.hp;
        document.getElementById('panel-max-hp').textContent = char.maxHP;
        
        // HP Bar
        const hpPercent = (char.hp / char.maxHP) * 100;
        document.getElementById('hp-bar-fill').style.width = hpPercent + '%';
        
        // Stats
        document.getElementById('panel-str').textContent = char.stats.str;
        document.getElementById('panel-dex').textContent = char.stats.dex;
        document.getElementById('panel-con').textContent = char.stats.con;
        document.getElementById('panel-int').textContent = char.stats.int;
        document.getElementById('panel-wis').textContent = char.stats.wis;
        document.getElementById('panel-cha').textContent = char.stats.cha;
        
        // Retrat
        const portraitSprite = document.getElementById('portrait-sprite');
        portraitSprite.className = `portrait-sprite ${char.class}`;
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
        const gameWorld = document.getElementById('game-world');
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
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.updateStatsDisplay(); // Mostra stats inicials
    console.log('🎮 Les Terres Salvatges carregat!');
});