document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi Fabric Canvas
    const canvas = new fabric.Canvas('photo-strip-canvas');
    canvas.setDimensions({ width: 500, height: 700 });
    canvas.backgroundColor = '#fff8f0';
    canvas.renderAll();

    // Elemen DOM
    const video = document.getElementById('videoFeed');
    const videoContainer = document.getElementById('video-container');
    const openCameraBtn = document.getElementById('openCameraBtn');
    const captureBtn = document.getElementById('capturePhotoBtn');
    const uploadPhotoInput = document.getElementById('uploadPhotoInput');
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    const filterSelect = document.getElementById('filterSelect');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const addTextBtn = document.getElementById('addTextBtn');
    const teksInput = document.getElementById('teksInput');
    const defaultStickersDiv = document.getElementById('defaultStickers');
    const customStickersPanel = document.getElementById('customStickersPanel');
    const uploadStickerInput = document.getElementById('uploadStickerInput');
    const addCustomStickerBtn = document.getElementById('addCustomStickerBtn');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const heroCharacter = document.getElementById('heroCharacter');

    let currentStream = null;

    // ---------- Stiker Default (Emoji Lucu) ----------
    const defaultStickerList = [
        '🐟', '🐠', '🐡', '🐙', '🐬', '🐳', '🤠', '🐮', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐸', '🐒', '🐔', '🐧', '🐦', '🐴', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🕷️', '🦂', '🐢', '🐍', '🦎', '🐙', '🦑', '🦐', '🦀', '🐡', '🐠', '⭐', '❤️', '💖', '✨', '🎈', '🌸', '🌼', '🍭', '🍬', '🍫', '🧸'
    ];
    // Ambil 24 stiker acak/unik biar ga terlalu panjang
    const selectedStickers = defaultStickerList.slice(0, 24);
    selectedStickers.forEach(emoji => {
        const stickerDiv = document.createElement('div');
        stickerDiv.className = 'sticker-item';
        stickerDiv.innerText = emoji;
        stickerDiv.style.fontSize = '2.8rem';
        stickerDiv.addEventListener('click', () => {
            addTextSticker(emoji);
        });
        defaultStickersDiv.appendChild(stickerDiv);
    });

    function addTextSticker(emoji) {
        const textObj = new fabric.Text(emoji, {
            fontSize: 60,
            fontFamily: 'Segoe UI Emoji',
            originX: 'center',
            originY: 'center',
            left: canvas.width / 2,
            top: canvas.height / 2,
            shadow: 'rgba(0,0,0,0.2) 2px 2px 5px',
            hasControls: true,
            hasBorders: true,
            selectable: true
        });
        canvas.add(textObj);
        canvas.setActiveObject(textObj);
        canvas.renderAll();
    }

    // ----- Stiker Custom (Upload gambar) -----
    let customStickerList = []; // simpan dataURL untuk panel

    addCustomStickerBtn.addEventListener('click', () => {
        uploadStickerInput.click();
    });

    uploadStickerInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            const imgURL = event.target.result;
            // Tambah ke panel stiker custom
            addStickerToPanel(imgURL);
            // Opsional: langsung tambah ke canvas? user bisa klik nanti
        };
        reader.readAsDataURL(file);
        uploadStickerInput.value = '';
    });

    function addStickerToPanel(imgURL) {
        const stickerDiv = document.createElement('div');
        stickerDiv.className = 'sticker-item';
        const img = document.createElement('img');
        img.src = imgURL;
        stickerDiv.appendChild(img);
        stickerDiv.addEventListener('click', () => {
            fabric.Image.fromURL(imgURL, (imgObj) => {
                imgObj.scaleToWidth(100);
                imgObj.set({
                    left: canvas.width / 2,
                    top: canvas.height / 2,
                    originX: 'center',
                    originY: 'center',
                    hasControls: true,
                    selectable: true
                });
                canvas.add(imgObj);
                canvas.setActiveObject(imgObj);
                canvas.renderAll();
            });
        });
        customStickersPanel.appendChild(stickerDiv);
        customStickerList.push(imgURL);
    }

    // ----- Kamera & Capture -----
    openCameraBtn.addEventListener('click', async () => {
        if (currentStream) {
            // matikan dulu
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
            videoContainer.style.display = 'none';
            captureBtn.disabled = true;
            openCameraBtn.innerHTML = '<i class="fas fa-video"></i> Buka Kamera';
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            currentStream = stream;
            video.srcObject = stream;
            videoContainer.style.display = 'block';
            captureBtn.disabled = false;
            openCameraBtn.innerHTML = '<i class="fas fa-stop"></i> Tutup Kamera';
        } catch (err) {
            alert('Tidak dapat mengakses kamera: ' + err.message);
        }
    });

    captureBtn.addEventListener('click', () => {
        if (!currentStream) {
            alert('Kamera belum dibuka!');
            return;
        }
        // Capture dari video
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const dataURL = tempCanvas.toDataURL('image/jpeg', 0.95);
        fabric.Image.fromURL(dataURL, (img) => {
            const maxSize = 280;
            const scale = Math.min(maxSize / img.width, maxSize / img.height);
            img.scale(scale);
            img.set({
                left: canvas.width / 2,
                top: canvas.height / 2,
                originX: 'center',
                originY: 'center',
                cornerColor: '#ffaa66',
                hasControls: true,
                selectable: true
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        });
    });

    // Upload Foto dari galeri
    uploadPhotoBtn.addEventListener('click', () => uploadPhotoInput.click());
    uploadPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            fabric.Image.fromURL(event.target.result, (img) => {
                const maxSize = 280;
                const scale = Math.min(maxSize / img.width, maxSize / img.height);
                img.scale(scale);
                img.set({
                    left: canvas.width / 2,
                    top: canvas.height / 2,
                    originX: 'center',
                    originY: 'center',
                    hasControls: true
                });
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
            });
        };
        reader.readAsDataURL(file);
        uploadPhotoInput.value = '';
    });

    // Filter untuk objek aktif
    function applyFilterToObject(obj, filterType) {
        if (!obj || !obj.filters) return;
        obj.filters = [];
        switch (filterType) {
            case 'grayscale':
                obj.filters.push(new fabric.Image.filters.Grayscale());
                break;
            case 'sepia':
                obj.filters.push(new fabric.Image.filters.Sepia());
                break;
            case 'vintage':
                obj.filters.push(new fabric.Image.filters.Sepia());
                obj.filters.push(new fabric.Image.filters.Brightness({ brightness: -0.1 }));
                break;
            case 'brightness':
                obj.filters.push(new fabric.Image.filters.Brightness({ brightness: 0.3 }));
                break;
            case 'contrast':
                obj.filters.push(new fabric.Image.filters.Contrast({ contrast: 0.2 }));
                break;
            case 'cartoon':
                obj.filters.push(new fabric.Image.filters.Contrast({ contrast: 0.4 }));
                obj.filters.push(new fabric.Image.filters.Brightness({ brightness: 0.1 }));
                break;
            default:
                break;
        }
        obj.applyFilters();
        canvas.renderAll();
    }

    applyFilterBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (!activeObj) {
            alert('Pilih objek foto/stiker gambar terlebih dahulu!');
            return;
        }
        if (!(activeObj instanceof fabric.Image)) {
            alert('Filter hanya dapat diterapkan ke foto/gambar (bukan teks emoji)');
            return;
        }
        const filterVal = filterSelect.value;
        applyFilterToObject(activeObj, filterVal);
    });

    // Tambah Teks
    addTextBtn.addEventListener('click', () => {
        const text = teksInput.value.trim();
        if (text === '') return;
        const textObj = new fabric.Text(text, {
            fontSize: 32,
            fontFamily: 'Quicksand',
            fill: '#b45f2b',
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            stroke: '#ffd966',
            strokeWidth: 1,
            shadow: 'rgba(0,0,0,0.2) 2px 2px 4px'
        });
        canvas.add(textObj);
        canvas.setActiveObject(textObj);
        canvas.renderAll();
        teksInput.value = '';
    });

    // Simpan Strip
    downloadBtn.addEventListener('click', () => {
        const dataURL = canvas.toDataURL({
            format: 'png',
            multiplier: 2,
            quality: 1
        });
        const link = document.createElement('a');
        link.download = 'photobooth-strip.png';
        link.href = dataURL;
        link.click();
    });

    // Bersihkan Canvas
    clearCanvasBtn.addEventListener('click', () => {
        canvas.clear();
        canvas.backgroundColor = '#fff8f0';
        canvas.renderAll();
    });

    // ---------- TEMA (Akuarium, Cowboy, Imut) ----------
    function setTheme(theme) {
        // ubah background canvas + hero
        let bgColor = '#fff8f0';
        let bgImage = null;
        let heroEmoji = '🐟💃';
        let heroTextBg = '#ffffff';
        switch (theme) {
            case 'aquarium':
                bgColor = '#c9e9ff';
                heroEmoji = '🐠🐟💃';
                heroTextBg = '#c3e2f7';
                canvas.setBackgroundColor(new fabric.Pattern({
                    source: (function() {
                        const patternCanvas = document.createElement('canvas');
                        patternCanvas.width = 100;
                        patternCanvas.height = 100;
                        const ctx = patternCanvas.getContext('2d');
                        ctx.fillStyle = '#7bc5ff';
                        ctx.fillRect(0,0,100,100);
                        ctx.fillStyle = '#4aa3df';
                        for(let i=0;i<30;i++) {
                            ctx.beginPath();
                            ctx.arc(Math.random()*100, Math.random()*100, 2, 0, 2*Math.PI);
                            ctx.fill();
                        }
                        return patternCanvas;
                    })(),
                    repeat: 'repeat'
                }), () => canvas.renderAll());
                break;
            case 'cowboy':
                bgColor = '#e0c8a0';
                heroEmoji = '🤠🐎💃';
                heroTextBg = '#e0b87a';
                canvas.setBackgroundColor(new fabric.Pattern({
                    source: (function() {
                        const patternCanvas = document.createElement('canvas');
                        patternCanvas.width = 80;
                        patternCanvas.height = 80;
                        const ctx = patternCanvas.getContext('2d');
                        ctx.fillStyle = '#c9a87b';
                        ctx.fillRect(0,0,80,80);
                        ctx.strokeStyle = '#aa7a3c';
                        ctx.lineWidth = 3;
                        for(let i=0;i<5;i++) {
                            ctx.beginPath();
                            ctx.moveTo(0,i*20);
                            ctx.lineTo(80,i*20);
                            ctx.stroke();
                        }
                        return patternCanvas;
                    })(),
                    repeat: 'repeat'
                }), () => canvas.renderAll());
                break;
            case 'cute':
                bgColor = '#ffe4ec';
                heroEmoji = '🎀🐣💖💃';
                heroTextBg = '#ffe0e7';
                canvas.setBackgroundColor(new fabric.Pattern({
                    source: (function() {
                        const patternCanvas = document.createElement('canvas');
                        patternCanvas.width = 60;
                        patternCanvas.height = 60;
                        const ctx = patternCanvas.getContext('2d');
                        ctx.fillStyle = '#ffb7c5';
                        ctx.fillRect(0,0,60,60);
                        ctx.fillStyle = '#ff90aa';
                        ctx.beginPath();
                        ctx.arc(15,15,5,0,2*Math.PI);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(45,45,5,0,2*Math.PI);
                        ctx.fill();
                        return patternCanvas;
                    })(),
                    repeat: 'repeat'
                }), () => canvas.renderAll());
                break;
            default: break;
        }
        if (theme !== 'aquarium' && theme !== 'cowboy' && theme !== 'cute') {
            canvas.setBackgroundColor(bgColor, () => canvas.renderAll());
        }
        heroCharacter.innerText = heroEmoji;
        document.querySelector('.hero-dance').style.background = heroTextBg;
        canvas.renderAll();
    }

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            setTheme(theme);
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Default tema akuarium
    setTheme('aquarium');
    document.querySelector('[data-theme="aquarium"]').classList.add('active');

    // Tambahkan instruksi awal
    console.log('Photo Booth Siap!');
});
