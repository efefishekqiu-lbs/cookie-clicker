const storage = {
   get(key) {
     const value = localStorage.getItem(key);
     
     if (value === null) {
       return 0;
     }
 
     return Number(value);
   },
 
   set(key, value) {
     localStorage.setItem(key, value.toString());
   }
 };
let currentPoint = storage.get("coins");
let currentCoin = 0;

let defaultIntervalTimer = 1000
let autoInterval = null;
let boosts = {
   ["auto-boost"]: {
      label: "Auto boost",
      description: "Ger 2x extra poäng automatiskt utan att du klickar.",
      isIntervalType: true,
      status: false,
      value: 10,
      color: "#7FDBFF",
      unlockType: {
         type: "timer",
         time: "25s",
      },
   },
   ["interval-boost"]: {
      label: "Faster auto points",
      description: "Systemet ger poäng oftare automatiskt.",
      isIntervalType: true,
      status: false,
      value: 10,
      color: "#01FF70",
      unlockType: {
         type: "points",
         minimum: 10,
      },
   },
   ["lucky-click"]: {
      label: "Lucky Click",
      description: "Each click has a 5% chance to give 10x more points.",
      isIntervalType: false,
      status: false,
      value: 15,
      color: "#FF851B",
      chance: 0.05,
      multiplier: 10,
      unlockType: {
         type: "points",
         minimum: 100,
      },
   },
   ["click-boost"]: {
      label: "Click boost 2x",
      description: "Ger dubbelt poäng varje gång du klickar.",
      isIntervalType: false,
      status: false,
      value: 5,
      color: "#39CCCC",
      unlockType: {
         type: "points",
         minimum: 40,
      },
   },
   ["mega-click-boost"]: {
      label: "Mega click boost 3x",
      description: "Ger tre gånger mer poäng per klick.",
      isIntervalType: false,
      status: false,
      value: 20,
      color: "#FFDC00",
      unlockType: {
         type: "timer",
         time: "2min",
      },
   },
}

// Denna funktionen skapar en interval beroende på id och kollar om current points blir mer en minimum requiered poäng och den startar callbackken för vidare dom ändringarna
let requierementCheckIntervals = {}
function addPointRequirement(element, id, minimum, callback) {
   requierementCheckIntervals[id] = setInterval(() => {
      if (currentPoint >= minimum) {
         if (callback) {
            callback()
         }
         clearInterval(requierementCheckIntervals[id])
         requierementCheckIntervals[id] = null;
      }
      $(element).text("Remaining Coins: "+ (minimum - currentPoint))
   }, 100);
}

// Det är en funktion som jag tåg från google jag ändra den lite för jquery och jag gjorde att det fungerar korrekt, den skapar en timer på spesifik elementet och när den är klar så den har samma callback system som addPointRequirement funktionen
function startTimer(element, duration, callback) {
   let ms = parseDuration(duration);
   let endTime = Date.now() + ms;
   function update() {
      let remaining = endTime - Date.now();
      if (remaining <= 0) {
          $(element).text("00:00");
          if (callback) callback();
          return;
      }
      let seconds = Math.floor(remaining / 1000);
      let minutes = Math.floor(seconds / 60);
      seconds = seconds % 60;
      $(element).text(
         String(minutes).padStart(2, '0') + ":" +
         String(seconds).padStart(2, '0')
      );
      requestAnimationFrame(update);
   }
   update();
}
function parseDuration(str) {
   str = str.toLowerCase().trim();
   if (str.endsWith("ms")) return parseInt(str);
   if (str.endsWith("s")) return parseInt(str) * 1000;
   if (str.endsWith("m") || str.endsWith("min")) return parseInt(str) * 60000;
   return parseInt(str);
}

function updateCoins() {
   $(".coin").html("$"+currentCoin)
}

// Det är en funktion som lockar upgrades så när man köper då locked status ändras till true och man kan inte köpa den igen + elementet blir disabled grund av lock elementet som existerar på varenda uppgrade den blir synlig och parent elementet blir disabled
function setStatusOfFeature(id, status) {
   if (boosts[id]) {
      boosts[id].locked = status 
      if (status == true) {
         $(`.boosts-container-boost[data-id="${id}"]`).find(".lock").show()
         $(`.boosts-container-boost[data-id="${id}"]`).find("h3").hide()
      } else {
         $(`.boosts-container-boost[data-id="${id}"]`).find(".lock").hide()
         $(`.boosts-container-boost[data-id="${id}"]`).find("h3").show()
      }
   }
}

