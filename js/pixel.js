var buttons_menu_top;
var layerSelected;
var lastClicked;
var totalLayerThumbnails = {'face': 4, 'hair': 2, 'eyebrows': 1, 'eyes': 10, 'nose': 2, 'mouth': 2, 'facial-hair': 0, 'accessory-1': 2, 'accessory-2': 2, 'accessory-3': 2, 'background': 4};
var selectedIndex = {'face': -1, 'hair': -1, 'eyebrows': -1, 'eyes': -1, 'nose': -1, 'mouth': -1, 'facial-hair': -1, 'accessory-1': -1, 'accessory-2': -1, 'accessory-3': -1, 'background': -1}; // Indices start at 0, -1 == nothing selected
var layerColor = {'face': 'default', 'hair': 'default', 'eyebrows': 'fixed', 'eyes': 'fixed', 'nose': 'fixed', 'mouth': 'fixed', 'facial-hair': 'default', 'accessory-1': 'default', 'accessory-2': 'default', 'accessory-3': 'default', 'background': 'rgb(255, 175, 63)'};
var layerWidth = {'eyebrows': 0, 'eyes': 0}
multiplier = 16;
var canvasX = 32;
var canvasY = 32;

window.onload = function setup() {
    // Set up tool buttons
    var eraseLayerBtn = document.querySelector('.tools__btn--erase-layer');
    eraseLayerBtn.onclick = function() {
        eraseLayer();
        if (layerSelected != 'background') {
            if (layerColor[layerSelected] != 'fixed') {
                layerColor[layerSelected] = 'default';
            }
        }
    }
    var eraseAllBtn = document.querySelector('.tools__btn--erase-all');
    eraseAllBtn.onclick = function() {
        eraseAll();
    }
    // var changeColorBtn = document.querySelector('.tools__btn--change-color');
    // changeColorBtn.onclick = function() {
    //     openPalette(this);
    // }
    var paletteColors = document.querySelectorAll('.palette__color');
    for (i = 0; i < paletteColors.length; i++) {
        paletteColors[i].onclick = function() {
            var colorSelected = String(getComputedStyle(this).backgroundColor);
            if (layerSelected == 'background') {
                drawBackground(colorSelected); // Replaces prev color
            } else {
                changeColor(colorSelected); // rgb(#,#,#)
            }
        }
    }
    // var resetColorBtn = document.querySelector('.tools__btn--reset-color');
    // resetColorBtn.onclick = function() {
    //     drawDefaultImg();
    // }
    // var changePositionBtn = document.querySelector('.tools__btn--change-position');
    // changePositionBtn.onclick = function() {
    //     changePosition(this);
    // }
    var widenBtn = document.querySelector('.d-pad-tools__btn--wide');
    widenBtn.onclick = function() {
        changeWidth(1);
    }
    var narrowBtn = document.querySelector('.d-pad-tools__btn--narrow');
    narrowBtn.onclick = function() {
        changeWidth(-1);
    }
    var dPadUpBtn = document.querySelector('.d-pad__btn--up');
    var dPadDownBtn = document.querySelector('.d-pad__btn--down');
    var dPadLeftBtn = document.querySelector('.d-pad__btn--left');
    var dPadRightBtn = document.querySelector('.d-pad__btn--right');
    dPadUpBtn.onclick = function() {
        translateLayer(0,-1);
    }
    dPadDownBtn.onclick = function() {
        translateLayer(0,1);
    }
    dPadLeftBtn.onclick = function() {
        translateLayer(-1,0);
    }
    dPadRightBtn.onclick = function() {
        translateLayer(1,0);
    }
    var resetPositionBtn = document.querySelector('.tools__btn--reset-position');
    resetPositionBtn.onclick = function() {
        resetPosition();
    }
    var saveBtn = document.querySelector('.tools__btn--save');
    saveBtn.onclick = function() {
        saveImg();
    }

    // Set up layer buttons
    var layersBtns = document.querySelectorAll('.layers__btn');
    for (i = 0; i < layersBtns.length; i++) {
        layersBtns[i].onclick = function(){
            chooseLayer(this);
        }
    }

    // Set up canvases
    var layers = document.querySelectorAll('.layer');
    for (i = 0; i < layers.length; i++) {
        var ctx = layers[i].getContext('2d');
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
    }

    // Set up canvas background
    drawDefaultBackground();

    // Disable palette
    disablePalette();
}

