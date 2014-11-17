var canvasSurface: HTMLCanvasElement;
var canvasContext: CanvasRenderingContext2D;

var alreadyWon: boolean = false;
/**
 * Represents a point object
 **/
interface Point {
    x: number;
    y: number;
}

class GameConstants {
    public static get BALL_RADIO(): number { return 5; }
    public static get ROBOT_RADIO(): number { return 7; }
    public static get ROBOT_RANGE(): number { return 15; }
    public static get GOAL_WIDTH(): number { return 10; }
    public static get GOAL_HEIGHT(): number { return 100; }
    public static get STEP_SIZE(): number { return 50; }
}

module FuzzyHelperLib {

    function getAscendingHeight(li: number, ls: number, x: number): number {
        return (x - li) / (ls - li)
    }

    function getDescendingHeight(li: number, ls: number, x: number): number {
        return 1 - (x - li) / (ls - li)
    }

    function getFuzzyValue(AscInfLimit: number, AscSupLimit: number, DescInfLimit: number, DescSupLimit: number, angle: number): number {
        if ((angle >= AscInfLimit) && (angle <= AscSupLimit))
            return getAscendingHeight(AscInfLimit, AscSupLimit, angle);
        else
            if ((angle >= DescInfLimit) && (angle <= DescSupLimit))
                return getDescendingHeight(DescInfLimit, DescSupLimit, angle);
            else
                return 0;
    }

    function getEastFuzzy(angle: number): number {
        var AscInfLimit: number = 315;
        var AscSupLimit: number = 360;
        var DescInfLimit: number = 0;
        var DescSupLimit: number = 45;

        return getFuzzyValue(AscInfLimit, AscSupLimit, DescInfLimit, DescSupLimit, angle);
    }

    function getNorthEastFuzzy(angle: number): number {
        var AscInfLimit: number = 0;
        var AscSupLimit: number = 45;
        var DescInfLimit: number = 45;
        var DescSupLimit: number = 90;

        return getFuzzyValue(AscInfLimit, AscSupLimit, DescInfLimit, DescSupLimit, angle);
    }

    function getNorthFuzzy(angle: number): number {
        var AscInfLimit: number = 45;
        var AscSupLimit: number = 90;
        var DescInfLimit: number = 90;
        var DescSupLimit: number = 135

        return getFuzzyValue(AscInfLimit, AscSupLimit, DescInfLimit, DescSupLimit, angle);

    }

    function getNorthWestFuzzy(angle: number): number {
        var AscInfLimit: number = 90;
        var AscSupLimit: number = 135;
        var DescInfLimit: number = 135;
        var DescSupLimit: number = 180;

        return getFuzzyValue(AscInfLimit, AscSupLimit, DescInfLimit, DescSupLimit, angle);
    }

    function getWestFuzzy(angle: number): number {
        var AscInfLimit: number = 135;
        var AscSupLimit: number = 180;
        var DescInfLimit: number = 180;
        var DescSupLimit: number = 225;

        return getFuzzyValue(AscInfLimit, AscSupLimit, DescInfLimit, DescSupLimit, angle);
    }

    function getSouthWestFuzzy(angle: number): number {
        var AscInfLimit: number = 180;
        var AscSupLimit: number = 225;
        var DescInfLimit: number = 225;
        var DescSupLimit: number = 270;

        return getFuzzyValue(AscInfLimit, AscSupLimit, DescInfLimit, DescSupLimit, angle);
    }

    function getSouthFuzzy(angle: number): number {
        var AscInfLimit: number = 225;
        var AscSupLimit: number = 270;
        var DescInfLimit: number = 270;
        var DescSupLimit: number = 315;

        return getFuzzyValue(AscInfLimit, AscSupLimit, DescInfLimit, DescSupLimit, angle);
    }

    function getSouthEastFuzzy(angle: number): number {
        var AscInfLimit: number = 270;
        var AscSupLimit: number = 315;
        var DescInfLimit: number = 315;
        var DescSupLimit: number = 360;

        return getFuzzyValue(AscInfLimit, AscSupLimit, DescInfLimit, DescSupLimit, angle);
    }

    export function getPositionOffset(angle: number, distance: number): Point {
        if (getNorthEastFuzzy(angle) >= 0.5) {
            var result: Point = {
                x: distance,
                y: -distance
            }
            return result;
        }
        if (getNorthWestFuzzy(angle) >= 0.5) {
            var result: Point = {
                x: -distance,
                y: -distance
            }
            return result;
        }
        if (getSouthEastFuzzy(angle) >= 0.5) {
            var result: Point = {
                x: distance,
                y: distance
            }
            return result;
        }
        if (getSouthWestFuzzy(angle) >= 0.5) {
            var result: Point = {
                x: -distance,
                y: distance
            }
            return result;
        }
        if (getNorthFuzzy(angle) >= 0.5) {
            var result: Point = {
                x: 0,
                y: -distance
            }
            return result;
        }
        if (getSouthFuzzy(angle) >= 0.5) {
            var result: Point = {
                x: 0,
                y: distance
            }
            return result;
        }
        if (getEastFuzzy(angle) >= 0.5) {
            var result: Point = {
                x: distance,
                y: 0
            }
            return result;
        }
        if (getWestFuzzy(angle) >= 0.5) {
            var result: Point = {
                x: -distance,
                y: 0
            }
            return result;
        }
    }

}

