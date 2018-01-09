var buttons_menu_top;
var layerSelected;
var lastClicked;
var totalLayerThumbnails = {'face': 1, 'hair': 1, 'eyebrows': 1, 'eyes': 1, 'nose': 1, 'mouth': 1, 'accessories': 1, 'background': 0};
var selectedIndex = {'face': -1, 'hair': -1, 'eyebrows': -1, 'eyes': -1, 'nose': -1, 'mouth': -1, 'accessories': -1, 'background': -1}; // Indices start at 0! -1 == nothing selected
var layerColor = {'face': 'default', 'hair': 'default', 'eyebrows': 'default', 'eyes': 'fixed', 'nose': 'fixed', 'mouth': 'fixed','accessories': 'fixed', 'background': 'default'};

window.onload = function setup() {
    //Set up tool buttons
    var eraseLayerBtn = document.querySelector('.tools__btn--erase-layer');
    eraseLayerBtn.onclick = function() {
        eraseLayer();
    }
    var eraseAllBtn = document.querySelector('.tools__btn--erase-all');
    eraseAllBtn.onclick = function() {
        eraseAll();
    }
    var changeColorBtn = document.querySelector('.tools__btn--change-color');
    changeColorBtn.onclick = function() {
        openPalette(this);
    }
    var paletteColors = document.querySelectorAll('.palette__color');
    for (i = 0; i < paletteColors.length; i++) {
        paletteColors[i].onclick = function() {
            changeColor(getComputedStyle(this).backgroundColor);
        }
    }
    var resetColorBtn = document.querySelector('.tools__btn--reset-color');
    resetColorBtn.onclick = function() {
        drawDefaultImg();
    }
    var changePositionBtn = document.querySelector('.tools__btn--change-position');
    changePositionBtn.onclick = function() {
        changePosition(this);
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
        resetPosition(resetPositionBtn);
    }
    var exportBtn = document.querySelector('.tools__btn--export');
    exportBtn.onclick = function() {
        exportImg();
    }

    //Set up layer buttons
    var layersBtns = document.querySelectorAll('.layers__btn');
    for (i = 0; i < layersBtns.length; i++) {
        layersBtns[i].onclick = function(){
            chooseLayer(this);
        }
    }
    //Set up canvas background
    var backgroundLayer = document.querySelector('.layer--background');
    var ctx = backgroundLayer.getContext('2d');
    for (i = 0; i < 32; i++) {
      for (j = 0; j < 32; j++) {
        ctx.fillStyle = 'rgb(' + Math.floor(255 - 10 * i) + ', ' +
            Math.floor(255 - 10 * j) + ', 0)';
        ctx.fillRect(j * 25, i * 25, 25, 25);
      }
    }
}