function loadLayerThumbnails(pageNum) {
    var prevBtn = document.querySelector('.layer-thumbnails-nav__btn--prev');
    var nextBtn = document.querySelector('.layer-thumbnails-nav__btn--next');

    var total = totalLayerThumbnails[layerSelected];
    var start = (pageNum - 1) * 28; // Absolute index (0 to total)
    var end; // Relative index to div (0 to 28)

    // Hide/show prev btn
    if (start == 0) {
        prevBtn.style.display = 'none'; //TODO
        prevBtn.onclick = '';
    } else {
        prevBtn.style.display = 'inline';
        prevBtn.onclick = function() {
            loadLayerThumbnails(pageNum - 1);
        }
    }
    // Find ending index & hide/show next btn
    if (start + 28 >= total) {
        end = total - start;
        nextBtn.style.display = 'none'; //TODO
        nextBtn.onclick = '';
    } else {
        end = 28;
        nextBtn.style.display = 'inline';
        nextBtn.onclick = function() {
            loadLayerThumbnails(pageNum + 1);
        }
    }
    // Change page num
    var pageNumDisplay = document.querySelector('.layer-thumbnails-nav-page');
    pageNumDisplay.innerHTML = 'Page ' + pageNum;

    // Clear cells
    var layerThumbnails = document.querySelectorAll('.layer-thumbnails__row__cell');
    var layerThumbnailsImgs = document.querySelectorAll('.layer-thumbnails__row__cell__img');
    for (i = 0; i < 28; i++) {
        layerThumbnails[i].classList.remove('layer-thumbnails__row__cell--unselected');
        // TEMPORARY
        layerThumbnails[i].textContent = '';
        // layerThumbnailsImgs[i].src = '';
        layerThumbnails[i].onclick = '';
    }
    // Populate cells
    for (i = 0; i < end; i++) (function(i){
        layerThumbnails[i].classList.add('layer-thumbnails__row__cell--unselected');
        if (layerSelected == 'background') {
            if (i == 0) {
                layerThumbnails[i].textContent = 'Solid Color';
            }
            else if (i == 1) {
                layerThumbnails[i].textContent = 'Gradient 1';
            }
            else if (i == 2) {
                layerThumbnails[i].textContent = 'Gradient 2';
            }
            else if (i == 3) {
                layerThumbnails[i].textContent = 'Gradient 3';
            }
            else {
                layerThumbnails[i].textContent = layerSelected + ' ' + (i + start + 1); // TEMPORARY
                // layerThumbnailsImgs[i].src = 'png/thumbnail/' + layerSelected + '/' + layerSelected + '-' + (i + start) + '.png';
            }
        }
        else {
            layerThumbnails[i].textContent = layerSelected + ' ' + (i + start + 1); // TEMPORARY
            // layerThumbnailsImgs[i].src = 'png/thumbnail/' + layerSelected + '/' + layerSelected + '-' + (i + start) + '.png';
        }
        layerThumbnails[i].onclick = function() {
            setIndexAndDraw(layerThumbnails[i], (i + start));
        }
    })(i);

    // Remove previously selected layer thumbnail if present
    var prevSelected = document.querySelector('.layer-thumbnails__row__cell--selected');
    if (prevSelected != null) {
        prevSelected.classList.remove('layer-thumbnails__row__cell--selected');
    }
    // Highlight selected layer thumbnail if present
    if (selectedIndex[layerSelected] >= start && selectedIndex[layerSelected] < start + end) {
        var currentSelected = layerThumbnails[selectedIndex[layerSelected] % 28];
        currentSelected.classList.add('layer-thumbnails__row__cell--selected');
    }
}

