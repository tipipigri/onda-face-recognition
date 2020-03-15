// Selezione oggetti dalla pagina:
const corpo = document.querySelector('body');
const video = document.getElementById('video');
const testo = document.querySelector('input');


// Caricamento dei modelli di comparazione dei volti:
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startVideo)


// startVideo() Attiva la webcam: 
function startVideo(){
        navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.log(err)
    )
}


// Variabili utili alla funzione ResizeFontWeigth():
var sample;
var minWidthSample = 0;
var maxWidthSample = 0;
var pesoMin = 300;
var pesoMax = 700;

// resizeFontWeigth() riceve il parametro (face_width = resizedDetections[0].detection._box._width),
// corrispondente alla larghezza [width] del Riquadro [blu] di rilevamento volti.

// resizeFontWeigth() regola il peso della font tramite l'attributo di stile font-variaion setting.
// Il valore inviatogli è inversamente proporzionale alla larghezza del riquadro di rilevamento dei volti,
// Questo equivale a dire che più si è vicini alla webcam più sarà leggero il peso della font e viceversa.

function resizeFontWeigth(face_width){
    sample = Math.round(face_width);
    console.log("Larghezza volto: " + sample);

//  Controlli per la calibrazione automatica dell'intervallo 
//  Per ogni sample si verifica che sia maggiore del massimo o minore del minimo memorizzati
//  altrimenti si sostituisce tale valore.
//  
//  Aperta la pagina potremo quindi calibrare il sistema semplicemente 
//  avvicinandosi e allontanadosi dalla webcam. 
//  
//  NB: Ci sarebbe la necessità di aggiungere delle soglie
//  per essere sicuri di operare in un range utile

        if (sample > maxWidthSample){
            maxWidthSample = sample;
            if (minWidthSample == 0){
                minWidthSample = maxWidthSample;
            }
        }
    
        if (sample < minWidthSample){
            minWidthSample = sample;     
        }

    console.log("Larghezza volto min: " + minWidthSample);
    console.log("Larghezza volto Max: " + maxWidthSample);

//  Calcolo del peso inversamente proporzionale alla distanza:  
    var factor = (sample-minWidthSample)/(maxWidthSample-minWidthSample);
    var pesoFinale = Math.round((pesoMax-pesoMin) * (1-factor) + pesoMin) ;

//  Modifica finale del peso:
    testo.style.fontVariationSettings = '"wght" ' + (pesoFinale);
}


// playWithExpression() riceve il parametro (espressioni = resizedDetections[0].expressions),
// corrispondente all'oggetto contenente per ogni singola espressione (normal, happy, sad, angry,ecc..) 
// il valore risulatente dalla comparazione tra il volto rilevato e i modelli precaricati.

// playWithExpression() estrapola l'espressione dominante e per ciascuna reinvia ad una specifica funzione.

function playWithExpression(espressioni){

    // playWithExpression() estrapola l'espressione dominante e per ciascuna reinvia ad una specifica funzione.
    console.log(espressioni);

    // Estrapolazione dell'espressione dominante tramite la funzione _.max della libreria underscore-min.js.
    var espressioneRilevata = _.max(Object.keys(espressioni), function (o) { return espressioni[o]; });
    console.log(espressioneRilevata);

    // Reinvio ad una specifica funzione per ogni singola espressione rilevata:
    switch (espressioneRilevata) {
        case "neutral":
            neutralReset();
            break;
        case "happy":
            resizeFontItalic();
            break;
        case "sad":
            piccoletto();
          break;
        case "angry":
            viulenza();
          break;
        case "fearfull":
            neutralReset();
          break;
        case "surpised":
            grandicello();
          break;
      }
}

// Resetta lo stile generato dalle altre espressioni:
function neutralReset(){
    testo.style.color = "yellow";
    testo.style.fontSize = "6rem";
    testo.style.marginTop = "20vh";
    testo.textContent = "kafone";
    corpo.style.backgroundImage = "none";
}

// Colora il testo di rosso e imposta font-variation-settings = "ital" 200'
function resizeFontItalic(){
    testo.style.color = "pink";
    testo.style.fontVariationSettings += ', "ital" 200';
    corpo.style.backgroundImage = "url('img2/cloud.gif')";

    // NB: la dicitura  << += ', "ital" 200' >> fa si che il parametro "ital" 
    // si aggiunga in successione a quello preesistente di "wght".
}

// Caccia le fiamme sullo sfondo, ingrandisce il font-size e sposta la scrittta in basso
function viulenza(){
    testo.style.fontSize = "12rem";
    testo.style.marginTop = "36vh";
    testo.style.color = "black";
    corpo.style.backgroundImage = "url('img2/fire.gif')";
}

// Riduce il carattere
function piccoletto(){
    testo.style.fontSize = "1rem";
    testo.style.marginTop = "36vh";
    testo.style.color = "green";
}





//   Intervallo di campionamento
var sampleIntervall = 300; 

// Metre viene riprodotto il video:
video.addEventListener('play', () => {

    // Viene creato un canvas di dimensioni pari a quelle del video,
    // su cui poter rappresentare i dati relativi al face tracking:
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)

    // Per ogni intervallo di campionamento:
    setInterval(async () => {

    // La seguente variabile "detections" e la sua versione resized "resizedDetections" 
    // si riferiscono ad oggetti contenenti tutti i parametri esposti dalla libreria
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

    //   Stampa in canvas dei dati relativi al facetraking (Riquadro [blu] rilevamento viso , Face landmarks, Espressione rilevata)
    //   Decommentare le singole stringhe per visualizzare i rispettivi elementi

    //   Riquadro [blu] rilevamento volti:
      faceapi.draw.drawDetections(canvas, resizedDetections)

    //   Face landmarks:
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)

    //   Espressione rilevata:
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

    // Stampa dell'oggetto contenente tutti i parametri esposti dalla libreria:
      console.log(resizedDetections)

    // Richiama la funzione resizeFontWeigth(), 
    // e gli passa il parametro (resizedDetections[0].detection._box._width)
    // corrispondente alla larghezza del volto rilevato.
    resizeFontWeigth(resizedDetections[0].detection._box._width);

    // Richiama la funzione playWithExpression(), 
    // e gli passa il parametro (resizedDetections[0].expressions)
    // corrispondente all'oggetto contenente per ogni singola espressione (normal, happy, sad, angry,ecc..) 
    // il valore risulatente dalla comparazione tra il volto rilevato e i modelli precaricati.
    playWithExpression(resizedDetections[0].expressions);

    console.log("font-variation-settings: " + testo.style.fontVariationSettings);

    }, sampleIntervall)

  })

