var loginStatus;
var buttons_menu_top;
var layerSelected;
var lastClicked;
var totalLayerThumbnails = {'face': 4, 'hair': 2, 'eyebrows': 1, 'eyes': 10, 'nose': 2, 'mouth': 2, 'facial-hair': 0, 'accessory-1': 2, 'accessory-2': 2, 'accessory-3': 2, 'background': 12};
var selectedIndex = {'face': -1, 'hair': -1, 'eyebrows': -1, 'eyes': -1, 'nose': -1, 'mouth': -1, 'facial-hair': -1, 'accessory-1': -1, 'accessory-2': -1, 'accessory-3': -1, 'background': -1}; // Indices start at 0, -1 == nothing selected
var layerColor = {'face': 'default', 'hair': 'default', 'eyebrows': 'fixed', 'eyes': 'fixed', 'nose': 'fixed', 'mouth': 'fixed', 'facial-hair': 'default', 'accessory-1': 'default', 'accessory-2': 'default', 'accessory-3': 'default', 'background': 'rgb(255, 175, 63)'};
var layerFlipped = {'hair': 1, 'eyebrows': 1, 'nose': 1, 'mouth': 1, 'facial-hair': 1, 'accessory-1': 1, 'accessory-2': 1, 'accessory-3': 1};
var layerWidth = {'eyebrows': 0, 'eyes': 0}
multiplier = 16;
var canvasX = 32;
var canvasY = 32;

window.onload = function setup() {
	// Intro
    // var introBtn = document.querySelector('.intro__btn');
    // introBtn.onclick =  function() {
    // 	var thumbnailContainer = document.querySelector('.layer-thumbnails-container');
    // 	var thumbnailNavContainer = document.querySelector('.right-sidebar-nav-container');
    // 	thumbnailContainer.style.display = 'flex';
    // 	thumbnailNavContainer.style.display = 'flex';
    // }

    // Set up tool buttons
    var eraseLayerBtn = document.querySelector('.main-tools__btn--erase-layer');
    eraseLayerBtn.onclick = function() {
        if (layerSelected != 'background') {
        	eraseLayer();
            if (layerColor[layerSelected] != 'fixed') {
                layerColor[layerSelected] = 'default';
            }
        }
        else {
        	layerColor = 'rgb(255, 175, 63)';
        	drawDefaultBackground();
        }
        disablePalette();
    }
    var eraseAllBtn = document.querySelector('.main-tools__btn--erase-all');
    eraseAllBtn.onclick = function() {
        eraseAll();
        disablePalette();
    }
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
    var widenBtn = document.querySelector('.move-tools__btn--widen');
    widenBtn.onclick = function() {
        changeWidth(1);
    }
    var narrowBtn = document.querySelector('.move-tools__btn--narrow');
    narrowBtn.onclick = function() {
        changeWidth(-1);
    }
    var flipBtn = document.querySelector('.move-tools__btn--flip');
    flipBtn.onclick = function() {
        flip();
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
    disableDPad();
    var resetPositionBtn = document.querySelector('.main-tools__btn--reset-position');
    resetPositionBtn.onclick = function() {
        resetPosition();
    }
    var saveBtn = document.querySelector('.export-tools__btn--save');
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
        if (i == 0 || i == layers.length - 1) { // Background + Save layer full size
	        layers[i].width = canvasX*multiplier;
	        layers[i].height = canvasY*multiplier;
        } 
        else {
	        layers[i].width = canvasX;
	        layers[i].height = canvasY;
        }
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
    }

    // Set up canvas background
    drawDefaultBackground();

    // Disable palette
    disablePalette();

    // Set up Facebook app
    window.fbAsyncInit = function() {
        FB.init({
            appId      : '182304785885707',
            cookie     : true,
            xfbml      : true,
            version    : 'v2.12'
        });
          
        FB.AppEvents.logPageView();
	    FB.getLoginStatus(function(response) {
			loginStatus = response.status;
	    });
    };

    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s); js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
    } (document, 'script', 'facebook-jssdk'));

    var shareBtn = document.querySelector('.export-tools__btn--share');
    shareBtn.onclick = function() {
  		// FB.AppEvents.logEvent('Shared Sprite');
    	shareImg();
    }
}