function chooseLayer(button) {
    var thumbnailContainer = document.querySelector('.layer-thumbnails-container');
    var thumbnailNavContainer = document.querySelector('.layer-thumbnails-nav-container');

    disablePalette();
    if (lastClicked == button) {
        // Click the same button twice
        layerSelected = null;
        button.classList.remove('layers__btn--selected');
        button.classList.add('layers__btn--unselected');
        thumbnailContainer.style.display = 'none'; //TODO
        thumbnailNavContainer.style.display = 'none'; //TODO
        lastClicked = null;
    } else {
        if (lastClicked == null) {
            lastClicked = button;
        }
        layerSelected = button.value.toLowerCase().replace(' ','-');
        loadLayerThumbnails(Math.round(selectedIndex[layerSelected]/28) + 1); // Page of selected layer thumbnail
        lastClicked.classList.remove('layers__btn--selected');
        lastClicked.classList.add('layers__btn--unselected');
        button.classList.remove('layers__btn--unselected');
        button.classList.add('layers__btn--selected');
        thumbnailContainer.style.display = 'flex'; //TODO
        thumbnailNavContainer.style.display = 'flex'; //TODO
        lastClicked = button;
    }

    // Add/remove or enable/disable color palettes
    // var bitcampPalette = document.querySelector('.palette--bitcamp');
    var skinPalette = document.querySelector('.palette--skin');
    var hairPalette = document.querySelector('.palette--hair');
    // bitcampPalette.style.display = 'flex';
    skinPalette.style.display = 'none';
    hairPalette.style.display = 'none';

    if (layerSelected == 'face') {
        // Change color palette
        // bitcampPalette.style.display = 'none';
        skinPalette.style.display = 'flex';
    }
    if (layerSelected == 'hair' || layerSelected == 'eyebrows' || layerSelected == 'facial-hair') {
        // Change color palette
        hairPalette.style.display = 'flex';
        enablePalette();
    }
    if (layerSelected == 'background') {
        enablePalette();
    }
    if (layerSelected != null && layerSelected.includes('accessory')) {
        enablePalette();
    }

    var dpadToolContainer = document.querySelector('.d-pad-tools');

    if (layerSelected == 'eyebrows' || layerSelected == 'eyes') {
        dpadToolContainer.style.display = 'flex';
    }
    else {
        dpadToolContainer.style.display = 'none';
    }
}

function setIndexAndDraw(currentSelected, index) {
    // currentSelected == layer thumbnail div clicked
    // index finds the correct image

    if (selectedIndex[layerSelected] == index) {
        if (layerSelected != 'background') {
            eraseLayer();
            // Double clicking removes color (functions same as erase layer button)
            if (layerColor[layerSelected] != 'fixed') {
                layerColor[layerSelected] = 'default';
            }
        }
    }
    else if (selectedIndex[layerSelected] != index) {
        // Remove previously selected layer thumbnail if present
        eraseLayer();
        // Highlight selected layer thumbnail
        currentSelected.classList.add('layer-thumbnails__row__cell--selected');
        selectedIndex[layerSelected] = index;
        if (layerSelected == 'background') {
            drawBackground(layerColor['background']);
        }
        else if (layerColor[layerSelected] != 'fixed' && layerColor[layerSelected] != 'default') {
        	changeColor(layerColor[layerSelected]);
        }
        else {
        	drawDefaultImg();
        }
    }
}

