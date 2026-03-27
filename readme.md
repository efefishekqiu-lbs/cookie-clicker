# Cookie Clicker

## Beskrivning
Spelaren klickar på en cookie för att få poäng.  
Målet är att samla så mycket poäng som möjligt och köpa uppgraderingar.

---

## Hur spelet fungerar
När spelaren klickar:

click → newClick() → poäng ökar → sidan uppdateras  

Det finns också automatiska poäng som genereras över tid.

---

## Teknik & lösningar

### Variabler
- currentPoint – spelarens poäng  
- currentCoin – används för att köpa upgrades  
- storage – sparar poäng i localStorage  

### Funktioner

newClick()  
- Hanterar klick och räknar ut poäng beroende på upgrades  

updateCoins()  
- Uppdaterar coins på skärmen  

addEventListener  
- Används för att lyssna på klick på cookie och upgrades  

---

## Uppgraderingar

- När man köper en upgrade aktiveras en effekt  
- Spelet kontrollerar om spelaren har råd  
- Varje upgrade kan bara köpas en gång  

Exempel:
- Auto boost – ger poäng automatiskt  
- Click boost – ger mer poäng per klick  
- Lucky click – chans att få extra poäng  

---

## Problem & lösningar

Problem: Poäng sparades inte efter refresh  
Lösning:
```js
const storage = {
  get(key) {
    const value = localStorage.getItem(key);
    return value === null ? 0 : Number(value);
  },
  set(key, value) {
    localStorage.setItem(key, value.toString());
  }
};