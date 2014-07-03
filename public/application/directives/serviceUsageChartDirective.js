angular.module('serviceUsageChartDirective', [])
    .directive('serviceUsageChart', function () {
        var maxPointCount = 11;
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var data = scope[attrs.model],
                    index = parseInt(attrs.index),
                    targetData = [],
                    placeHolder = element.children(0),
                    srcData = data[index].hits;
                for(x = 0; x < maxPointCount; x++){
                    var y = x < srcData.length ? srcData[x] : 0;
                    targetData.push([x, y]);
                }

                var tmp = [{
                        data: targetData,
                        color: '#3399cc'
                        }];
                $.plot(placeHolder, tmp, {
                    xaxis: {
                        show: false
                    },
                    yaxis: {
                        show: false,
                        tickColor: "#f0f0f0"
                    },
                    grid: {
                        backgroundColor: { colors: [ "#fff", "#fff" ] },
                        borderWidth:1,borderColor:"#f0f0f0",
                        margin:0,
                        minBorderMargin:0,
                        labelMargin:20,
                        hoverable: true,
                        clickable: true,
                        mouseActiveRadius:6
                    }
                });
                placeHolder.show();
            },
            template: '<div id="placeholder" class="demo-placeholder" style="width: 100px; height: 20px; padding: 0px; position: relative;"></div>'
        }
    });