function openPalette(button) {
    var palette = document.querySelector('.palette');
    if (palette.style.display == 'flex') {
        button.classList.remove('layers__btn--selected');
        button.classList.add('layers__btn--unselected');
        palette.style.display = 'none'; //TODO
        palette.style.borderRight = '0px'; //TODO
    } else {
        button.classList.remove('layers__btn--unselected');
        button.classList.add('layers__btn--selected');
        palette.style.display = 'flex'; //TODO
        palette.style.borderRight = '16px solid white'; //TODO
    }
}

function disablePalette() {
    var paletteColors = document.querySelectorAll('.palette__color');
    for(i = 0; i < 12; i++) {
        paletteColors[i].style.opacity = '0.6';
    }
}

function enablePalette() {
    var paletteColors = document.querySelectorAll('.palette__color');
    for(i = 0; i < 12; i++) {
        paletteColors[i].style.opacity = '1.0';
    }
}

function changeColor(colorSelected) {
    // TODO: Make unique for background?...
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        if (layerColor[layerSelected] != 'fixed') {
            var layer = document.querySelector('.layer--' + layerSelected);
            var ctx = layer.getContext('2d');
            ctx.globalCompositeOperation = "source-over"; // I don't know why this works
            ctx.clearRect(0, 0, canvasX, canvasY);
            var imgColor = new Image();
            imgColor.onload = function() {
                var imgOutline = new Image();
                ctx.drawImage(imgColor, 0, 0);
                ctx.globalCompositeOperation = "source-atop";
                ctx.fillStyle = colorSelected;
                ctx.fillRect(0, 0, canvasX, canvasY);
                imgOutline.onload = function() {
                    ctx.drawImage(imgOutline, 0, 0);
                }
                imgOutline.onerror = function() {
                    changeColor(colorSelected);
                }
                // Change file name for accessories
                if (layerSelected.includes('accessory')) {
                    imgOutline.src = 'png/accessory/accessory-outline-' + selectedIndex[layerSelected] + '.png';
                } else {
                    imgOutline.src = 'png/' + layerSelected + '/' + layerSelected + '-outline-' + selectedIndex[layerSelected] + '.png';
                }
            }
            imgColor.onerror = function() {
                changeColor(colorSelected);
            }
            // Change file name for accessories
            if (layerSelected.includes('accessory')) {
                imgColor.src = 'png/accessory/accessory-color-' + selectedIndex[layerSelected] + '.png';
            } else {
                imgColor.src = 'png/' + layerSelected + '/' + layerSelected + '-color-' + selectedIndex[layerSelected] + '.png';
            }
            layerColor[layerSelected] = colorSelected;
        }
    }
}

function drawDefaultImg() {
    // TODO: Disable for background and some layers
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        var layer = document.querySelector('.layer--' + layerSelected);
        var ctx = layer.getContext('2d');
        ctx.clearRect(0, 0, canvasX, canvasY);
        ctx.globalCompositeOperation = "source-over"; // I don't know why this works
        if (layerColor[layerSelected] != 'fixed') {
            // Draw default color
            var imgColor = new Image();
            imgColor.onload = function() {
                ctx.drawImage(imgColor, 0, 0);
                var imgOutline = new Image();
                imgOutline.onload = function() {
                    ctx.drawImage(imgOutline, 0, 0);
                }
                imgOutline.onerror = function() {
                    drawDefaultImg();
                }
                if (layerSelected.includes('accessory')) {
                    imgOutline.src = 'png/accessory/accessory-outline-' + selectedIndex[layerSelected] + '.png';
                } else {
                    imgOutline.src = 'png/' + layerSelected + '/' + layerSelected + '-outline-' + selectedIndex[layerSelected] + '.png';
                }
            }
            imgColor.onerror = function() {
                drawDefaultImg();
            }
            // Change file name for accessories
            if (layerSelected.includes('accessory')) {
                imgColor.src = 'png/accessory/accessory-color-' + selectedIndex[layerSelected] + '.png';
            } else {
                imgColor.src = 'png/' + layerSelected + '/' + layerSelected + '-color-' + selectedIndex[layerSelected] + '.png';
            }
            layerColor[layerSelected] = 'default';
        } else {
            var img = new Image();
            img.onload = function() {
                if (layerSelected == 'eyebrows' || layerSelected == 'eyes') {
                    ctx.drawImage(img, 0 + layerWidth[layerSelected], 0, canvasX/2, canvasY, 0, 0, canvasX/2, canvasY); // Right eye
                    ctx.drawImage(img, canvasX/2 - layerWidth[layerSelected], 0, canvasX/2, canvasY, canvasX/2, 0, canvasX/2, canvasY); // Left eye
                }
                else {
                    ctx.drawImage(img, 0, 0);
                }
            }
            img.onerror = function() {
                drawDefaultImg();
            }
            img.src = 'png/' + layerSelected + '/' + layerSelected + '-' + selectedIndex[layerSelected] + '.png';
        }
    }
}

