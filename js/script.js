document.addEventListener('DOMContentLoaded', () => {
    const canvas = new fabric.Canvas('photo-strip-canvas');
    canvas.setDimensions({ width: 500, height: 700 });
    canvas.backgroundColor = '#fff8f0';
    canvas.renderAll();

    // === ELEMEN DOM ===
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
    const heroDance = document.getElementById('heroDance');
    const fillActiveFrameBtn = document.getElementById('fillActiveFrameBtn');
    const layoutBtns = document.querySelectorAll('.layout-btn');

    let currentStream = null;
    let activeFrame = null;          // frame yang dipilih
    let frames = [];                 // menyimpan objek frame (fabric.Rect)
    let currentLayout = '3';         // default 3 foto

    // ========== LAYOUT DEFINISI ==========
    const layoutDefinitions = {
        '1': { rows: 1, cols: 1, margin: 40, gap: 0 },
        '2': { rows: 2, cols: 1, margin: 40, gap: 20 },
        '3': { rows: 3, cols: 1, margin: 40, gap: 20 },
        '4': { rows: 2, cols: 2, margin: 40, gap: 20 },
        '6': { rows: 2, cols: 3, margin: 40, gap: 15 }
    };

    // Fungsi membuat frame berdasarkan layout
    function createLayout(layoutKey) {
        canvas.clear(); // hapus semua objek
        canvas.backgroundColor = '#fff8f0';
        frames = [];
        activeFrame = null;

        const def = layoutDefinitions[layoutKey];
        if (!def) return;

        const { rows, cols, margin, gap } = def;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const frameWidth = (canvasWidth - 2 * margin - (cols - 1) * gap) / cols;
        const frameHeight = (canvasHeight - 2 * margin - (rows - 1) * gap) / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const left = margin + c * (frameWidth + gap);
                const top = margin + r * (frameHeight + gap);
                const rect = new fabric.Rect({
                    left: left,
                    top: top,
                    width: frameWidth,
                    height: frameHeight,
                    fill: 'rgba(240,240,240,0.5)',
                    stroke: '#ffaa66',
                    strokeWidth: 3,
                    rx: 12,
                    ry: 12,
                    selectable: true,
                    hasControls: false,
                    hasBorders: true,
                    lockMovementX: true,
                    lockMovementY: true,
                    lockRotation: true,
                    lockScalingX: true,
                    lockScalingY: true,
                    data: { type: 'frame', index: frames.length }
                });
                canvas.add(rect);
                frames.push(rect);
            }
        }

        // tambahkan teks instruksi
        const instruction = new fabric.Text('Klik frame lalu klik "Isi ke Frame Aktif"', {
            fontSize: 14,
            fontFamily: 'Quicksand',
            fill: '#b45f2b',
            left: canvas.width / 2,
            top: canvas.height - 25,
            originX: 'center',
            selectable: false,
            hasControls: false,
            evented: false
        });
        canvas.add(instruction);
        canvas.renderAll();

        // event listener untuk memilih frame
        canvas.on('selection:created', onObjectSelected);
        canvas.on('selection:updated', onObjectSelected);
    }

    function onObjectSelected(e) {
        const selected = e.selected ? e.selected[0] : null;
        if (selected && selected.data && selected.data.type === 'frame') {
            activeFrame = selected;
            // highlight frame yang aktif
            frames.forEach(f => f.set('stroke', '#ffaa66'));
            activeFrame.set('stroke', '#ff4d4d');
            canvas.renderAll();
        } else {
            activeFrame = null;
            frames.forEach(f => f.set('stroke', '#ffaa66'));
            canvas.renderAll();
        }
    }

    // Fungsi mengisi frame dengan gambar
    function fillFrameWithImage(imgUrl) {
        if (!activeFrame) {
            alert('Pilih frame terlebih dahulu dengan mengkliknya!');
            return;
        }
        // hapus gambar yang sudah ada di frame (jika ada)
        const objects = canvas.getObjects();
        const existingImage = objects.find(obj => obj.data && obj.data.frameIndex === activeFrame.data.index);
        if (existingImage) {
            canvas.remove(existingImage);
        }

        fabric.Image.fromURL(imgUrl, (imgObj) => {
            const frame = activeFrame;
            const scale = Math.min(frame.width / imgObj.width, frame.height / imgObj.height);
            imgObj.scale(scale);
            imgObj.set({
                left: frame.left + (frame.width - imgObj.width * scale) / 2,
                top: frame.top + (frame.height - imgObj.height * scale) / 2,
                originX: 'left',
                originY: 'top',
                hasControls: true,
                selectable: true,
                data: { type: 'photo', frameIndex: frame.data.index }
            });
            canvas.add(imgObj);
            canvas.renderAll();
        });
    }

    // ========== STIKER DEFAULT (EMOJI) ==========
    const defaultStickerList = [
        '🐟', '🐠', '🐡', '🐙', '🐬', '🐳', '🤠', '🐮', '🐶', '🐱', '🐭', '🐹',
        '🐰', '🦊', '🐻', '🐼', '🐨', '🐸', '🐒', '🐔', '🐧', '🐦', '🐴', '🐝',
        '🐛', '🦋', '🐌', '🐞', '🐜', '🕷️', '🦂', '🐢', '🐍', '🦎', '🐙', '🦑',
        '🦐', '🦀', '🐡', '🐠', '⭐', '❤️', '💖', '✨', '🎈', '🌸', '🌼', '🍭',
        '🍬', '🍫', '🧸', '🌈', '🌟'
    ];
    const usedStickers = defaultStickerList.slice(0, 30);
    usedStickers.forEach(emoji => {
        const stickerDiv = document.createElement('div');
        stickerDiv.className = 'sticker-item';
        stickerDiv.innerText = emoji;
        stickerDiv.style.fontSize = '2.8rem';
        stickerDiv.addEventListener('click', () => {
            const textObj = new fabric.Text(emoji, {
                fontSize: 60,
                fontFamily: 'Segoe UI Emoji, "Apple Color Emoji", "Noto Color Emoji", sans-serif',
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
        });
        defaultStickersDiv.appendChild(stickerDiv);
    });

    // ========== STIKER CUSTOM ==========
    addCustomStickerBtn.addEventListener('click', () => uploadStickerInput.click());
    uploadStickerInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            const imgURL = event.target.result;
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
        };
        reader.readAsDataURL(file);
        uploadStickerInput.value = '';
    });

    // ========== KAMERA ==========
    openCameraBtn.addEventListener('click', async () => {
        if (currentStream) {
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
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const dataURL = tempCanvas.toDataURL('image/jpeg', 0.95);
        fillFrameWithImage(dataURL);
    });

    // Upload foto dari galeri
    uploadPhotoBtn.addEventListener('click', () => uploadPhotoInput.click());
    uploadPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            fillFrameWithImage(event.target.result);
        };
        reader.readAsDataURL(file);
        uploadPhotoInput.value = '';
    });

    // Tombol isi frame aktif (bisa juga dari kamera/upload sudah langsung isi)
    fillActiveFrameBtn.addEventListener('click', () => {
        // jika ada kamera terbuka, ambil foto? lebih baik upload manual atau capture.
        // Kita buat pilihan: bisa ambil dari upload saja, atau jika ada kamera hidup, capture.
        // Di sini kita bisa trigger capture jika kamera hidup.
        if (currentStream) {
            captureBtn.click();
        } else {
            uploadPhotoBtn.click();
        }
    });

    // ========== FILTER ==========
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
            default: break;
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

    // ========== TEKS ==========
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

    // ========== DOWNLOAD & CLEAR ==========
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

    clearCanvasBtn.addEventListener('click', () => {
        createLayout(currentLayout);
    });

    // ========== LAYOUT SWITCH ==========
    layoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const layout = btn.getAttribute('data-layout');
            currentLayout = layout;
            createLayout(layout);
            layoutBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // ========== TEMA ==========
    function setTheme(theme) {
        let heroEmoji = '🐟💃';
        let heroTextBg = '#ffffff';
        switch (theme) {
            case 'aquarium':
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
            canvas.setBackgroundColor('#fff8f0', () => canvas.renderAll());
        }
        heroCharacter.innerText = heroEmoji;
        heroDance.style.background = heroTextBg;
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

    // Inisialisasi layout default 3 foto
    createLayout('3');
    document.querySelector('.layout-btn[data-layout="3"]').classList.add('active');
    setTheme('aquarium');
    document.querySelector('[data-theme="aquarium"]').classList.add('active');
});