function loadLayerThumbnails(pageNum) {
    var prevBtn = document.querySelector('.right-sidebar-nav__btn--prev');
    var nextBtn = document.querySelector('.right-sidebar-nav__btn--next');

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
    var pageNumDisplay = document.querySelector('.right-sidebar-nav-page-num');
    pageNumDisplay.innerHTML = 'Page ' + pageNum;

    // Clear cells
    var layerThumbnails = document.querySelectorAll('.layer-thumbnails__row__cell');
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
            else if (i == 4) {
                layerThumbnails[i].textContent = 'Campfire 1';
            }
            else if (i == 5) {
                layerThumbnails[i].textContent = 'Campfire 1';
            }
            else if (i == 6) {
                layerThumbnails[i].textContent = 'Campfire 3';
            }
            else if (i == 7) {
                layerThumbnails[i].textContent = 'Campfire 4';
            }
            else if (i == 8) {
                layerThumbnails[i].textContent = 'Sprite Bomb 1';
            }
            else if (i == 9) {
                layerThumbnails[i].textContent = 'Sprite Bomb 2';
            }
            else if (i == 10) {
                layerThumbnails[i].textContent = 'Sprite Bomb 3';
            }
            else if (i == 11) {
                layerThumbnails[i].textContent = 'Sprite Bomb 4';
            }
        }
        else {
            // layerThumbnails[i].textContent = layerSelected + ' ' + (i + start + 1); // TEMPORARY
            if (layerColor[layerSelected] != 'fixed') {
	            var imgColor = document.createElement('img');
                if (layerSelected.includes('accessory')) {
	            	imgColor.setAttribute('src', 'png/accessory/accessory-color-' + (i + start) + '.png');
                } 
                else {
	            	imgColor.setAttribute('src', 'png/' + layerSelected + '/' + layerSelected + '-color-' + (i + start) + '.png');
	        	}
	            imgColor.setAttribute('height',canvasX*2);
	            imgColor.setAttribute('width',canvasX*2);
	            imgColor.classList.add('layer-thumbnails__row__cell__img');
	            layerThumbnails[i].appendChild(imgColor);
	            var imgOutline = document.createElement('img');
                if (layerSelected.includes('accessory')) {
	            	imgOutline.setAttribute('src', 'png/accessory/accessory-outline-' + (i + start) + '.png');
                } 
                else {
	            	imgOutline.setAttribute('src', 'png/' + layerSelected + '/' + layerSelected + '-outline-' + (i + start) + '.png');
	        	}
	            imgOutline.setAttribute('height',canvasX*2);
	            imgOutline.setAttribute('width',canvasX*2);
	            imgOutline.classList.add('layer-thumbnails__row__cell__img');
	            layerThumbnails[i].appendChild(imgOutline);
            }
            else {
	            var img = document.createElement('img');
	            img.setAttribute('src', 'png/' + layerSelected + '/' + layerSelected + '-' + (i + start) + '.png');
	            img.setAttribute('height',canvasX*2);
	            img.setAttribute('width',canvasX*2);
	            img.classList.add('layer-thumbnails__row__cell__img');
	            layerThumbnails[i].appendChild(img);
            }
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
    var thumbnailNavContainer = document.querySelector('.right-sidebar-nav-container');

    // if (lastClicked == button) {
    //     // Click the same button twice
    //     layerSelected = null;
    //     button.classList.remove('layers__btn--selected');
    //     button.classList.add('layers__btn--unselected');
    //     thumbnailContainer.style.display = 'none'; //TODO
    //     thumbnailNavContainer.style.display = 'none'; //TODO
    //     lastClicked = null;
    // 	disablePalette();
    // } else {
	if (lastClicked != button) { // New
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
	    if (selectedIndex[layerSelected] != -1 && layerColor[layerSelected] != 'fixed') {
	    	enablePalette();
	    }
	    else {
	    	disablePalette();
	    }
    }

    // Add/remove or enable/disable color palettes
    // var bitcampPalette = document.querySelector('.palette--bitcamp');
    var skinPalette = document.querySelector('.palette--skin');
    var hairPalette = document.querySelector('.palette--hair');
    skinPalette.style.display = 'none';
    hairPalette.style.display = 'none';

    if (layerSelected == 'face') {
        // Change color palette
        // bitcampPalette.style.display = 'none';
        skinPalette.style.display = 'flex';
    }
    else if (layerSelected == 'hair' || layerSelected == 'eyebrows' || layerSelected == 'facial-hair') {
        // Change color palette
        hairPalette.style.display = 'flex';
    }
    // else {
    //     bitcampPalette.style.display = 'flex';
    // }
}