// Här lägger jag dinamiskt nya elementer för boosts och skapar första default intervallen som körs direkt och skapar en interval som ger coins varje 2 sekunder automatisk random. minst 1 och max 4 coins ger den
$(document).ready(function() {
   $(".boosts-container").empty()
   $.each(boosts, function(k, v) {
      boosts[k].locked = false;
      $(".boosts-container").append(`
         <div class="boosts-container-boost" data-id="${k}">
            <div class="rarity-shadow" style="
              background: linear-gradient(
                to right,
                ${v.color}80,  
                ${v.color}00   
              );
            "></div>
            <img src="./cookie.png">
            <h1 style="color: ${v.color}">${v.label}</h1>
            <h2>${v.description}</h2>
            <h3>$${v.value}</h3>
            <div class="lock">
               <span class="timer"></span>
               <svg class="lock-icon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"></path></svg>
            </div>
         </div>
      `)
      setTimeout(() => {
         // Här lockar jag alla elementer och sedan jag kollar hur man ska unlocka dem och lägger callbacks
         setStatusOfFeature(k, true)
         if (v.unlockType.type == "timer") {
            startTimer($(`.boosts-container-boost[data-id="${k}"]`).find(".lock").find(".timer"), v.unlockType.time, function() {
               setStatusOfFeature(k, false)
            })
         }
         if (v.unlockType.type == "points") {
            addPointRequirement($(`.boosts-container-boost[data-id="${k}"]`).find(".lock").find(".timer"), k, v.unlockType.minimum, function() {
               setStatusOfFeature(k, false)
            })
         }
      }, 100);
   })
   $(".main-container>h1").html(`Poäng: ${currentPoint}`)
   // Här skapar jag default intervallen
   setTimeout(() => {
      createInterval()
   }, 100);
   // Här skapar jag en interval som körs varenda 2 sekunder och den ger random money minst 1 och max 4
   setInterval(() => {
      currentCoin += Math.floor(Math.random() * 4) + 1;
      updateCoins()
   }, 2000);
})

// Det är en funktion för att skapa en ny interval med mindre tid för en boost och jag ändrar per click point baserad på om boosten är aktiverad eller inte
function newBuy(type) {
   $(`.boosts-container-boost[data-id="${type}"]>h3`).html(`<svg style="color: #01FF70 !important; font-size: 23px !important;" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path></svg>`)
   $(`.boosts-container-boost[data-id="${type}"]`).css("opacity", "60%").css("pointer-events", "none").css("transform", "scale(0.98A)")
   if (type == "interval-boost") {
      createInterval()
   }
   let perClickPoint = 1;
   if (boosts["click-boost"].status == true) {
      perClickPoint = perClickPoint + 2
   }
   if (boosts["mega-click-boost"].status == true) {
      perClickPoint = perClickPoint + 3
   }
   $(".points-per-click").html(perClickPoint);
}

// Här är det en listener som kontrolrerar om boosten är inte köpt och om du har tillräckligt med coin så köper du boost
$(document).on("click", ".boosts-container-boost", function () {
   let type = $(this).attr("data-id");
   if (boosts[type]) {
      let selectedData = boosts[type]; 
      if (selectedData.status == true) {
         return 
      }
      if (selectedData.locked == true) {
         return 
      }
      Swal.fire({
         title: "Är du säkert?",
         text: `Vill du köpa ${selectedData.label} för ${selectedData.value}`,
         icon: "warning",
         showCancelButton: true,
         confirmButtonColor: "#3085d6",
         cancelButtonColor: "#d33",
         confirmButtonText: "Ja!",
         theme: "dark"
       }).then((result) => {
         if (result.isConfirmed) {
            if (currentCoin >= selectedData.value) {
               boosts[type].status = true;
               currentCoin = currentCoin - selectedData.value
               updateCoins()
               newBuy(type)
               Swal.fire({
                 title: `Du köpte ${selectedData.label}`,
                 text: `Du har $${currentCoin} kvar!`,
                 icon: "success",
                 theme: "dark"
               });
            } else {
               Swal.fire({
                  title: `Du kan inte köpa ${selectedData.label}`,
                  text: `Du har inte tillräckligt med coin! Du behöver minst: $${currentCoin} coin(s)`,
                  icon: "error",
                  theme: "dark"
               });
            }
         }
       });
   }
})

