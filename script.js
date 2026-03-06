let currentPoint = 0;
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
      color: "#7FDBFF" 
   },
   ["interval-boost"]: {
      label: "Faster auto points",
      description: "Systemet ger poäng oftare automatiskt.",
      isIntervalType: true,
      status: false,
      value: 10,
      color: "#01FF70" 
   },
   ["click-boost"]: {
      label: "Click boost 2x",
      description: "Ger dubbla poäng varje gång du klickar.",
      isIntervalType: false,
      status: false,
      value: 5,
      color: "#39CCCC"
   },
   ["mega-click-boost"]: {
      label: "Mega click boost 3x",
      description: "Ger tre gånger mer poäng per klick.",
      isIntervalType: false,
      status: false,
      value: 20,
      color: "#FFDC00" 
   },
}

function updateCoins() {
   $(".coin").html("$"+currentCoin)
}

// Här lägger jag dinamiskt nya elementer för boosts och skapar första default intervallen som körs direkt och skapar en interval som ger coins varje 2 sekunder automatisk random. minst 1 och max 4 coins ger den
$(document).ready(function() {
   $(".boosts-container").empty()
   $.each(boosts, function(k, v) {
      $(".boosts-container").append(`
         <div class="boosts-container-boost opacityLow" data-id="${k}">
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
         </div>
      `)
   })
   setTimeout(() => {
      createInterval()
   }, 100);
   setInterval(() => {
      currentCoin += Math.floor(Math.random() * 4) + 1;
      updateCoins()
   }, 2000);
})

// Det är en funktion för att skapa en ny interval med mindre tid för en boost och jag ändrar per click point baserad på om boosten är aktiverad eller inte
function newBuy(type) {
   $(`.boosts-container-boost[data-id="${type}"]>h3`).html(`<svg style="color: #01FF70 !important; font-size: 23px !important;" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path></svg>`)
   $(`.boosts-container-boost[data-id="${type}"]`).css("opacity", "60%").css("pointer-events", "none")
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
      console.log(addingPoint)
    }
   currentPoint = (currentPoint + addingPoint)
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