module PointUtilites {
    export function getAngleBetweenPoints(PointA: Point, PointB: Point) {
        var DeltaX: number = PointA.x - PointB.x;
        var DeltaY: number = PointB.y - PointA.y;

        var theta: number = Math.atan2(DeltaY, DeltaX);

        theta = theta < 0 ? theta + 2 * Math.PI : theta;

        return theta * (180 / Math.PI);
    }

    export function generateRandomPoint(xOffset: number, yOffset: number, xLimit: number, yLimit: number): Point {
        var result: Point = {
            x: xOffset + Math.random() * (xLimit - 2 * xOffset),
            y: yOffset + Math.random() * (yLimit - 2 * yOffset)
        };

        return result;
    }

    export function addPoints(PointA: Point, PointB: Point): Point {
        var result: Point = {
            x: PointA.x + PointB.x,
            y: PointA.y + PointB.y
        }

        return result;
    }

    export function getDistanceBetweenPoints(PointA: Point, PointB: Point): number {

        var XDifference = PointA.x - PointB.x;
        var YDifference = PointA.y - PointB.y;

        var squaredXDifference = XDifference * XDifference;
        var squaredYDifference = YDifference * YDifference;
        return Math.sqrt(squaredXDifference + squaredYDifference);
    }


    export function distanceToBorder(thePoint: Point): number {
        var distanceToTop = thePoint.y;
        var distanceToBottom = canvasSurface.height - thePoint.y;
        var distanceToLeft = thePoint.x;
        var distanceToRight = canvasSurface.width - thePoint.x;

        return Math.min(distanceToTop, distanceToBottom, distanceToLeft, distanceToRight);
    }

    export function isInCollidingRegion(pointToEvaluate: Point, radius: number, inferiorPoint: Point, superiorPoint: Point): boolean {
        var xCoincidente: boolean = (pointToEvaluate.x + radius >= inferiorPoint.x) && (pointToEvaluate.x - radius <= superiorPoint.x);
        var yCoincidente: boolean = (pointToEvaluate.y + radius >= inferiorPoint.y) && (pointToEvaluate.x - radius <= superiorPoint.y);
        return xCoincidente && yCoincidente;
    }
}

module CanvasHelper {

    function drawCircle(Pos: Point, radius: number, color: any) {
        canvasContext.beginPath();
        canvasContext.arc(Pos.x, Pos.y, radius, 0, 2 * Math.PI, false);
        canvasContext.fillStyle = color;
        canvasContext.fill();
    }

    function drawSquare(Pos: Point, radius: number, color: any) {
        canvasContext.fillStyle = color;
        canvasContext.fillRect(Pos.x - radius, Pos.y - radius, 2 * radius, 2 * radius);
    }

    export function clearBoard() {
        canvasContext.clearRect(0.0, 0.0, canvasSurface.width, canvasSurface.height);

        canvasContext.fillStyle = "#000";
        canvasContext.fillRect(0, 0, canvasSurface.width, canvasSurface.height);

        canvasContext.fillStyle = "#f00";
        canvasContext.fillRect(
            (canvasSurface.width - GameConstants.GOAL_WIDTH),
            (canvasSurface.height - GameConstants.GOAL_HEIGHT) / 2,
            GameConstants.GOAL_WIDTH,
            GameConstants.GOAL_HEIGHT
            );
    }

    export function positionRobot(robotPosition?: Point): Point {
        if (!robotPosition)
            robotPosition = PointUtilites.generateRandomPoint(
                GameConstants.ROBOT_RANGE,
                GameConstants.ROBOT_RANGE,
                canvasSurface.width,
                canvasSurface.height
                );

        drawCircle(robotPosition, GameConstants.ROBOT_RANGE, '#aaa');
        drawCircle(robotPosition, GameConstants.ROBOT_RADIO, '#111');

        return robotPosition;
    }

    export function positionBall(ballPosition?: Point): Point {

        if (!ballPosition)
            ballPosition = PointUtilites.generateRandomPoint(
                GameConstants.BALL_RADIO,
                GameConstants.BALL_RADIO,
                canvasSurface.width,
                canvasSurface.height
                );

        drawCircle(ballPosition, GameConstants.BALL_RADIO, 'white');

        return ballPosition;
    }
}

module ProbabilityUtilies {
    export function rnd(mean: number, stdev: number): number {
        return Math.round(rnd_bmt() * stdev + mean);
    }


