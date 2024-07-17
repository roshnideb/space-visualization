let points = [];
let orbit = 0;

var gfx;

function preload() {
    for (let i = 0; i < 100; i++) {
        points.push({
            lat: random(-90,90),
            lon: random(-180,180),
            r: random(0, 255),
            g: random(0,255),
            b: random(0,255),
        });
    }

    //shader = new p5.Shader(this.renderer, vert, frag);
}
function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    gfx = createGraphics(windowWidth, windowHeight, WEBGL);
    gfx.noStroke();

}

function draw() {
    gfx.push();
    gfx.background(0,0,10);
    gfx.orbitControl();
    
    gfx.fill(50,50,100);
    gfx.sphere(20);
    gfx.pop();

    points.forEach(function(cv, i, points) {
        gfx.push();
        gfx.rotateY(radians(cv.lon + orbit) + PI);
        gfx.rotateX(radians(cv.lat + orbit));
        gfx.translate(0,0,100);
        gfx.fill(cv.r,cv.g,cv.b);
        gfx.sphere(3);
        gfx.pop();

    });

    image(gfx,-windowWidth/2,-windowHeight/2,windowWidth,windowHeight);
    orbit++;
}//<-remove this when uncommenting

    /*points.forEach(function(cv, i, points) {
        push();
        rotateY(radians(cv.lon + orbit) + PI);
        rotateX(radians(cv.lat + orbit));
        translate(0,0,100);
        fill(cv.r,cv.g,cv.b);
        sphere(3);
        pop();
    });
    orbit = orbit + 1;

    let data = serializeSketch();

    shader.setUniform("resolution", [width, height]);
    shader.setUniform("pointCount", points.length);
    shader.setUniform("points", data.points);
    shader.setUniform("colors", data.colors);
    shaderTexture.rect(0,0, width, height);
    texture(shaderTexture);
    rect(0,0,width, height);
}

function serializeSketch() {
    data = {
        "points": [],
        "colors": [],
    };

    for (let i =0; i < points.length; i++) {
        data.points.push(
            map(particles[i].pos.x, 0, width, 0.0, 1.0),
            map(particles[i].pos.y, 0, height, 1.0, 0.0),
            map(particles[i].pos.z, -100, 100, -1.0, 1.0),
        )
        data.colors.push(points[i].r, points[i].g, points[i].b);
        
    }
    return data;
}

let vert = ``
let frag = ``*/