function loadLayerThumbnails(pageNum) {
    var prevBtn = document.querySelector('.layer-thumbnails-nav__btn--prev');
    var nextBtn = document.querySelector('.layer-thumbnails-nav__btn--next');

    var total = totalLayerThumbnails[layerSelected];
    var start = (pageNum - 1) * 28; // Absolute index (0 to total)
    var end; // Relative index to div (0 to 28)

    // Hide/show prev btn
    if (start == 0) {
        prevBtn.style.display = 'none';
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
        nextBtn.style.display = 'none';
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
        // TEMPORARY
        layerThumbnails[i].textContent = 'Alex\'s ' + layerSelected;
        // layerThumbnailsImgs[i].src = 'png/thumbnail/' + layerSelected + '/' + layerSelected + '-' + i + '.png';
        layerThumbnails[i].onclick = function() {
            setIndex(layerThumbnails[i], i + start);
            drawDefaultImg();
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
    var rightSidebarPopup = document.querySelector('.right-sidebar-popup');
    if (lastClicked == button) {
        //Click the same button twice
        layerSelected = null;
        button.classList.remove('layers__btn--selected');
        button.classList.add('layers__btn--unselected');
        rightSidebarPopup.style.display = 'none'; //TODO
        lastClicked = null;
    } else {
        if (lastClicked == null) {
            lastClicked = button;
        }
        layerSelected = button.value.toLowerCase();
        loadLayerThumbnails(Math.round(selectedIndex[layerSelected]/28) + 1); // Page of selected layer thumbnail
        lastClicked.classList.remove('layers__btn--selected');
        lastClicked.classList.add('layers__btn--unselected');
        button.classList.remove('layers__btn--unselected');
        button.classList.add('layers__btn--selected');
        rightSidebarPopup.style.display = 'flex'; //TODO
        lastClicked = button;
    }
    if (layerSelected == 'face') {
        // Change color palette
    }
}

function setIndex(currentSelected, index) {
    // currentSelected == layer thumbnail div clicked
    // index finds the correct image

    if (selectedIndex[layerSelected] != index) {
        // Remove previously selected layer thumbnail if present
        var prevSelected = document.querySelector('.layer-thumbnails__row__cell--selected');
        if (prevSelected != null) {
            prevSelected.classList.remove('layer-thumbnails__row__cell--selected');
        }
        // Highlight selected layer thumbnail
        currentSelected.classList.add('layer-thumbnails__row__cell--selected');
        selectedIndex[layerSelected] = index;
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

function changeColor(colorSelected) {
    // TODO: Make unique for background?...
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        if (layerColor[layerSelected] != 'fixed') {
            var layer = document.querySelector('.layer--' + layerSelected);
            var ctx = layer.getContext('2d');
            ctx.globalCompositeOperation = "source-over"; // I don't know why this works
            ctx.clearRect(0, 0, 64, 64);
            var imgColor = new Image();
            imgColor.onload = function() {
                ctx.drawImage(imgColor, 0, 0);
                ctx.globalCompositeOperation = "source-atop";
                ctx.fillStyle = colorSelected;
                ctx.fillRect(0, 0, 64, 64);
            }
            imgColor.src = 'png/' + layerSelected + '/' + layerSelected + '-color-' + selectedIndex[layerSelected] + '.png';
            var imgOutline = new Image();
            imgOutline.onload = function() {
                ctx.drawImage(imgOutline, 0, 0);
            }
            imgOutline.src = 'png/' + layerSelected + '/' + layerSelected + '-outline-' + selectedIndex[layerSelected] + '.png';
            layerColor[layerSelected] = colorSelected;
        }
    }
}

function drawDefaultImg() {
    // TODO: Disable for background and some layers
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        var layer = document.querySelector('.layer--' + layerSelected);
        var ctx = layer.getContext('2d');
        ctx.clearRect(0, 0, 64, 64);
        if (layerColor[layerSelected] != 'fixed') {
            var imgColor = new Image();
            imgColor.onload = function() {
                ctx.drawImage(imgColor, 0, 0);
            }
            imgColor.src = 'png/' + layerSelected + '/' + layerSelected + '-color-' + selectedIndex[layerSelected] + '.png';
            var imgOutline = new Image();
            imgOutline.onload = function() {
                ctx.drawImage(imgOutline, 0, 0);
            }
            imgOutline.src = 'png/' + layerSelected + '/' + layerSelected + '-outline-' + selectedIndex[layerSelected] + '.png';
            layerColor[layerSelected] = 'default';
        } else {
            var img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            }
            img.src = 'png/' + layerSelected + '/' + layerSelected + '-' + selectedIndex[layerSelected] + '.png';
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

function resetPosition(button) {
    // TODO: Disable for background
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        var layer = document.querySelector('.layer--' + layerSelected);
        var ctx = layer.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, 64, 64);
        if (layerColor[layerSelected] == 'default' || layerColor[layerSelected] == 'fixed') {
            drawDefaultImg();
        } else {
            changeColor(layerColor[layerSelected]);
        }
    }
}

function translateLayer(x,y) {
    // TODO: Disable for background
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        var layer = document.querySelector('.layer--' + layerSelected);
        var ctx = layer.getContext('2d');
        // Erase + copy to current layer
        ctx.clearRect(0, 0, 64, 64);
        ctx.translate(x,y);
        if (layerColor[layerSelected] == 'default' || layerColor[layerSelected] == 'fixed') {
            drawDefaultImg();
        } else {
            changeColor(layerColor[layerSelected]);
        }
    }
}

function eraseLayer() {
    // TODO: Reset to default background layer if erased.
    if (layerSelected != null) {
        if (layerSelected != 'background') {
            var layer = document.querySelector('.layer--' + layerSelected);
            var ctx = layer.getContext('2d');
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, 64, 64);
        }
    }

    // Remove previously selected layer thumbnail if present
    var prevSelected = document.querySelector('.layer-thumbnails__row__cell--selected');
    if (prevSelected != null) {
        prevSelected.classList.remove('layer-thumbnails__row__cell--selected');
    }
    selectedIndex[layerSelected] = -1;
}

function eraseAll() {
    var layers = document.querySelectorAll('.layer--exportable');
    for (i = 1; i < layers.length; i++) // Do not delete first layer (background) yet... 
    {
        var ctx = layers[i].getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, 64, 64);
    }

    var prevSelected = document.querySelector('.layer-thumbnails__row__cell--selected');
    if (prevSelected != null) {
        prevSelected.classList.remove('layer-thumbnails__row__cell--selected');
    }
    selectedIndex = {'face': -1, 'hair': -1, 'eyebrows': -1, 'eyes': -1, 'nose': -1, 'mouth': -1, 'accessories': -1, 'background': -1};
}

function exportImg() {
    var layers = document.querySelectorAll('.layer--exportable');
    var exportLayer = document.querySelector('.layer--export');
    var ctx = exportLayer.getContext('2d');
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.drawImage(layers[0],0,0); //Background does not need rescale
    ctx.scale(16,16);
    for (i = 1; i < layers.length; i++)
    {
        ctx.drawImage(layers[i],0,0);
    }
    //Export dialog needs work
    var exportedImg = exportLayer.toDataURL('image/png').replace('image/png', 'image/octet-stream'); //Convert image to 'octet-stream' (Just a download, really)
    // window.location.href = exportedImg;
    ctx.clearRect(0, 0, 512, 512);
    ctx.restore();
}
