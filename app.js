const startButton = document.getElementById('startButton');
const barometerFill = document.getElementById('barometer-fill');
const volumeLevelText = document.getElementById('volume-level');
let audioContext;
let analyser;
let microphone;

startButton.addEventListener('click', async () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; // Smaller FFT size for faster response, adjust as needed

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            // We don't connect to audioContext.destination, so we don't hear the mic input

            startButton.textContent = 'Listening...';
            startButton.disabled = true;
            console.log("Microphone access granted and audio context started.");
            updateVolume();
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Error accessing microphone: ' + err.message);
            startButton.textContent = 'Start Listening';
            startButton.disabled = false;
        }
    }
});

function updateVolume() {
    if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray); // You can also use getByteTimeDomainData

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        let averageVolume = sum / bufferLength;

        // Normalize and scale the volume for the barometer
        // This scaling factor might need adjustment based on mic sensitivity and environment
        let barometerHeight = Math.min(100, (averageVolume / 128) * 100 * 1.5); // Max 100%, 128 is half of 256 (max byte value), 1.5 is a sensitivity boost

        barometerFill.style.height = barometerHeight + '%';
        volumeLevelText.textContent = Math.round(averageVolume);

        requestAnimationFrame(updateVolume); // Loop
    }
}