    /**
     * Source http://www.protonfish.com/jslib/boxmuller.shtml
     */
    function rnd_bmt(): number {
        var x = 0, y = 0, rds, c;

    // Get two random numbers from -1 to 1.
    // If the radius is zero or greater than 1, throw them out and pick two new ones
    // Rejection sampling throws away about 20% of the pairs.
    do {
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
            rds = x * x + y * y;
        }
    while (rds == 0 || rds > 1)

    // This magic is the Box-Muller Transform
    c = Math.sqrt(-2 * Math.log(rds) / rds);

        return x * c;
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

function findBall(robotPosition: Point, ballPosition: Point) {
    var RobotIsOverBall: boolean;

    RobotIsOverBall = (PointUtilites.getDistanceBetweenPoints(robotPosition, ballPosition) < GameConstants.ROBOT_RANGE);

    if (!RobotIsOverBall) {
        var angleToBall: number = PointUtilites.getAngleBetweenPoints(ballPosition, robotPosition);

        var robotOffset: Point = FuzzyHelperLib.getPositionOffset(angleToBall, GameConstants.STEP_SIZE);

        robotPosition = PointUtilites.addPoints(robotPosition, robotOffset);
        CanvasHelper.clearBoard();
        CanvasHelper.positionBall(ballPosition);
        CanvasHelper.positionRobot(robotPosition);

        requestAnimFrame(function () {
            findBall(robotPosition, ballPosition);
        });
    }
    else {
        requestAnimFrame(function () {
            shootBall(ballPosition, robotPosition);
        });
    }
}

function moveBall(ballPosition: Point, finalPosition: Point, robotPosition: Point, isFirstShot: boolean) {

    var ballIsInPosition: boolean;

    ballIsInPosition = (PointUtilites.getDistanceBetweenPoints(ballPosition, finalPosition) < GameConstants.BALL_RADIO);
    ballIsInPosition = ballIsInPosition || (PointUtilites.distanceToBorder(ballPosition) < GameConstants.BALL_RADIO * 1.5);
    ballIsInPosition = ballIsInPosition && !isFirstShot;


    if (!ballIsInPosition) {
        var angleToFinal: number = PointUtilites.getAngleBetweenPoints(ballPosition, finalPosition);

        var ballOffset: Point = FuzzyHelperLib.getPositionOffset(angleToFinal, GameConstants.STEP_SIZE);

        ballPosition = PointUtilites.addPoints(ballPosition, ballOffset);
        CanvasHelper.clearBoard();
        CanvasHelper.positionBall(ballPosition);
        CanvasHelper.positionRobot(robotPosition);

        requestAnimFrame(function () {
            moveBall(ballPosition, finalPosition, robotPosition, false);
        });
    }
    else {
        alreadyWon = evaluate(ballPosition);
        requestAnimFrame(function () {
            play(robotPosition, ballPosition);
        });
    }
}

function shootBall(ballPosition: Point, robotPosition: Point) {
    var goalPosition: Point = {

        x: (canvasSurface.width),
        y: (canvasSurface.height / 2)
    }

    var angleToGoal: number = PointUtilites.getAngleBetweenPoints(ballPosition, goalPosition);
    var distanceToGoal: number = PointUtilites.getDistanceBetweenPoints(ballPosition, goalPosition);
    var shootingDistance: number = ProbabilityUtilies.rnd(distanceToGoal, distanceToGoal * 0.125);
    var ballOffset: Point = FuzzyHelperLib.getPositionOffset(angleToGoal, shootingDistance);
    var finalPosition: Point = PointUtilites.addPoints(ballPosition, ballOffset);

    moveBall(ballPosition, finalPosition, robotPosition, true);
}

function evaluate(ballPosition: Point): boolean {
    var goalPosition: Point = {
        x: (canvasSurface.width),
        y: (canvasSurface.height / 2)
    }


    var distanceToGoal: number = PointUtilites.getDistanceBetweenPoints(ballPosition, goalPosition);
    var isInGoal = distanceToGoal < GameConstants.BALL_RADIO;
    var inferiorPoint: Point = {
        x: canvasSurface.width - GameConstants.GOAL_WIDTH - GameConstants.BALL_RADIO / 2,
        y: (canvasSurface.height - GameConstants.GOAL_HEIGHT) / 2 - GameConstants.BALL_RADIO / 2
    };
    var superiorPoint: Point = {
        x: canvasSurface.width + GameConstants.BALL_RADIO / 2,
        y: (canvasSurface.height + GameConstants.GOAL_HEIGHT) / 2 + GameConstants.BALL_RADIO / 2
    };
    isInGoal = isInGoal || PointUtilites.isInCollidingRegion(ballPosition, GameConstants.BALL_RADIO, inferiorPoint, superiorPoint);

    return isInGoal;
}

function play(robotPosition: Point, ballPosition: Point) {


    if (!alreadyWon) {
        findBall(robotPosition, ballPosition);
    }
    else {
        alert('Ganó!!!');
    }
}

function initialize() {
    canvasSurface = <HTMLCanvasElement> document.getElementById("myCanvas");
    canvasContext = canvasSurface.getContext("2d");

    CanvasHelper.clearBoard();
    var ballPosition = CanvasHelper.positionBall();
    var robotPosition = CanvasHelper.positionRobot();

    play(robotPosition, ballPosition);
}

document.addEventListener("DOMContentLoaded", initialize, false)
