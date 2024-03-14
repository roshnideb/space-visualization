//global variables
let earth;
let globeSize;
let articles;

let articleh;

let prevMX;
let prevMY;

let angleX = 0;
let angleY = 0;
let angleZ = 0;
let permanent_angle_x = 0;
let permanent_angle_y = 0;

tooltipVisible = false;
tooltipContent = "";

let time = 0;
let offset = 0;

let incrementTime = true;

let rotatesX = false;
let rotatesY = false;
let rotatesZ = false;

let currentYear = 2015;
let disappearingYear = 2015;


let ellipses = [
    { color: '#ff6961', radius: 2, group: 'launch' },
    { color: '#ffb480', radius: 2, group: 'satellite'},
    { color: '#f8f38d', radius: 2, group: 'habitat'},
    { color: '#42d6a4', radius: 2, group: 'data and analytics' },
    { color: '#08cad1', radius: 2, group: 'propulsion' },
    { color: '#59adf6', radius: 2, group: 'planetary' },
    { color: '#9d94ff', radius: 2, group: 'exploration' },
    { color: '#c780e8', radius: 2, group: '' }
  ];

//preload- need this for images and other stuff
function preload() {
    d3.csv('data/spaceheatmap_locations.csv').then(function(data) {
        //data wrangling
        articles = data.map(function(d) {
            return {
                date: new Date(d.date),
                title: d['title'],
                url: d['url'],
                source: d['source'],
                group: d['group'],
                locations: d['locations'],
                latitude: +d['latitude'],
                longitude: +d['longitude'],
                rx: random(-1000,1000),
                ry: random(-1000,1000),
                rz: random(-100,100),
                orbitLife: 0,
                opacity: 5,
                getCreated: 0,
            }
        });

        articles.sort(function(a,b) {
            return a.date - b.date;
        });

    })

    font = loadFont('/fonts/LEMONMILK-Light.otf');

    earthimg = loadImage('/imgs/earthlights1k.jpg');

    
}

//setup
function setup() {
    createCanvas(windowWidth,windowHeight,WEBGL);
    calculateGlobeSize();
    calculateArticleHeight();
    earth = createGlobe(globeSize);
    textFont(font);
    
    
}

//svg stuff (menus, legends)
document.addEventListener('DOMContentLoaded',function() {
    svg = d3.select("#legendsvg")
        //.append("g")
        .attr("width",window.innerWidth)
        .attr("height",window.innerHeight);
        

    drawLegend();

})

function drawLegend() {
    circX = window.innerWidth/27
    circY = window.innerHeight - 250
    circR = 5
    svg.selectAll('legendcircle')
        .data(ellipses)
        .enter()
        .append('circle')
            .attr('cx', circX)
            .attr('cy', function(d,i) { console.log(i);return circY + i*30})
            .attr('r', 5)
            .style('fill', function(d) { return d.color})
            .on('click', function(d,i) {
                
                if (circR==5) {
                    d3.select(this).attr('r',8);
                    circR=8;
                    i.radius = 3
                    console.log(ellipses)
                }
                else {
                    d3.select(this).attr('r',5);
                    circR=5;
                    i.radius = 2
                }
                
            })
        

    svg.selectAll('legendtext')
        .data(ellipses)
        .enter()
        .append('text')
            .attr('x', circX + 20)
            .attr('y', function(d,i) { return circY + i*30 + 6})
            .text(function(d) { return d.group})
            .style('fill','white')
            .style('opacity',0.8)
}

//draw.. uhhh this keeps looping. i think
function draw() {
    background(0,0,10);
    
    push();
    camera(0, 0, windowHeight, 0, 0, 0, 0, 1, 0)
    drawYears();
    pop();
    

    orbitControl(2,2,0);
    earth.draw();
    drawStars(articles);
    drawArticles();
    
    drawTooltip();
    

    //for starting animation
    if (incrementTime) {
        time++;
    }

    
    
}

//create the globe
function createGlobe(radius) {
    let globe = {
        radius: radius,
        draw: function() {
            //stroke(255);
            //orbitControl(2,2,0);
            noStroke();
            //fill(0);
            texture(earthimg);
            if (rotatesX) {
                angleX+= 0.01;
                
            }
            if (rotatesY) {
                angleY += 0.01;
                
            }
            if (rotatesZ) {
                angleZ += 0.01;
                
            }
            rotateX(angleX);
            rotateY(angleY);
            rotateZ(angleZ);
            
            sphere(this.radius);
        }
    };
    return globe;
}

function keyPressed() {
    if (key === ' ') {
        incrementTime = !incrementTime;
    }
    if (key === 'r') {
        time=0;
        articles.forEach(function(cv, i, articles) {
            cv.opacity = 255;
            cv.orbitLife = 0;
            
        })
    }
    if (key === 'x') {
        rotatesX = !rotatesX;
    }
    if (key === 'y') {
        rotatesY = !rotatesY;
    }
    if (key === 'z') {
        rotatesZ = !rotatesZ;
    }
}