function drawBackground(colorSelected) {
    if (selectedIndex != -1) {
        layerColor['background'] = colorSelected;
        if (selectedIndex['background'] == 0) {
            // Solid color
            drawSolidBackground(colorSelected);
        }
        if (selectedIndex['background'] == 1) {
            // Gradient
            drawGradientBackground(colorSelected, 4);
        }
        if (selectedIndex['background'] == 2) {
            // Gradient
            drawGradientBackground(colorSelected, 2);
        }
        if (selectedIndex['background'] == 3) {
            // Gradient
            drawGradientBackground(colorSelected, 1);
        }
    }
}

function drawDefaultBackground() {
    var backgroundLayer = document.querySelector('.layer--background');
    var ctx = backgroundLayer.getContext('2d');
    for (i = 0; i < multiplier; i++) {
      for (j = 0; j < multiplier; j++) {
        ctx.fillStyle = 'rgb(' + Math.floor(255 - 4 * i) + ', ' +
            Math.floor(175 - 8 * j) + ', ' + 63 + ')';
        ctx.fillRect(j * canvasX, i * canvasY, canvasX, canvasY);
      }
    }
}

function drawSolidBackground(colorSelected) {
    var backgroundLayer = document.querySelector('.layer--background');
    var ctx = backgroundLayer.getContext('2d');
    ctx.clearRect(0, 0, canvasX*multiplier, canvasY*multiplier);
    ctx.fillStyle = colorSelected;
    ctx.fillRect(0, 0, canvasX*multiplier, canvasY*multiplier);
}

function drawGradientBackground(colorSelected, factor) {
    var rgb = colorSelected.match(/\d+/g);
    var backgroundLayer = document.querySelector('.layer--background');
    var ctx = backgroundLayer.getContext('2d');
    ctx.clearRect(0, 0, canvasX*multiplier, canvasY*multiplier);
    for (i = 0; i < multiplier/factor; i++) {
      for (j = 0; j < multiplier/factor; j++) {
        ctx.fillStyle = 'rgb(' + Math.floor(rgb[0] - 4*i) + ', ' +
            Math.floor(rgb[1] - 2*i) + ', ' + rgb[2] + ')';
        ctx.fillRect(j * canvasX*factor, i * canvasY*factor, canvasX*factor, canvasY*factor);
      }
    }
}

function changePosition(button) {
    // TODO: Disable for background
    var dPad = document.querySelector('.d-pad-container');
    if (dPad.style.display == 'flex') {
        button.classList.remove('layers__btn--selected');
        button.classList.add('layers__btn--unselected');
        dPad.style.display = 'none'; //TODO
        dPad.style.borderRight = '0px'; //TODO
    } else {
        button.classList.remove('layers__btn--unselected');
        button.classList.add('layers__btn--selected');
        dPad.style.display = 'flex'; //TODO
        dPad.style.borderRight = '16px solid white'; //TODO
    }
}

