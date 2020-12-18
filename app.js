let canvas = document.getElementById('canvas'),
ctx = canvas.getContext('2d'),
output = document.querySelector('.color'),
recentColorsDiv = document.querySelector('.recent-colors'),
recentColors = [],
noti = document.querySelector('.notify'),
canvasImage;

window.onload = drawImageOnCanvas(false, 'https://ziadevcom.github.io/colorz-picker/demo.jpg')

// function to draw image on canvas
function drawImageOnCanvas(input, img){
        input ? url = URL.createObjectURL(input.target.files[0]) : url = img
        const image = new Image();
        image.src =  url
        image.onload = function(){
            let hRatio = canvas.width / image.width,
            vRatio = canvas.height / image.height,
            ratio  = Math.max(hRatio,vRatio );
            ctx.drawImage(image, 0,0, image.width, image.height, 0,0,image.width*ratio, image.height*ratio);
        }
        canvasImage=image;
}

// function that identifies the color on mouse move
const getColorMouseMove = function(evt){
    hex = extractColor(evt)
    output.style.background = hex;
    output.nextElementSibling.innerText = hex;
}

// function that identifies the color on click
const getColorMouseClick = function(e){
    hex = extractColor(e)
    output.nextElementSibling.innerText = hex;
    copyColor(hex)
    recentColors.unshift(hex)
    showRecentColors();
    notify(hex);
}

//  function to extract pixel data and convert to hex
function extractColor(evt){
    let {data} = ctx.getImageData(evt.offsetX, evt.offsetY, 1, 1),
    rgb = `rgb(${data[0]}, ${data[1]}, ${data[2]})`
    return RGBToHex(rgb)
}

// function to display recent colors on screen
function showRecentColors(color){
    console.log(recentColors);
    recentColorsDiv.innerHTML = ''
    if(recentColors.length<=0){
        return;
    }else{
        recentColors.slice(0, 18).forEach(color=>{
            let span = document.createElement('span');
            span.classList.add('color');
            span.style.backgroundColor = color;
            span.setAttribute('onclick', 'getRecentColorCode(this)')
            recentColorsDiv.appendChild(span);
        })
    }
}

// Get Recent Color onclick color selector
function getRecentColorCode(el){
    let rgb = window.getComputedStyle(el).getPropertyValue('background-color')
    let bgColor = RGBToHex(rgb)
    copyColor(bgColor);
    notify(bgColor)
}

// function to copy the color on click
function copyColor(color){
    let elem = document.createElement("textarea");
    document.body.appendChild(elem);
    elem.value = color;
    elem.select();
    document.execCommand("copy");
    document.body.removeChild(elem);
}

// function to convert rgb to hex
function RGBToHex(color) {
    // Choose correct separator
    let sep = color.indexOf(",") > -1 ? "," : " ";
    // Turn "color(r,g,b)" into [r,g,b]
    color = color.substr(4).split(")")[0].split(sep);
  
    let r = (+color[0]).toString(16),
        g = (+color[1]).toString(16),
        b = (+color[2]).toString(16);

    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    return "#" + r + g + b;
  }

// function to create notifications
function notify(color){
    noti.innerText = `Copied the code: ${color}`;
    noti.style.background = color;
    noti.className = 'notify shadow show animated slideInRight'
    setTimeout(()=>{
        noti.className='notify shadow show animated slideOutRight'
    }, 1000)
}
// This feature is the zoom and dragging one and i just copied it, i dont know shit about how this works
window.onload = function(){		
    
		trackTransforms(ctx);
		  
        function redraw(){
          // Clear the entire canvas
          var p1 = ctx.transformedPoint(0,0);
          var p2 = ctx.transformedPoint(canvas.width,canvas.height);
          ctx.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);

          ctx.save();
          ctx.setTransform(1,0,0,1,0,0);
          ctx.clearRect(0,0,canvas.width,canvas.height);
          ctx.restore();

          ctx.drawImage(canvasImage,0,0);

        }
        redraw();

      var lastX=canvas.width/2, lastY=canvas.height/2;

      var dragStart,dragged;

      canvas.addEventListener('mousedown',function(evt){
          lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
          lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
          dragStart = ctx.transformedPoint(lastX,lastY);
          dragged = false;
      },false);

      canvas.addEventListener('mousemove',function(evt){
          lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
          lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
          dragged = true;
          if (dragStart){
            var pt = ctx.transformedPoint(lastX,lastY);
            ctx.translate(pt.x-dragStart.x,pt.y-dragStart.y);
            redraw();
                }
      },false);

      canvas.addEventListener('mouseup',function(evt){
          dragStart = null;
        //   if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
      },false);

      var scaleFactor = 1.1;

      var zoom = function(clicks){
          var pt = ctx.transformedPoint(lastX,lastY);
          ctx.translate(pt.x,pt.y);
          var factor = Math.pow(scaleFactor,clicks);
          ctx.scale(factor,factor);
          ctx.translate(-pt.x,-pt.y);
          redraw();
      }

      var handleScroll = function(evt){
          var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
          if (delta) zoom(delta);
          return evt.preventDefault() && false;
      };
    
      canvas.addEventListener('DOMMouseScroll',handleScroll,false);
      canvas.addEventListener('mousewheel',handleScroll,false);
	};
	
	// Adds ctx.getTransform() - returns an SVGMatrix
	// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
function trackTransforms(ctx){
      var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
      var xform = svg.createSVGMatrix();
      ctx.getTransform = function(){ return xform; };

      var savedTransforms = [];
      var save = ctx.save;
      ctx.save = function(){
          savedTransforms.push(xform.translate(0,0));
          return save.call(ctx);
      };
    
      var restore = ctx.restore;
      ctx.restore = function(){
        xform = savedTransforms.pop();
        return restore.call(ctx);
		      };

      var scale = ctx.scale;
      ctx.scale = function(sx,sy){
        xform = xform.scaleNonUniform(sx,sy);
        return scale.call(ctx,sx,sy);
		      };
    
      var rotate = ctx.rotate;
      ctx.rotate = function(radians){
          xform = xform.rotate(radians*180/Math.PI);
          return rotate.call(ctx,radians);
      };
    
      var translate = ctx.translate;
      ctx.translate = function(dx,dy){
          xform = xform.translate(dx,dy);
          return translate.call(ctx,dx,dy);
      };
    
      var transform = ctx.transform;
      ctx.transform = function(a,b,c,d,e,f){
          var m2 = svg.createSVGMatrix();
          m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
          xform = xform.multiply(m2);
          return transform.call(ctx,a,b,c,d,e,f);
      };
    
      var setTransform = ctx.setTransform;
      ctx.setTransform = function(a,b,c,d,e,f){
          xform.a = a;
          xform.b = b;
          xform.c = c;
          xform.d = d;
          xform.e = e;
          xform.f = f;
          return setTransform.call(ctx,a,b,c,d,e,f);
      };
    
      var pt  = svg.createSVGPoint();
      ctx.transformedPoint = function(x,y){
          pt.x=x; pt.y=y;
          return pt.matrixTransform(xform.inverse());
      }
}