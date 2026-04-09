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
- currentPoint – spelarens poäng (sparas i localStorage)  
- currentCoin – används för att köpa upgrades  
- defaultIntervalTimer – standard tid för auto-poäng
- autoInterval – sparar nuvarande interval  

### Funktioner

newClick(type)  
- Hanterar klick och auto-poäng  
- Räknar ut hur mycket poäng spelaren får beroende på boosts  

createInterval()  
- Skapar eller uppdaterar auto-poäng interval  

newBuy(type)  
- Körs när en upgrade köps  
- Aktiverar effekter och uppdaterar UI  

updateCoins()  
- Uppdaterar coins på skärmen  

setStatusOfFeature(id, status)  
- Låser eller låser upp upgrades  

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