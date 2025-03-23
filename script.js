const URL = "https://teachablemachine.withgoogle.com/models/PWJnkriky/";

let model, webcam, labelContainer, maxPredictions;

// Cargar el modelo de Teachable Machine
async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

// Iniciar la webcam
async function init() {
    if (!model) await loadModel(); // Asegurar que el modelo esté cargado antes de usarlo

    webcam = new tmImage.Webcam(300, 300, true);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
}

// Loop de la cámara
async function loop() {
    webcam.update();
    await predict(webcam.canvas);
    window.requestAnimationFrame(loop);
}

// Hacer predicción con IA
async function predict(image) {
    if (!model) await loadModel(); // Cargar modelo si no está listo

    const prediction = await model.predict(image);
    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = `${prediction[i].className}: ${(prediction[i].probability * 100).toFixed(2)}%`;
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}

// Manejar subida de imagen
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function (e) {
            let img = new Image();
            img.src = e.target.result;
            img.onload = async function () {
                document.getElementById("image-container").innerHTML = "";
                document.getElementById("image-container").appendChild(img);

                // Convertir imagen en un formato compatible con la IA
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);

                await predict(canvas);
            };
        };
        reader.readAsDataURL(file);
    }
}

// Cargar el modelo al inicio
loadModel();