// Det är en click handler, den kontrolrerar typen asså om det är från interval då kontrolerar den om du har interval boost om du inte har den den ger default 1 poäng men om du har boost så ger den 2 styckna
// Om det är click så kontrolrerar den boosten igen så default är 1 men baserad på boosten den kan lägga 2 eller 3. Om 2 boost är aktiverad så den kan till och med ge 6 poäng för en click
function newClick(type) {
   let addingPoint = 1;
   if (type == "interval") {
      if (boosts["auto-boost"].status == true) {
         addingPoint = 2;
      } else {
         addingPoint = 1;
      }
   }
   if (type == "click") {
      randomExplosionEffect()
      addingPoint = 1;
      if (boosts["click-boost"].status == true) {
         addingPoint = addingPoint + 2
      }
      if (boosts["mega-click-boost"].status == true) {
         addingPoint = addingPoint + 3
      }

      if (boosts["lucky-click"]?.status) {
         if (Math.random() < boosts["lucky-click"].chance) {
            addingPoint = addingPoint * boosts["lucky-click"].multiplier;
            console.log("LUCKY CLICK!");
         }
      }
    }
   currentPoint = (currentPoint + addingPoint)
   storage.set("coins", currentPoint)
   $(".main-container>h1").html(`Poäng: ${currentPoint}`)
}

// Här tar jag bort gamla intervallen om det finns och skapar en ny interval baserad på interval boost
function createInterval() {
   if (autoInterval != null) {
      clearInterval(autoInterval) 
      autoInterval = null;
   }
   let intervalTimer = defaultIntervalTimer
   if (boosts["interval-boost"].status == true) {
      intervalTimer = intervalTimer / 2
   }
   autoInterval = setInterval(() => {
      newClick("interval")
   }, intervalTimer);
}

$(document).on("click", ".cookie-click-target", function () {
   newClick("click")
})

// Denna koden hitta jag från google jag sökte exploding particles och jag ändrade shapen/färgen på dem asså hur jag ändra storleken hur dem såg ut och färgerna på den och jag ändrade funktionen så effecten bara poppar ut när du clickar
const canvas = document.getElementById("bg-effects");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];
class Particle{
  constructor(x,y){
    this.x = x;
    this.y = y;
    this.size = Math.random()*6+2;
    this.speedX = (Math.random()-0.5)*12;
    this.speedY = (Math.random()-0.5)*12;
    this.gravity = 0.05;
    this.life = 80 + Math.random()*60;
    const colors = [
      "#5c3b1e",
      "#7a4a24",
      "#a86a32",
      "#c68642",
      "#e0a15c"
    ];
    this.color = colors[Math.floor(Math.random()*colors.length)];
  }

  update(){
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity;
    this.life--;
  }

  draw(){
    ctx.save();
    ctx.translate(this.x,this.y);
    ctx.rotate(Math.random()*Math.PI);
    ctx.fillStyle = this.color;
    ctx.fillRect(
      -this.size/2,
      -this.size/2,
      this.size,
      this.size
    );
    ctx.restore();
  }
}

function explode(x,y){
  for(let i=0;i<80;i++){
    particles.push(new Particle(x,y));
  }
}

function randomExplosionEffect(){
  const x = Math.random()*canvas.width;
  const y = Math.random()*canvas.height;
  explode(x,y);
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let i=particles.length-1;i>=0;i--){
    particles[i].update();
    particles[i].draw();
    if(particles[i].life<=0){
      particles.splice(i,1);
    }
  }
  requestAnimationFrame(animate);
}

animate()

// Det är en listener så när storleken på skärmen ändras så storleken på canvas ändras också man måste göra det för positionen är fixed i canvas inte absolute
window.addEventListener("resize",()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});