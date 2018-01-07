var buttons_menu_top;
var layerSelected;
var lastClicked;
var totalLayerOptions = {'face': 0, 'hair': 0, 'eyes': 0, 'nose': 0, 'mouth': 0, 'accessories': 0, 'background': 0};
var selectedIndex = {'face': -1, 'hair': -1, 'eyes': -1, 'nose': -1, 'mouth': -1, 'accessories': -1, 'background': -1}; // Indeces start at 0! -1 == nothing selected
var layerColor = {'face': 'default', 'hair': 'default', 'eyes': 'default', 'nose': 'default', 'mouth': 'default','accessories': 'default', 'background': 'default'};

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
        resetColor();
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

function loadLayerOptions(pageNum) {
    var prevBtn = document.querySelector('.layer-options-nav__btn--prev');
    var nextBtn = document.querySelector('.layer-options-nav__btn--next');

    var total = totalLayerOptions[layerSelected];
    var start = (pageNum - 1) * 28; // Absolute index (0 to total)
    var end; // Relative index to div (0 to 28)

    // Hide/show prev btn
    if (start == 0) {
        prevBtn.style.display = 'none';
        prevBtn.onclick = '';
    } else {
        prevBtn.style.display = 'inline';
        prevBtn.onclick = function() {
            loadLayerOptions(pageNum - 1);
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
            loadLayerOptions(pageNum + 1);
        }
    }
    // Change page num
    var pageNumDisplay = document.querySelector('.layer-options-nav-page');
    pageNumDisplay.innerHTML = 'Page ' + pageNum;

    // Clear cells
    var layerOptions = document.querySelectorAll('.layer-options__row__cell');
    var layerOptionsImgs = document.querySelectorAll('.layer-options__row__cell__img');
    for (i = 0; i < 28; i++) {
        layerOptions[i].classList.remove('layer-options__row__cell--unselected');
        layerOptionsImgs[i].src = '';
        layerOptions[i].onclick = '';
    }
    // Populate cells
    for (i = 0; i < end; i++) (function(i){
        layerOptions[i].classList.add('layer-options__row__cell--unselected');
        layerOptionsImgs[i].src = layerSelected + '-' + i + '.png';
        layerOptions[i].onclick = function() {
            draw(layerOptions[i], i + start);
        }
    })(i);

    // Remove previously selected layer option if present
    var prevSelected = document.querySelector('.layer-options__row__cell--selected');
    if (prevSelected != null) {
        prevSelected.classList.remove('layer-options__row__cell--selected');
    }
    // Highlight selected layer option if present
    if (selectedIndex[layerSelected] >= start && selectedIndex[layerSelected] < start + end) {
        var currentSelected = layerOptions[selectedIndex[layerSelected] % 28];
        currentSelected.classList.add('layer-options__row__cell--selected');
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
        loadLayerOptions(Math.round(selectedIndex[layerSelected]/28) + 1); // Page of selected layer option
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
    else if (layerSelected == 'eyes') {
        // Change color palette
    }
    else if (layerSelected == 'mouth') {
        // Change color palette
    }
}

function draw(currentSelected, index) {
    // currentSelected == layer option div clicked
    // index finds the correct image

    if (selectedIndex[layerSelected] != index) {
        var layer = document.querySelector('.layer--' + layerSelected);
        var ctx = layer.getContext('2d');
        ctx.clearRect(0, 0, 32, 32);
        var img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        }
        img.src = layerSelected + '-' + index + '.png'
        layerColor[layerSelected] = 'default';

        // Remove previously selected layer option if present
        var prevSelected = document.querySelector('.layer-options__row__cell--selected');
        if (prevSelected != null) {
            prevSelected.classList.remove('layer-options__row__cell--selected');
        }
        // Highlight selected layer option
        currentSelected.classList.add('layer-options__row__cell--selected');
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
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        var layer = document.querySelector('.layer--' + layerSelected);
        var ctx = layer.getContext('2d');
        ctx.clearRect(0, 0, 32, 32);
        var imgColor = new Image();
        imgColor.onload = function() {
            ctx.drawImage(imgColor, 0, 0);
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = colorSelected;
            ctx.fillRect(0, 0, 32, 32);
        }
        imgColor.src = layerSelected + '-color-' + selectedIndex[layerSelected] + '.png';
        var imgOutline = new Image();
        imgOutline.onload = function() {
            ctx.drawImage(imgOutline, 0, 0);
        }
        imgOutline.src = layerSelected + '-outline-' + selectedIndex[layerSelected] + '.png';
        layerColor[layerSelected] = colorSelected;
    }
}

function resetColor() {
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        var layer = document.querySelector('.layer--' + layerSelected);
        var ctx = layer.getContext('2d');
        ctx.clearRect(0, 0, 32, 32);
        var img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        }
        img.src = layerSelected + '-' + selectedIndex[layerSelected] + '.png'
        layerColor[layerSelected] = 'default';
    }
}

function changePosition(button) {
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
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        var layer = document.querySelector('.layer--' + layerSelected);
        var ctx = layer.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, 32, 32);
        if (layerColor[layerSelected] == 'default') {
            resetColor();
        } else {
            changeColor(layerColor[layerSelected]);
        }
    }
}

function translateLayer(x,y) {
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        var layer = document.querySelector('.layer--' + layerSelected);
        var ctx = layer.getContext('2d');
        // Erase + copy to current layer
        ctx.clearRect(0, 0, 32, 32);
        ctx.translate(x,y);
        if (layerColor[layerSelected] == 'default') {
            resetColor();
        } else {
            changeColor(layerColor[layerSelected]);
        }
    }
}

function eraseLayer() {
    if (layerSelected != null) {
        var layer = document.querySelector('.layer--' + layerSelected);
        var ctx = layer.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, 32, 32);
    }

    // Remove previously selected layer option if present
    var prevSelected = document.querySelector('.layer-options__row__cell--selected');
    if (prevSelected != null) {
        prevSelected.classList.remove('layer-options__row__cell--selected');
    }
    selectedIndex[layerSelected] = -1;
}

function eraseAll() {
    var layers = document.querySelectorAll('.layer--exportable');
    for (i = 1; i < layers.length; i++) // Do not delete first layer (background) 
    {
        var ctx = layers[i].getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, 32, 32);
    }

    var prevSelected = document.querySelector('.layer-options__row__cell--selected');
    if (prevSelected != null) {
        prevSelected.classList.remove('layer-options__row__cell--selected');
    }
    selectedIndex = {'face': -1, 'hair': -1, 'accessories': -1, 'eyes': -1, 'nose': -1, 'mouth': -1};
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
