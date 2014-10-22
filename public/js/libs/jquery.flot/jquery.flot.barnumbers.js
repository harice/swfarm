/* Copyright Joe Tsoi, FreeBSD-License
 * simple flot plugin to draw bar numbers halfway in bars
 *
 * options are
 * series: {
 *     bars: {
 *         showNumbers: boolean (left for compatibility)
 *         numbers : {
 *             show : boolean,
 *             alignX : number or function,
 *             alignY : number or function,
 *             showDataValue : boolean,
 *         }
 *     }
 * }
 */
(function ($) {
    var options = {
        bars: {
            numbers: {
            }
        }
    };
    
    function processOptions(plot, options) {
        var bw = options.series.bars.barWidth;
        var numbers = options.series.bars.numbers;
        var horizontal = options.series.bars.horizontal;
        if(horizontal){
            numbers.xAlign = numbers.xAlign || function(x){ return x / 2; };
            numbers.yAlign = numbers.yAlign || function(y){ return y + (bw / 2); };
            numbers.horizontalShift = 0;
        } else {
            numbers.xAlign = numbers.xAlign || function(x){ return x + (bw / 2); };
            numbers.yAlign = numbers.yAlign || function(y){ return y / 2; };
            numbers.horizontalShift = 1;
        }
    }

    function drawSeries(plot, ctx, series){
        if(series.bars.numbers.show || series.bars.showNumbers){
            var ps = series.datapoints.pointsize;
            var points = series.datapoints.points;
            var ctx = plot.getCanvas().getContext('2d');
            var offset = plot.getPlotOffset();
            ctx.textBaseline = "top";
            ctx.textAlign = "center";
            alignOffset = series.bars.align === "left" ? series.bars.barWidth / 2 : 0;
            xAlign = series.bars.numbers.xAlign;
            yAlign = series.bars.numbers.yAlign;
            var shiftX = typeof xAlign == "number" ? function(x){ return x; } : xAlign;
            var shiftY = typeof yAlign == "number" ? function(y){ return y; } : yAlign;

            axes = {
                0 : 'x',
                1 : 'y'
            } 
            hs = series.bars.numbers.horizontalShift;
            for(var i = 0; i < points.length; i += ps){
                barNumber = i + series.bars.numbers.horizontalShift
                var point = {
                    'x': shiftX(points[i]),
                    'y': shiftY(points[i+1])
                };

                if(series.stack != null){  
                    point[axes[hs]] = (points[barNumber] - series.data[i/3][hs] / 2);
                    text = addCommaToNumber(series.data[i/3][hs]);

                } else {                                    
                    if(series.bars.numbers.showDataValue) {    
						var counter = (i > 0)? i - ps : i;                    
						text = addCommaToNumber(series.data[i/3][hs]);                              
					}
					else{
						text = addCommaToNumber(points[barNumber]);
                    }
                }
                var c = plot.p2c(point);        
				
				if(typeof series.yPositionAdjustLabel !== 'undefined')
					c.top = c.top + series.yPositionAdjustLabel;                  
			   
				ctx.fillText(series.bars.numbers.label + text.toString(10), c.left + offset.left, c.top + offset.top)
            }
        }
    }

    function addCommaToNumber(number, dLimit) {
        if(typeof number !== 'string')
            number = number.toString();

        var negative = false;
        if(number.charAt(0) == '-') {
            negative = true;
            number = number.substr(1, number.length - 1);
        }

        var formatted = '';
        var splitNumber = number.split('.');

        for(var i = 0; i < splitNumber.length; i++)
            splitNumber[i] = splitNumber[i].replace(/[^0-9]/g,'');

        if(splitNumber.length > 1) {
            if(dLimit != null && splitNumber[1].length > dLimit)
                splitNumber[1] = splitNumber[1].substr(0, dLimit);
        }

        var temp = '';
        var ctr = 0;
        for(var i = splitNumber[0].length - 1; i >= 0; i--) {
            if(ctr == 3) {
                ctr = 1;
                temp = ','+temp;
            }
            else
                ctr++;

            temp = splitNumber[0].charAt(i) + temp;
        }
        splitNumber[0] = temp;

        formatted = (splitNumber.length > 1)? splitNumber[0]+'.'+splitNumber[1]: splitNumber[0];

        if(negative)
            formatted = '-'+formatted

        return formatted;
    }
    
    function init(plot) {
        plot.hooks.processOptions.push(processOptions);
        plot.hooks.drawSeries.push(drawSeries);
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'barnumbers',
        version: '0.4'
    });
})(jQuery);
