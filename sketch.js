//global variables
let earth;
let globeSize;
let articles;
let counts;


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

let squareX = window.innerWidth/2;
let squareY = 0 - (window.innerHeight/2) + 30;
let squareInc = Math.abs(squareY)/4

let redsphere;

let panimg;

let ellipses = [
    { color: '#ff6961', radius: 2, group: 'launch' },
    { color: '#ffb480', radius: 2, group: 'satellite'},
    { color: '#f8f38d', radius: 2, group: 'habitat'},
    { color: '#42d6a4', radius: 2, group: 'data and analytics' },
    { color: '#08cad1', radius: 2, group: 'propulsion' },
    { color: '#59adf6', radius: 2, group: 'planetary' },
    { color: '#9d94ff', radius: 2, group: 'exploration' },
   // { color: '#c780e8', radius: 2, group: '' }
  ];

  /*let ellipses = [
    { color: '#ff4e50', radius: 2, group: 'launch' },
    { color: '#f9d423', radius: 2, group: 'satellite'},
    { color: '#f9fea5', radius: 2, group: 'habitat'},
    { color: '#20e2d7', radius: 2, group: 'data and analytics' },
    { color: '#00ecbc', radius: 2, group: 'propulsion' },
    { color: '#007adf', radius: 2, group: 'planetary' },
    { color: '#6713d2', radius: 2, group: 'exploration' },
    { color: '#cc208e', radius: 2, group: '' }
  ];*/

//preload- need this for images and other stuff
function preload() {
    d3.csv('data/spaceheatmap_grps.csv').then(function(data) {
        articles = data.map(function(d) {
            return {
                id: +d['id'],
                date: new Date(d.date),
                year: new Date(d.date).getFullYear(),
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
                orbitX: 0,
                orbitY: 0,
            }
        });
    



        articles.sort(function(a,b) {
            return a.date - b.date;
        });

        

        
        

    })

    d3.csv('data/group_counts.csv').then(function(data) {
        counts = data.map(function(d) {
            return {
                year: +d['year'],
                analytics: +d['data and analytics'],
                exploration: +d['exploration'],
                habitat: +d['habitat'],
                launch: +d['launch'],
                planetary: +d['planetary'],
                propulsion: +d['propulsion'],
                satellite: +d['satellite'],
                total: +d['total'],

            }
        });
    })
    redsphere = loadModel('models/redsphere.obj');

    font = loadFont('/fonts/LEMONMILK-Light.otf');

    earthimg = loadImage('/imgs/earthlights1k.jpg');
    panimg = loadImage('/imgs/beautiful-shining-stars-night-sky.jpg');

    
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
    drawLine();

})

function drawLine() {
    var x = d3.scaleLinear().domain(d3.extent(counts, function(d) {return d.year;}))
        .range([0,width]);
    svg.append('g')
        .attr('transform', 'translate(0,' + 300 + ')')
        .style('stroke','#ddd')
        .call(d3.axisBottom(x).ticks(5));
}