//got rid of rotation functions here


// TO DO
// different objects for the spheres representing articles
// TRAILS??
// https://editor.p5js.org/kimberlypatton1774/sketches/7nUfLy17T
// try to figure this out for materials and trails
// shaders






//draw . the points (spheres?) representing the articles
function drawArticles() {
    articles.forEach(function(cv, i, articles) {
        if (cv.opacity > 0 && i < time) {
            
            createArticle(cv,i).draw();
            
            
        }
        
    })
}


function createArticle(article, i) {
    let drawn_article = {
        article: article,
        i: i,
        draw: function() {
            
            let t = 0;
            let mintime = 10;
            let orbitAngle = 0;
            let additionalHeight = sourceToAscii(article.source, i);
            //articles are on the earth
            if (time-i <= mintime) {
                article.opacity += 25;
                if (article.opacity==255) {
                    currentYear = article.date.getFullYear();
                }
                t = 0;
            }
            //articles are orbiting
            else if (time-i > articleh + additionalHeight) {
                t = articleh + additionalHeight - mintime;
                orbitAngle = time - i  - articleh - additionalHeight
                if (incrementTime) {
                    article.orbitLife++;
                }
                
            }
            //articles are moving up
            else {
                t = time - i - mintime;
            }
            
            let color = chooseColor(article.group);
            let rad = chooseRad(color);
            push();
            
            rotateY(radians(article.longitude + orbitAngle) + PI); 
            rotateX(radians(article.latitude + orbitAngle));
            //switch the mod to random nums
            translate((i%10)-5,(i%10)-5,earth.radius + t);
            

            if (article.orbitLife >= 1000) {
                if (article.opacity > 0) {
                    article.opacity-=5;
                    if (article.opacity == 0) {
                        disappearingYear = article.date.getFullYear();
                        
                    }
                } 
            }
            
            fill(hexToRGB(color)[0],hexToRGB(color)[1],hexToRGB(color)[2], article.opacity);

           
            sphere(rad);
            
            pop();
            
        }
    };
    return drawn_article;
}

function drawStars(articles) {
    articles.forEach(function(cv, i, articles) {
        
        push();
            
        rotateY(radians(cv.longitude) + PI);
        rotateX(radians(cv.latitude));
        translate(cv.rx + (i%10)-5,cv.ry + (i%50)-7,2000+cv.rz);
        fill(255);
        sphere(2);
        pop();
        
    })
}

function drawYears() {
    x = windowWidth/2;
    y = 0 - (windowHeight/2) +　30;
    inc = Math.abs(y)/4
    for (let year = 2015; year <= 2023; year++) {
        if (year<= currentYear && year >= disappearingYear) {
            fill(255,255,255,255);
        }
        else {
            fill(255,255,255,100);
        }
        textSize(20);
        textAlign(CENTER, CENTER);
        text(year,x,y);
        y+= inc;
    }
    

}

//this is not working
function drawTooltip() {
    if (tooltipVisible) {
        console.log('hello');
        fill(255);
        rect(mouseX, mouseY, 150, 50);
        fill(0);
        text(tooltipContent, mouseX+10, mouseY+ 20);
    }
}


//some functions to make stuff work

//calculate globe size. 10% of the smaller edge of the screen
function calculateGlobeSize() {
    globeSize = min(windowWidth, windowHeight) * 0.1;
}

function calculateArticleHeight() {
    articleh = (min(windowWidth, windowHeight)) / 4;
}

//resize window
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    calculateGlobeSize();
    earth.radius = globeSize;
}


//func to choose color. later change to change the shape of the object
function chooseColor(grp) {
    switch (grp) {
        case 'launch':
            return '#ff6961';
        case 'satellite':
            return '#ffb480';
        case 'habitat':
            return '#f8f38d';
        case 'data and analytics':
            return '#42d6a4';
        case 'propulsion':
            return '#08cad1'
        case 'planetary':
            return '#59adf6'
        case 'exploration':
            return '#9d94ff'
        default:
            return '#c780e8'
            

    }
}

function sourceToAscii(src, a) {
    ascii = 0;
    for (let i = 0; i < src.length; i++) {
        ascii += src.charCodeAt(i);
    }
    //let rv = Math.random() * 10 - 5;
    return ascii/20 + ((a%10)-5);
}

function hexToRGB(color) {
    color = color.replace('#','');

    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);

    return [r,g,b];
}

function chooseRad(color) {
    var ellipse = ellipses.find(function(d) {
        return d.color == color
    })
    return ellipse.radius
}