function setIndexAndDraw(currentSelected, index) {
    // currentSelected == layer thumbnail div clicked
    // index finds the correct image

    if (layerColor[layerSelected] != 'fixed') {
    	enablePalette();
    }

    if (selectedIndex[layerSelected] == index) {
        if (layerSelected != 'background') {
        	disablePalette();
            eraseLayer();
            // Double clicking removes color (functions same as erase layer button)
            if (layerColor[layerSelected] != 'fixed') {
                layerColor[layerSelected] = 'default';
            }
        } else {
        	drawBackground(layerColor['background']);
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

function disablePalette() {
    var paletteColors = document.querySelectorAll('.palette__color');
    for(i = 0; i < paletteColors.length; i++) {
        paletteColors[i].style.opacity = '0.6'; // Maybe I should make a class for this?
        paletteColors[i].onclick = function() {
        	return false;
		}
    }
}

function enablePalette() {
    var paletteColors = document.querySelectorAll('.palette__color');
    for(i = 0; i < paletteColors.length; i++) {
        paletteColors[i].style.opacity = '1.0';
        paletteColors[i].onclick = function() {
	        var colorSelected = String(getComputedStyle(this).backgroundColor);
	        if (layerSelected == 'background') {
	            drawBackground(colorSelected); // Replaces prev color
	        } else {
	            changeColor(colorSelected); // rgb(#,#,#)
	        }
		}
    }
}

function disableDPad() {
    var dPadBtns = document.querySelectorAll('.d-pad__btn');
    for(i = 0; i < dPadBtns.length; i++) {
        dPadBtns[i].classList.add('d-pad__btn--disabled');
    }
}

function enableDPad() {
    var dPadBtns = document.querySelectorAll('.d-pad__btn');
    for(i = 0; i < dPadBtns.length; i++) {
        dPadBtns[i].classList.remove('d-pad__btn--disabled');
    }
}

function changeColor(colorSelected) {
    // TODO: Make unique for background?...
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        if (layerColor[layerSelected] != 'fixed') {
            var layer = document.querySelector('.layer--' + layerSelected);
            var ctx = layer.getContext('2d');
            ctx.globalCompositeOperation = 'source-over'; // I don't know why this works
            ctx.clearRect(0, 0, canvasX, canvasY);
            var imgColor = new Image();
            imgColor.onload = function() {
                var imgOutline = new Image();
                ctx.drawImage(imgColor, 0, 0);
                ctx.globalCompositeOperation = 'source-atop';
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
        ctx.globalCompositeOperation = 'source-over'; // I don't know why this works
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
        var backgroundLayer = document.querySelector('.layer--background');
	    var ctx = backgroundLayer.getContext('2d');
	    ctx.setTransform(1, 0, 0, 1, 0, 0);
	    ctx.clearRect(0, 0, 512, 512);
        if (selectedIndex['background'] == 0) {
            // Solid color
            drawSolidBackground(colorSelected);
        }
        else if (selectedIndex['background'] == 1) {
            // Gradient
            drawGradientBackground(colorSelected, 4);
        }
        else if (selectedIndex['background'] == 2) {
            // Gradient
            drawGradientBackground(colorSelected, 2);
        }
        else if (selectedIndex['background'] == 3) {
            // Gradient
            drawGradientBackground(colorSelected, 1);
        }
        else if (selectedIndex['background'] >= 3 && selectedIndex['background'] <= 12) {
        	drawSolidBackground(colorSelected);
        	if (selectedIndex['background'] == 4) {
        		drawCampfireBackground(false, false);
        	}
        	if (selectedIndex['background'] == 5) {
        		drawCampfireBackground(true, false);
        	}
        	if (selectedIndex['background'] == 6) {
        		drawCampfireBackground(false, true);
        	}
        	if (selectedIndex['background'] == 7) {
        		drawCampfireBackground(true, true);
        	}
        }
    }
}

function drawDefaultBackground() {
    var backgroundLayer = document.querySelector('.layer--background');
    var ctx = backgroundLayer.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
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

function drawCampfireBackground(randomSize, rotation) {
    var backgroundLayer = document.querySelector('.layer--background');
	var ctx = backgroundLayer.getContext('2d');
	ctx.translate(canvasX*multiplier/2,canvasY*multiplier/2);
	var campfire = new Image();
	campfire.onload = function() {
		for (i = 1; i < 160; i++) {
			// RANDOMNESS
			var randSize = Math.floor((Math.random()*2)*4)*Math.floor(Math.random()*8) + 16;
			var randAngle = Math.floor(Math.random()*-3 + 6);
			var randX = Math.floor((Math.random()*-32)*16 + 256);
			var randY = Math.floor((Math.random()*-32)*16 + 256);
			if (!randomSize && !rotation) {
				ctx.drawImage(campfire, randX, randY, 32, 32);
			}
			if (randomSize && !rotation) {
				ctx.drawImage(campfire, randX, randY, randSize, randSize);
			}
			if (!randomSize && rotation) {
				ctx.rotate((i+randAngle)*2*Math.PI/120);
				ctx.drawImage(campfire, -50, -200 - 1.1*i, 32, 32);
			}
			if (randomSize && rotation) {
				ctx.rotate(i*2*Math.PI/120);
				ctx.drawImage(campfire, -50, -200 - 1.1*i, randSize, randSize);
			}
		}
		// if (rotation) {
		// 	drawSpotlight();
		// }
   	}
	campfire.src = 'svg/background/campfire.svg';
}

function drawSpotlight() {
	// Assume canvas translated to center
    var backgroundLayer = document.querySelector('.layer--background');
	var ctx = backgroundLayer.getContext('2d');
	var gradient = ctx.createRadialGradient(0,0,160,0,0,280);
	// var gradient1 = ctx.createRadialGradient(0, 0, 10, 10, 10, 100);
	// var rgba = layerColor['background'];
	// rgba = rgba.replace('rgb(', 'rgba(');
	// rgba = rgba.replace(')', '');
	// gradient.addColorStop(0, rgba + ', .8)');
	// gradient.addColorStop(1, rgba + ', .05)');
	gradient.addColorStop(0,'rgba(255, 255, 255, .7)');
	gradient.addColorStop(1,'rgba(255, 255, 255, .05)');
	ctx.fillStyle = gradient;
	ctx.setTransform(1, 0, 0, 1, 256, 256);
	ctx.fillRect(-256,-256, 512, 512);
	ctx.translate(canvasX*multiplier/2,canvasY*multiplier/2);
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

function flip() {
	if (layerSelected != null && selectedIndex[layerSelected] != -1) {
	    var layer = document.querySelector('.layer--' + layerSelected);
	    var ctx = layer.getContext('2d');
	    ctx.scale(-1,1);
	    drawDefaultImg();
	    translateLayer(-32,0);

	    var dPadLeftBtn = document.querySelector('.d-pad__btn--left');
	    var dPadRightBtn = document.querySelector('.d-pad__btn--right');
	    layerFlipped[layerSelected]*=-1;
	    dPadLeftBtn.onclick = function() {
	        translateLayer(-1*layerFlipped[layerSelected],0);
	    }
	    dPadRightBtn.onclick = function() {
	        translateLayer(1*layerFlipped[layerSelected],0);
	    }
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
	var exportedImg = imgToDataURI();
    restoreSaveLayer();
    var a = document.createElement('a');
    a.download = 'sprite.png';
    a.href = exportedImg;
    a.click();
}

function imgToDataURI() {
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
    return saveLayer.toDataURL('image/png').replace('image/png', 'image/octet-stream'); //Convert image to 'octet-stream' (Just a download, really)
}

function dataURIToBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: 'image/png'});
}

function restoreSaveLayer() {
	var saveLayer = document.querySelector('.layer--save');
	var ctx = saveLayer.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);
    ctx.restore();
}

function disableToolBtn(text) {
    var toolBtn = document.querySelector(text);
    toolBtn.classList.add('export-tools__btn--selected');
    toolBtn.onclick = function() {
		return false;
    }
}

function enableToolBtn(text, toolFunction) {
    var toolBtn = document.querySelector(text);
    toolBtn.classList.remove('export-tools__btn--selected');
    toolBtn.onclick = toolFunction;
}

function shareImg() {
	disableToolBtn('.export-tools__btn--share');
    if (loginStatus != 'connected') {
        FB.login(function(loginResponse) {
        	if (loginResponse.authResponse) {
	    		FB.api('/me/permissions', function(permissionsResponse) {
	    			var permission = checkShareImgPermissions(permissionsResponse.data);
		            if (permission) {
		                shareImgAuth();
		            } else {
		                unauthResponse();
		            }
    			});

        	}
        	else {
        		unauthResponse();
        	}
        }, {scope: 'publish_actions'});
    }
    else {
		FB.api('/me/permissions', function(permissionsResponse) {
			disableToolBtn('.export-tools__btn--share');
			var permission = checkShareImgPermissions(permissionsResponse.data);
            if (permission) {
                shareImgAuth();
            } else {
                unauthResponse();
            }
		});
    }
}

function shareImgAuth() {
    var exportedImg = imgToDataURI();
    restoreSaveLayer();
	var imgBlob = dataURIToBlob(exportedImg);
	var accessToken = FB.getAuthResponse().accessToken;
    var fd = new FormData();
    fd.append('access_token', accessToken);
    fd.append('source', imgBlob);
    fd.append('no_story', true);

	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://graph.facebook.com/photos?access_token=' + accessToken);
	// Define what happens on successful data submission
	xhr.onload = function() {
	    if (xhr.status === 200) {
	    	alert('Successfully uploaded to Facebook!');
			console.log(xhr);
	    	var photoID = JSON.parse(xhr.responseText).id;
	    	console.log('Photo ID: ' + photoID);
			var xhr2 = new XMLHttpRequest();
			xhr2.open('GET', 'https://graph.facebook.com/' + photoID + '?fields=images&access_token=' + accessToken);
			xhr2.onload = function() {
				console.log(xhr2);
				var images = JSON.parse(xhr2.responseText).images;
				var sourceURL = images[0].source;
				console.log(sourceURL);

				// TEMPORARY
				// PROFILE PICTURES ALBUM IS NOT VISIBLE
				// FB.api(
				// '/me/albums',
				// function (response) {
				// 	if (response && !response.error) {
				// 		console.log(response.data);
				// 		for (i = 0; i < response.data.length; i++) {
				// 			if (response.data[i].name == 'Profile Pictures') {
				// 				var albumID = response.data[i].id;

				// 				xhr = new XMLHttpRequest();
				// 				xhr.open('GET', 'https://graph.facebook.com/' + photoID);

				// 				FB.api(
				// 				    '/' + albumID + '/photos',
				// 				    'POST',
				// 				    {
				// 				        'url': sourceURL
				// 				    },
				// 				    function (response) {
				// 			      		if (response && !response.error) {
				// 				        /* handle the result */
				// 			      		}
				// 			      		else {
				// 			      			console.log(response.error);
				// 			      		}
				// 				    }
				// 				);
				// 			}
				// 		}
				// 	}
				// 	else {
				// 		console.log(response.error);
				// 	}
				// });
			}
			xhr2.send();

			// FB.api(
			//     '/me/feed',
			//     'POST',
			//     {
			//         'message': 'This is a test message',
			//         'object_attachment': photoID
			//     },
			//     function (response) {
			// 		if (response && !response.error) {
			// 			alert('Successfully posted!');
			// 		}
			// 		else {
			// 			console.log(response.error);
			// 		}
			//     }
			// );

	    	// Move/delete?
	  //   	FB.api(
			//     '/' + photoID,
			//     'DELETE',
			//     function (response) {
			// 		if (response && !response.error) {
			// 			alert('Successfully deleted!');
			// 		}
			// 		else {
			// 			console.log(response.error);
			// 		}
			//     }
			// );
	    }
	    else {
	    	console.log(xhr.responseText);
	    }
    	enableToolBtn('.export-tools__btn--share', function() {shareImg()});
	};
	xhr.send(fd);
}

function setProfileImg() {
    if (loginStatus != 'connected' || !checkSetProfilePermissions()) {
        FB.login(function(response) {
            if (response.authResponse && checkSetProfilePermissions()) {
                // setProfileAuth();
            } else {
                unauthResponse();
            }
        }, {scope: 'publish_actions,user_photos'});
    }
    else {
    	// setProfileAuth();
    }
}

function setProfileAuth() {
    FB.api(
    '/me/albums',
    function (response) {
		if (response && !response.error) {
			console.log(response.data);
			for (album in response.data) {

			}
		}
		else console.log(response.error);
    });
}

function unauthResponse() {
    alert('User cancelled login or did not fully authorize.');
    enableToolBtn('.export-tools__btn--share', function() {shareImg()}); // TODO: Change for set profile pic?
}

function checkShareImgPermissions(responseData) {
	for (i = 0; i < responseData.length; i++) { 
		if (responseData[i].permission == 'publish_actions') {
		 	if (responseData[i].status == 'granted') {
		 		return true;
		 	}
		}
	}
}

function checkSetProfilePermissions() {
	var publishStatus = false;
	var photoStatus = false;
	for (i = 0; i < response.data.length; i++) { 
		if (response.data[i].permission == 'publish_actions') {
		 	if (response.data[i].status == 'granted') {
		 		publishStatus = true;
		 	}
		}
		else if (response.data[i].permission == 'user_photos') {
		 	if (response.data[i].status == 'granted') {
		 		photoStatus = true;
		 	}
		}
	}
	return publishStatus && photoStatus;
}