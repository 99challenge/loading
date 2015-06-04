window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var main = (function () {

    var canvas, ctx;
    var bars = [];
    var colours = ['#03A9F4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39'];

    var roundRect = function(x, y, width, height, radius, fill) {
        if (typeof radius === "undefined") {
            radius = 5;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (fill) {
            ctx.fillStyle = fill;
            ctx.fill();
        }
    };

    var Bar = function (x, y, w, h, r, colour) {
        this.x = x;
        this.y = y;
        this.originalY = y;
        this.w = w;
        this.h = h;
        this.r = r;
        this.colour = colour;
        this.descent = false;
        this.duringChain = false;

        this.draw = function () {
            roundRect(this.x, this.y, this.w, this.h, this.r, this.colour);
        };

        this.update = function () {
            if (this.originalY - this.y > 50) {
                this.descent = true;
            }

            if (this.originalY - this.y < 0) {
                this.descent = false;
            }

            if (!this.descent) {
                this.y -= 3;
            }
            else {
                this.y += 3;
            }
        };
    };

    // Draw
    var draw = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        bars.forEach(function (bar) {
            bar.draw();
        });
    };

    // Update logic
    var update = function () {
        bars[0].update();

        if (bars[0].descent) {
            bars[0].duringChain = true;
        }

        for (var i = 1, l = bars.length; i < l; i++) {
            if (bars[i].duringChain && bars[i].originalY - bars[i].y === 0) {
                bars[i].duringChain = false;
            }

            if (bars[i - 1].duringChain && !bars[i].duringChain || bars[i].descent) {
                bars[i].update();
            }

            if (!bars[i].duringChain && bars[i].descent) {
                bars[i].duringChain = true;
            }
        }
    };

    // Main loop
    var loop = function _loop () {
        window.requestAnimationFrame(_loop);

        update();
        draw();
    };

    // Initialisation
    var init = function () {

        canvas = document.getElementById('world');
        ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        var width = 70;
        var height = 150;
        var startX = canvas.width / 2 - ((width * 5 + 50) / 2);

        for (var i = 0; i < 5; i++) {
            bars.push(new Bar(startX + (i * (width + 10)), 100, width, height, 40, colours[i]));
        }

        bars[0].duringChain = false;

        // Event handlers
        window.addEventListener('resize', function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }, false);

        loop();
    };

    return {
        'init': init
    }

})();

window.onload = main.init;