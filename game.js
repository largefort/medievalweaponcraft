// Variables for resources and game state
let money = 100;
let iron = 50;
let wood = 30;
let xp = 0;
let level = 1;
let requiredXP = 100;
let craftingInProgress = false;
let craftsmanSkill = 0;

const weapons = {
    sword: { iron: 20, wood: 5, price: 50, requiredLevel: 1, requiredSkill: 0 },
    axe: { iron: 15, wood: 10, price: 40, requiredLevel: 1, requiredSkill: 0 },
    spear: { iron: 25, wood: 15, price: 60, requiredLevel: 2, requiredSkill: 5 },
    halberd: { iron: 30, wood: 20, price: 75, requiredLevel: 3, requiredSkill: 10 }
};

// Update display function
function updateDisplay() {
    document.getElementById('money').innerText = money;
    document.getElementById('iron').innerText = iron;
    document.getElementById('wood').innerText = wood;
    document.getElementById('xp').innerText = `${xp}/${requiredXP}`;
    document.getElementById('xp-bar').style.width = `${(xp / requiredXP) * 100}%`;
    document.getElementById('level').innerText = level;
    document.getElementById('craftsmanSkill').innerText = craftsmanSkill;
    updateWeaponButtons();
}

// Load game state from local storage
function loadGame() {
    const savedGame = JSON.parse(localStorage.getItem('blacksmithTycoon'));
    if (savedGame) {
        money = savedGame.money;
        iron = savedGame.iron;
        wood = savedGame.wood;
        xp = savedGame.xp;
        level = savedGame.level;
        requiredXP = savedGame.requiredXP;
        craftsmanSkill = savedGame.craftsmanSkill;
    }
    updateDisplay();
}

// Save game state to local storage
function saveGame() {
    const gameData = {
        money,
        iron,
        wood,
        xp,
        level,
        requiredXP,
        craftsmanSkill
    };
    localStorage.setItem('blacksmithTycoon', JSON.stringify(gameData));
}

// Periodically update resources
function updateResources() {
    iron += 1; // Increment iron passively
    wood += 1; // Increment wood passively
    saveGame(); // Save game after updating resources
    updateDisplay();
}

// Resource update interval (every 10 seconds)
setInterval(updateResources, 1000);

// Remaining functions

function logEvent(message) {
    const log = document.getElementById('events');
    const newLogEntry = document.createElement('li');
    newLogEntry.innerText = message;
    log.appendChild(newLogEntry);
}

function gainXP(amount) {
    xp += amount;
    if (xp >= requiredXP) {
        levelUp();
    }
    updateDisplay();
}

function levelUp() {
    level++;
    xp -= requiredXP;
    requiredXP *= 1.5;
    logEvent(`Congratulations! You've reached level ${level}!`);
    unlockNewWeapons();
    saveGame();
}

function updateWeaponButtons() {
    for (const weapon in weapons) {
        const weaponButton = document.getElementById(weapon);
        weaponButton.style.display = (level >= weapons[weapon].requiredLevel && craftsmanSkill >= weapons[weapon].requiredSkill) ? "block" : "none";
    }
}

function unlockNewWeapons() {
    for (const weapon in weapons) {
        if (level >= weapons[weapon].requiredLevel && craftsmanSkill >= weapons[weapon].requiredSkill && !document.getElementById(weapon)) {
            const button = document.createElement('button');
            button.id = weapon;
            button.innerText = `Craft ${weapon.charAt(0).toUpperCase() + weapon.slice(1)} (${weapons[weapon].iron} iron, ${weapons[weapon].wood} wood)`;
            button.onclick = function() { startCrafting(weapon); };
            document.getElementById('crafting').appendChild(button);
            logEvent(`Unlocked new weapon: ${weapon}`);
        }
    }
    saveGame();
}

function startCrafting(weaponType) {
    if (craftingInProgress) {
        logEvent('Finish current crafting before starting another.');
        return;
    }
    craftingInProgress = true;
    setTimeout(() => craftWeapon(weaponType), 1000);
}

function craftWeapon(type) {
    const weapon = weapons[type];
    if (iron >= weapon.iron && wood >= weapon.wood) {
        iron -= weapon.iron;
        wood -= weapon.wood;
        money += weapon.price;
        craftsmanSkill++;
        gainXP(10);
        logEvent(`Crafted a ${type} and sold it for ${weapon.price} gold.`);
    } else {
        logEvent('Not enough resources to craft ' + type);
    }
    craftingInProgress = false;
    saveGame();
    updateDisplay();
}

// Initialize game
loadGame();
