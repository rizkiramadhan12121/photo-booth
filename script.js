let photoCount = 0;
const photos = [];
let stream = null;
let countdownInterval = null;

// DOM Elements
const video = document.getElementById('video');
const photoCountElement = document.getElementById('photoCount');
const takePhotoBtn = document.getElementById('takePhoto');
const saveBtn = document.getElementById('save');
const retryBtn = document.getElementById('retry');
const effectSelect = document.getElementById('effect');
const frameSelect = document.getElementById('frame');
const bgColorInput = document.getElementById('bgcolor');
const photoSlots = document.querySelectorAll('.photo-slot');
const countdownElement = document.getElementById('countdown');

// Effects mapping
const effects = {
    none: '',
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(100%)',
    blur: 'blur(2px)',
    brightness: 'brightness(150%)',
    contrast: 'contrast(150%)',
    'hue-rotate': 'hue-rotate(90deg)',
    invert: 'invert(100%)',
    saturate: 'saturate(200%)'
};

// Start camera
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Error accessing camera. Please make sure you have granted camera permissions.");
    }
}

// Take photo
function takePhoto() {
    if (photoCount >= 4) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Apply selected effect
    ctx.filter = effects[effectSelect.value];
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg');
    photos.push(dataUrl);

    // Create and add image to photo slot
    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.filter = effects[effectSelect.value];
    
    // Apply frame style
    if (frameSelect.value !== 'none') {
        img.className = `frame-${frameSelect.value}`;
    }

    photoSlots[photoCount].innerHTML = '';
    photoSlots[photoCount].appendChild(img);

    photoCount++;
    updateUI();
}

// Save photos
function savePhotos() {
    if (photos.length === 0) return;

    const link = document.createElement('a');
    link.href = photos[0]; // Save first photo for now
    link.download = 'photobooth-picture.jpg';
    link.click();
}

// Retry
function retryPhotos() {
    photoCount = 0;
    photos.length = 0;
    photoSlots.forEach(slot => slot.innerHTML = '');
    updateUI();
}

// Update UI state
function updateUI() {
    photoCountElement.textContent = photoCount;
    takePhotoBtn.disabled = photoCount >= 4;
    saveBtn.disabled = photoCount === 0;
    retryBtn.disabled = photoCount === 0;
}

// Apply effect to all photos and video
function applyEffect() {
    const effect = effects[effectSelect.value];
    video.style.filter = effect;
    document.querySelectorAll('.photo-slot img').forEach(img => {
        img.style.filter = effect;
    });
}

// Apply frame to all photos and video
function applyFrame() {
    const frameClass = frameSelect.value !== 'none' ? `frame-${frameSelect.value}` : '';
    video.className = frameClass;
    document.querySelectorAll('.photo-slot img').forEach(img => {
        img.className = frameClass;
    });
}

// Update background color
function updateBackgroundColor() {
    document.body.style.backgroundColor = bgColorInput.value;
}

// Start taking photos with 3-second delay between each photo
function startPhotoSequence() {
    if (photoCount >= 4) return;

    takePhoto(); // Take the first photo immediately

    // Set interval to take the next photos with 3-second delay
    const interval = setInterval(() => {
        if (photoCount < 4) {
            takePhoto();
        } else {
            clearInterval(interval); // Stop the interval when 4 photos are taken
        }
    }, 3000); // 3-second delay
}



// Event Listeners
takePhotoBtn.addEventListener('click', () => {
    if (photoCount === 0) {
        startPhotoSequence();
    }
});
saveBtn.addEventListener('click', savePhotos);
retryBtn.addEventListener('click', retryPhotos);
effectSelect.addEventListener('change', applyEffect);
frameSelect.addEventListener('change', applyFrame);
bgColorInput.addEventListener('change', updateBackgroundColor);

// Initialize
startCamera();
updateUI();


// Function to start countdown and take photos
function startCountdown() {
    let count = 3; // Start countdown from 3
    countdownElement.textContent = count;
    countdownElement.classList.add('active', 'animate'); // Show and animate countdown

    const countdownInterval = setInterval(() => {
        count--;
        countdownElement.textContent = count;

        if (count === 0) {
            clearInterval(countdownInterval);
            countdownElement.classList.remove('animate'); // Stop animation
            countdownElement.textContent = '📸'; // Show camera emoji or any other indicator
            setTimeout(() => {
                countdownElement.classList.remove('active'); // Hide countdown
                takePhoto(); // Take photo after countdown
            }, 500); // Wait 0.5s before hiding countdown and taking photo
        }
    }, 1000); // Update countdown every 1 second
}

// Event Listener for Take Photo Button
takePhotoBtn.addEventListener('click', () => {
    if (photoCount < 4) {
        startCountdown(); // Start countdown when button is clicked
    }
});