function drawLegend() {
    //circX = window.innerWidth/27
    circX = 60;
    //circY = window.innerHeight - 250
    circY = window.innerHeight - 220;
    circR = 5
    svg.selectAll('.legendcircle1')
        .data(ellipses)
        .enter()
        .append('circle')
            // .attr('class','legendcircle1')
            .classed('legendcircle1', true)
            .attr('id', function(d,i) {
                if (d.group == 'data and analytics') {
                    return 'circle1data';
                }
                return 'circle1'+d.group;
            })
            .attr('cx', circX)
            .attr('cy', function(d,i) { return circY + i*30})
            .attr('r', 5)
            .style('fill', function(d) { return d.color})
            .style('stroke', function(d) { return d.color})
            .style('stroke-width',2)
            .attr('opacity',0.5)
            .on('click', function(d,i) {
                if (i.group == 'data and analytics') {
                    d3.select('#circle2data').attr('opacity',0.5);
                    d3.select('#circle3data').attr('opacity',0.5);
                    d3.select('#circle1data').attr('opacity',1);
                }
                else {
                    d3.select('#circle2' + i.group).attr('opacity',0.5);
                    d3.select('#circle3' + i.group).attr('opacity',0.5);
                    d3.select('#circle1' + i.group).attr('opacity',1);
                }
                
                i.radius=3
                
                
            })

    svg.selectAll('.legendcircle2')
        .data(ellipses)
        .enter()
        .append('circle')
            .attr('class','legendcircle2')
            .attr('id', function(d,i) {
                if (d.group == 'data and analytics') {
                    return 'circle2data';
                }
                return 'circle2'+d.group;
            })
            .attr('cx', circX -15)
            .attr('cy', function(d,i) { return circY + i*30})
            .attr('r', 5)
            .style('fill', function(d) { return d.color})
            .attr('opacity',1)
            .on('click', function(d,i) {
                if (i.group == 'data and analytics') {
                    d3.select('#circle1data').attr('opacity',0.5);
                    d3.select('#circle3data').attr('opacity',0.5);
                    d3.select('#circle2data').attr('opacity',1);
                }
                else {
                    d3.select('#circle1' + i.group).attr('opacity',0.5);
                    d3.select('#circle3' + i.group).attr('opacity',0.5);
                    d3.select('#circle2' + i.group).attr('opacity',1);
                }
                
                i.radius = 2
                    
            })
        
    svg.selectAll('.legendcircle3')
        .data(ellipses)
        .enter()
        .append('circle')
            .attr('class','legendcircle3')
            .attr('id', function(d,i) {
                if (d.group == 'data and analytics') {
                    return 'circle3data';
                }
                return 'circle3'+d.group;
            })
            .attr('cx', circX- 30)
            .attr('cy', function(d,i) { return circY + i*30})
            .attr('r', 4)
            .style('stroke', function(d) { return d.color})
            .attr('opacity',0.5)
            .on('click', function(d,i) {
                if (i.group == 'data and analytics') {
                    d3.select('#circle2data').attr('opacity',0.5);
                    d3.select('#circle1data').attr('opacity',0.5);
                    d3.select('#circle3data').attr('opacity',1);
                }
                else {
                    d3.select('#circle2' + i.group).attr('opacity',0.5);
                    d3.select('#circle1' + i.group).attr('opacity',0.5);
                    d3.select('#circle3' + i.group).attr('opacity',1);
                }
                
                i.radius = 0
                        
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

function drawYearDisplay() {
    textSize(20);
    textAlign(RIGHT, CENTER);
    fill("#ddd");
    if (currentYear==disappearingYear) {
        text("now displaying: " + currentYear, windowWidth/2 + 120, windowHeight/2 + 40);
    }
    else {
        text("now displaying: " + disappearingYear + " - " + currentYear, windowWidth/2 + 120 , windowHeight/2 + 40);
    }

    /*var ww = window.innerWidth;
    var wh = window.innerHeight;

    svg.select('yeartext')
        .append('text')
        .attr('x', ww-30)
        .attr('y', wh - 30)
        .attr("text-anchor", 'end')
        .text(function(d) {
            if (currentYear==disappearingYear) {
                return "now displaying: " + currentYear;
            }
            else {
                return "now displaying " + currentYear + " - " + disappearingYear;
            }
        })
        .style('fill','#ddd')*/
}


function draw() {
    background(0,0,10);
    //panorama(panimg);
    ambientLight(255);
    directionalLight(255, 200, 200, 1,0,0);
    push();
    camera(0, 0, windowHeight, 0, 0, 0, 0, 1, 0)
    //image(panimg,-windowWidth/2,-windowHeight/2);
    //drawYears();
    drawYearDisplay();
    pop();
    

    orbitControl(2,2,0);
    earth.draw();
    //drawStars(articles);
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
            cv.opacity = 5;
            cv.orbitLife = 0;
            cv.orbitX = 0;
            cv.orbitY = 0;
        })
        currentYear = 2015;
        disappearingYear = 2015;
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

// TO DO
// different objects for the spheres representing articles
// https://editor.p5js.org/kimberlypatton1774/sketches/7nUfLy17T







//draw . the points (spheres?) representing the articles
function drawArticles() {
    articles.forEach(function(cv, i, articles) {
        if (cv.opacity > 0 && i < time) {
            
            createArticle(cv,i).draw();
            //draw stars stuff
            push();
            ambientLight(255,255,255);
            directionalLight(255,255,255,0,0,1);
            rotateY(radians(cv.longitude) + PI);
            rotateX(radians(cv.latitude) + PI);
            translate(cv.rx + (i%10)-5,cv.ry + (i%50)-7,2000+cv.rz);
            fill(200, 200, 200, cv.opacity);
            sphere(2);
            pop();
            
            
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
                orbitAngle = time - i  - articleh - additionalHeight//this is also the amount of time the article has been orbiting
                if (incrementTime) {
                    article.orbitLife++;
                    article.orbitX += toAscii(article.locations);
                    article.orbitY += toAscii(article.locations) * 1.5;
                    //article.orbitX += toAscii(article.source);
                    //article.orbitY += toAscii(article.source);
                    //article.orbitX += 1;
                    //article.orbitY += 0.5;
                    
                }
                
                
            }
            //articles are moving up
            else {
                t = time - i - mintime;
            }
            
            let color = chooseColor(article.group);
            let rad = chooseRad(color);
            push();
            
            rotateY(radians(article.longitude + article.orbitX) + PI); 
            rotateX(radians(article.latitude + article.orbitY));
            //switch the mod to random nums
            //translate((i%10)-5,(i%10)-5,earth.radius + t);
            translate(article.rx/200, article.ry/200, earth.radius+t);
            

            if (article.orbitLife >= 1000) {
                if (article.opacity > 0) {
                    article.opacity-=5;
                    if (article.opacity == 0) {
                        disappearingYear = article.date.getFullYear();
                        if (articles[articles.length-1].id == article.id) {
                            console.log(time);
                            reset();
                        }
                    }
                } 
            }
            
            //fill(hexToRGB(color)[0],hexToRGB(color)[1],hexToRGB(color)[2], article.opacity);
            emissiveMaterial(hexToRGB(color)[0],hexToRGB(color)[1],hexToRGB(color)[2], article.opacity);
            //specularMaterial(hexToRGB(color)[0],hexToRGB(color)[1],hexToRGB(color)[2], article.opacity);
            sphere(rad);
            //model(redsphere);
            
            
            pop();

            /*push();
            camera(0, 0, windowHeight, 0, 0, 0, 0, 1, 0);
            
            let yr = 2015
            
            //article.date.getFullYear()
            fill(hexToRGB(color)[0],hexToRGB(color)[1],hexToRGB(color)[2])
            rect(squareX-i, squareY + (squareInc*(8 - (2023 - article.date.getFullYear()))), 1, 20);
            
            pop();*/
            
            
        }
    };
    return drawn_article;
}

function drawStars(articles) {
    articles.forEach(function(cv, i, articles) {
        if (cv.opacity > 0 && i <time) {
            push();
            
            rotateY(radians(cv.longitude) + PI);
            rotateX(radians(cv.latitude));
            translate(cv.rx + (i%10)-5,cv.ry + (i%50)-7,2000+cv.rz);
            fill(255, 255, 255, cv.opacity);
            sphere(2);
            pop();
        }
        
        
    })
}

function drawYears() {
    x = windowWidth * 0.53;
    y = 0 - (windowHeight/2) +　200;
    inc = Math.abs(y)/4
    var ry1=  0 - (windowHeight/2) +　200;
    
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
    ry1 = (0 - (windowHeight/2) +　200) + (currentYear-2015) * inc;
    var h = (disappearingYear-currentYear) * inc;
    rect(x,ry1,5,h);
    

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
            //return '#ff4e50';
        case 'satellite':
            return '#ffb480';
            //return '#f9d423';
        case 'habitat':
            return '#f8f38d';
            //return '#f9fea5';
        case 'data and analytics':
            return '#42d6a4';
            //return '#20e2d7';
        case 'propulsion':
            return '#08cad1'
            //return '#00ecbc';
        case 'planetary':
            return '#59adf6'
            //return '#007adf';
        case 'exploration':
            return '#9d94ff'
            //return '#6713d2';
        default:
            return '#c780e8'
            //return '#cc208e';
            

    }
}

function sourceToAscii(src, a) {
    ascii = 0;
    for (let i = 0; i < src.length; i++) {
        ascii += src.charCodeAt(i);
    }
    //let rv = Math.random() * 10 - 5;
    //console.log(ascii);
    return ascii/20 + ((a%20)-10);
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

function reset() {
    time=0;
        articles.forEach(function(cv, i, articles) {
            cv.opacity = 5;
            cv.orbitLife = 0;
            
        })
        currentYear = 2015;
        disappearingYear = 2015;
}

function toAscii(str) {
    ascii = 0;
    for (let i = 0; i < str.length; i ++) {
        ascii += str.charCodeAt(i);
    }
    //console.log(ascii);
    return ((ascii%20)/20) +0.5;
}