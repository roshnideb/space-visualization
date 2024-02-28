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

//preload- need this for images and other stuff
//only using 1000 values for now. switch dataset later
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

    font = loadFont('/fonts/Arial.ttf');

    earthimg = loadImage('/imgs/earthlightsbw.png');

    
}

//setup
function setup() {
    createCanvas(windowWidth,windowHeight,WEBGL);
    calculateGlobeSize();
    calculateArticleHeight();
    earth = createGlobe(globeSize);
    textFont(font);
    
}

//draw.. uhhh this keeps looping. i think
function draw() {
    background(0,0,10);
    
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
            orbitControl(2,2,0);
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
// something for the background.. stars ?





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
            
            push();
            
            rotateY(radians(article.longitude + orbitAngle) + PI); 
            rotateX(radians(article.latitude + orbitAngle));
            //switch the mod to random nums
            translate((i%10)-5,(i%10)-5,earth.radius + t);
            

            if (article.orbitLife >= 1000) {
                if (article.opacity > 0) {
                    article.opacity-=0.5;
                } 
            }
            //console.log(article.opacity);
            fill(hexToRGB(color)[0],hexToRGB(color)[1],hexToRGB(color)[2], article.opacity);

            
            sphere(2);
            pop();
            
        }
    };
    return drawn_article;
}

function drawStars(articles) {
    articles.forEach(function(cv, i, articles) {
        
        push();
            
        rotateY(radians(cv.longitude) + PI); // <-- update these lines for the orbiting animation?
        rotateX(radians(cv.latitude));
        translate(cv.rx + (i%10)-5,cv.ry + (i%50)-7,2000+cv.rz);
        fill(255);
        sphere(2);
        pop();
        
    })
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