function resetPosition() {
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        if (layerSelected != 'background') {
            var layer = document.querySelector('.layer--' + layerSelected);
            var ctx = layer.getContext('2d');
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvasX, canvasY);
            if (layerColor[layerSelected] == 'default' || layerColor[layerSelected] == 'fixed') {
                drawDefaultImg();
            } else {
                changeColor(layerColor[layerSelected]);
            }
        }
    }
}

function translateLayer(x,y) {
    // TODO: Disable for background
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        var layer = document.querySelector('.layer--' + layerSelected);
        var ctx = layer.getContext('2d');
        // Erase + copy to current layer
        ctx.clearRect(0, 0, canvasX, canvasY);
        ctx.translate(x,y);
        if (layerColor[layerSelected] == 'default' || layerColor[layerSelected] == 'fixed') {
            drawDefaultImg();
        } else {
            changeColor(layerColor[layerSelected]);
        }
    }
}

function changeWidth(x) {
    // The greater x is, the wider
    if (selectedIndex[layerSelected] != -1) {
        if (layerWidth[layerSelected] + x >= -2 && layerWidth[layerSelected] + x <= 2) {
            layerWidth[layerSelected] = layerWidth[layerSelected] + x;
        }
        drawDefaultImg();
    }
}

function eraseLayer() {
    if (layerSelected != null) {
        if (layerSelected != 'background') {
            var layer = document.querySelector('.layer--' + layerSelected);
            var ctx = layer.getContext('2d');
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvasX, canvasY);

            if (layerSelected == 'eyebrows' || layerSelected == 'eyes') {
                layerWidth[layerSelected] = 0;
            }
        }
        else {
            drawDefaultBackground();
        }
        // Remove previously selected layer thumbnail if present
        var prevSelected = document.querySelector('.layer-thumbnails__row__cell--selected');
        if (prevSelected != null) {
            prevSelected.classList.remove('layer-thumbnails__row__cell--selected');
        }
            selectedIndex[layerSelected] = -1;
    }
}

function eraseAll() {
    var layers = document.querySelectorAll('.layer--exportable');
    for (i = 1; i < layers.length; i++) // Do not delete first layer (background) yet... 
    {
        var ctx = layers[i].getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvasX, canvasY);
    }
    drawDefaultBackground();

    var prevSelected = document.querySelector('.layer-thumbnails__row__cell--selected');
    if (prevSelected != null) {
        prevSelected.classList.remove('layer-thumbnails__row__cell--selected');
    }
    selectedIndex = {'face': -1, 'hair': -1, 'eyebrows': -1, 'eyes': -1, 'nose': -1, 'mouth': -1, 'facial-hair': -1, 'accessory-1': -1, 'accessory-2': -1, 'accessory-3': -1, 'background': -1}; // Indices start at 0, -1 == nothing selected
    layerColor = {'face': 'default', 'hair': 'default', 'eyebrows': 'fixed', 'eyes': 'fixed', 'nose': 'fixed', 'mouth': 'fixed', 'facial-hair': 'default', 'accessory-1': 'default', 'accessory-2': 'default', 'accessory-3': 'default', 'background': 'rgb(255, 175, 63)'};
}

function saveImg() {
    var layers = document.querySelectorAll('.layer--exportable');
    var saveLayer = document.querySelector('.layer--save');
    var ctx = saveLayer.getContext('2d');
    ctx.save();
    ctx.drawImage(layers[0], 0, 0); //Background does not need rescale
    ctx.scale(multiplier, multiplier);
    for (i = 1; i < layers.length; i++)
    {
        ctx.drawImage(layers[i],0,0);
    }
    var exportedImg = saveLayer.toDataURL('image/png').replace('image/png', 'image/octet-stream'); //Convert image to 'octet-stream' (Just a download, really)
    var a = document.createElement('a');
    a.download = 'sprite.png';
    a.href = exportedImg;
    a.click();
    ctx.clearRect(0, 0, 512, 512);
    ctx.restore();
}
