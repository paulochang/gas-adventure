var canvasSurface: HTMLCanvasElement;
var canvasContext: CanvasRenderingContext2D;
var particlesSet: Array<Particle> = [];

/**
 * Represents a Vector object
 **/
interface Vector {
    x: number;
    y: number;
}

enum WallSide {
    top,
    bottom,
    left,
    right
}

class Particle {
    position: Vector;
    velocity: Vector;

    constructor(position: Vector, velocity: Vector) {
        this.position = position;
        this.velocity = velocity;
    }

    move() {
        var newPosition: Vector;
        newPosition = this.position;
        newPosition.x += this.velocity.x;
        newPosition.y += this.velocity.y;
        this.position = newPosition;
    }

    hitWall(side: WallSide) {
        switch (side) {
            case WallSide.top:
            case WallSide.bottom:
                this.velocity.y = - this.velocity.y;
                break;
            case WallSide.left:
            case WallSide.right:
                this.velocity.x = - this.velocity.x;
                break;
        }
    }

    checkHits() {
        if (this.position.x < GameConstants.PARTICLE_RADIO)
            this.hitWall(WallSide.left);
        else if (this.position.y < GameConstants.PARTICLE_RADIO)
            this.hitWall(WallSide.top);
        else if (this.position.y > canvasSurface.height - GameConstants.PARTICLE_RADIO)
            this.hitWall(WallSide.bottom);
        else if (this.position.x > canvasSurface.width - GameConstants.PARTICLE_RADIO)
            this.hitWall(WallSide.right);
    }

    checkBallColide(particle: Particle): boolean {
        if (VectorUtilites.getDistanceBetweenPoints(this.position, particle.position) < (2 * GameConstants.PARTICLE_RADIO))
            return true;
        else return false;
    }

    hitParticle(particle: Particle)
    {
        var d = VectorUtilites.getDistanceBetweenPoints(this.position, particle.position);
        var delta = VectorUtilites.subVectors(this.position, particle.position);

        var vp1 = this.velocity.x * delta.x / d + this.velocity.y * delta.y / d;
        var vp2 = particle.velocity.x * delta.x / d + particle.velocity.y * delta.y / d;

        var ax = delta.x / d;
        var ay = delta.y / d;

        var va1 = this.velocity.x * ax + this.velocity.y * ay;
        var vb1 = -this.velocity.x * ay + this.velocity.y * ax;

        var va2 = particle.velocity.x * ax + particle.velocity.y * ay;
        var vb2 = -particle.velocity.x * ay + particle.velocity.y * ax;

        var vaP1 = va1 + (1.0 + GameConstants.ELLASTIC_COEFFICIENT) * (va2 - va1) / (1.0 + 1);
        var vaP2 = va2 + (1.0 + GameConstants.ELLASTIC_COEFFICIENT) * (va1 - va2) / (1.0 + 1);

        this.velocity.x = vaP1 * ax - vb1 * ay;
        this.velocity.y = vaP1 * ay + vb1 * ax;

        particle.velocity.x = vaP2 * ax - vb2 * ay;
        particle.velocity.y = vaP2 * ay + vb2 * ax;
    }
}

class GameConstants {
    public static get PARTICLE_NUMBER(): number { return 50; }
    public static get PARTICLE_RADIO(): number { return 5; }
    public static get PARTICLE_SPEED(): number { return 2; }
    public static get PARTICLE_MASS(): number { return 1; }
    public static get ELLASTIC_COEFFICIENT(): number { return 1; }
}

module VectorUtilites {

    export function generateRandomPoint(xOffset: number, yOffset: number, xLimit: number, yLimit: number): Vector {
        var result: Vector = {
            x: xOffset + Math.random() * (xLimit - 2 * xOffset),
            y: yOffset + Math.random() * (yLimit - 2 * yOffset)
        };

        return result;
    }

    export function getRandomSpeed(): Vector {
        var result: Vector = {
            x: (- GameConstants.PARTICLE_SPEED) + 2 * Math.random() * GameConstants.PARTICLE_SPEED,
            y: (- GameConstants.PARTICLE_SPEED) + 2 * Math.random() * GameConstants.PARTICLE_SPEED,
        };

        return result;
    }


    export function subVectors(VectorA: Vector, VectorB: Vector): Vector {
        var result: Vector = {
            x: VectorA.x - VectorB.x,
            y: VectorA.y - VectorB.y
        }

        return result;
    }

    export function getDistanceBetweenPoints(PointA: Vector, PointB: Vector): number {

        var XDifference = PointA.x - PointB.x;
        var YDifference = PointA.y - PointB.y;

        var squaredXDifference = XDifference * XDifference;
        var squaredYDifference = YDifference * YDifference;
        return Math.sqrt(squaredXDifference + squaredYDifference);
    }
}

module CanvasHelper {

    function drawCircle(Pos: Vector, radius: number, color: any) {
        canvasContext.beginPath();
        canvasContext.arc(Pos.x, Pos.y, radius, 0, 2 * Math.PI, false);
        canvasContext.fillStyle = color;
        canvasContext.fill();
    }

    function drawSquare(Pos: Vector, radius: number, color: any) {
        canvasContext.fillStyle = color;
        canvasContext.fillRect(Pos.x - radius, Pos.y - radius, 2 * radius, 2 * radius);
    }

    export function clearBoard() {
        canvasContext.clearRect(0.0, 0.0, canvasSurface.width, canvasSurface.height);

        canvasContext.fillStyle = "#000";
        canvasContext.fillRect(0, 0, canvasSurface.width, canvasSurface.height);
    }

    export function positionParticle(particlePosition?: Vector): Vector {

        if (!particlePosition)
            particlePosition = VectorUtilites.generateRandomPoint(
                GameConstants.PARTICLE_RADIO,
                GameConstants.PARTICLE_RADIO,
                canvasSurface.width,
                canvasSurface.height
                );

        drawCircle(particlePosition, GameConstants.PARTICLE_RADIO, 'white');

        return particlePosition;
    }
}

var requestAnimFrame: (callback: () => void) => void = (function () {
    return window.requestAnimationFrame ||
        (<any>window).webkitRequestAnimationFrame ||
        (<any>window).mozRequestAnimationFrame ||
        (<any>window).oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60, new Date().getTime());
        };
})();


function play() {

    CanvasHelper.clearBoard();

    var ballCount = particlesSet.length;

    for (var i = 0; i < ballCount; i++) {
        var p: Particle = particlesSet[i];
        p.move();
        p.checkHits();
        for (var j = i + 1; j < ballCount; j++) {
            if (particlesSet[i].checkBallColide(particlesSet[j])) {
                particlesSet[i].hitParticle(particlesSet[j]);
            }
        }
        CanvasHelper.positionParticle(p.position);
    }


    requestAnimFrame(function () {
        play();
    });
}

function initialize() {
    canvasSurface = <HTMLCanvasElement> document.getElementById("myCanvas");
    canvasContext = canvasSurface.getContext("2d");

    CanvasHelper.clearBoard();

    for (var n = 1; n <= GameConstants.PARTICLE_NUMBER; n++)
    {
        var particlePosition = CanvasHelper.positionParticle();
        var particleSpeed = VectorUtilites.getRandomSpeed();
        var tempParticle = new Particle(particlePosition, particleSpeed);
        particlesSet.push(tempParticle);
    }

    play();
}

document.addEventListener("DOMContentLoaded", initialize, false)
