/**
 * Created by Alexey Okishev on 23.05.2014.
 */
var module = angular.module('imageManagement.imgMngtController', []);
module.controller('imgMngtController', ['$scope', '$window', '$modal', 'resizerService', 'dashboardService', 'config',
    '_', function ($scope, $window, $modal, resizerService, dashboardService, config, _) {

        dashboardService.getUserKey(function(userKey){
            $scope.imgMngtModel = new ImgMngtModel(userKey, config.resizerServiceBaseUrl);
        });

        function ImgMngtModel(userKey, resizerServiceBaseUrl){
            var model = this;
            model.srcImg = new SrcImgModel();
            model.stages = [ model.srcImg, new CropModel(), new ResizeModel(), new BordersModel(), new EffectsModel(),
                new SmartFillModel(), new OutputModel(model) ];

            model.resizedImageUrl = model.srcImg.srcimgOption.value;
            model.buildResizingUrl = function() {
                model.resizedImageUrl = resizerServiceBaseUrl + "/api/"+ userKey +"/v1?" + buildResizingUrlOptions();
            }

            $scope.$watch('imgMngtModel.resizedImageUrl', function(newValue, oldValue) {
                if(oldValue != "" && oldValue != newValue) {
                    $(".cropper-container img").attr("src", $scope.imgMngtModel.resizedImageUrl);
                    $("#preview").parent().blockUIElement();
                }
            });

            function buildResizingUrlOptions() {
                var result = [];
                _(model.stages).each(function(stageModel){
                    var params = stageModel.compose();
                    if (params)
                        result = _.union(result, params);
                });
                return result.join('&');
            }
        }

        function StageModelBase(name, directive){
            var model = this;
            model.displayName = name;
            model.directive = directive;
            model.optionModels = [];
            model.compose = function() {
                var result = [];
                _(model.optionModels).each(function(optionModel){
                    if (optionModel) {
                        var composedValue = optionModel.compose();
                        if (composedValue)
                            result.push(composedValue);
                    }
                })

                return result;
            };

            return model;
        }

        function OptionModelBase(name){
            var model = this;
            model.name = name;
            model.value = "";
            model.compose = function() {
                if (model.value)
                    return model.name + '=' + model.value;
            };
            return model;
        }

        function ColorOptionModelBase(name){
            var model = new OptionModelBase(name);
            model.compose = function() {
                if (model.value && model.value.substring(0, 1) == "#")
                    return model.name + '=' + model.value.substring(1);
                else if (model.value)
                    return model.name + '=' + model.value;
            };

            return model;
        }

        function SliderOptionModelBase(name){
            var model = new OptionModelBase(name);
            model.compose = function() {
                if (model.value && model.value > 0)
                    return model.name + '=' + model.value;
            };

            return model;
        }

        function SrcImgModel(){
            var model = new StageModelBase("Source img", "src-img-accordion");
            model.srcimgOption = new SrcImgOptionModel();
            model.optionModels.push(model.srcimgOption);
            return model;

            function SrcImgOptionModel(){
                var model = new OptionModelBase("source");
                model.value = "http://resizerportal.231.quotient.net/images/samples/cherry-fruit.jpg";
                return model;
            }
        }

        function CropModel(){
            var model = new StageModelBase("Crop", "crop-accordion");
            model.crop = new CropOptionModel();
            model.optionModels.push(model.crop);
            return model;

            function CropOptionModel(){
                var model = new OptionModelBase("crop");
                model.value = "";
                model.topX = "";
                model.topY = "";
                model.width = "";
                model.height = "";
                model.compose = function() {
                    if (!!model.topX && !! model.topY && !!model.width && !!model.height)
                        return model.name + '=' + model.topX + '.' + model.topY + '.' + model.width + '.' + model.height;
                    else
                        return "";
                };

                return model;
            }
        }

        function ResizeModel(){
            var model = new StageModelBase("Resize", "resize-accordion");
            model.constrainMode = new OptionModelBase("constrainMode");
            model.constrainHeight = new OptionModelBase("constrainHeight");
            model.constrainWidth = new OptionModelBase("constrainWidth");
            model.scale = new OptionModelBase("scale");
            model.anchor = new OptionModelBase("anchor");
            model.bgcolor = new ColorOptionModelBase("bgcolor");

            model.optionModels = [model.constrainMode, model.constrainHeight, model.constrainWidth, model.scale, model.anchor, model.bgcolor];

            return model;
        }

        function BordersModel(){
            var model = new StageModelBase("Borders", "border-accordion");
            model.cornerRadius = new CornersOptionModel();
            model.optionModels = [ model.cornerRadius ];

            return model;

            function CornersOptionModel(){
                var model = new OptionModelBase("cornerRadius");
                model.value = "";
                model.bottomLeft = "";
                model.bottomRight = "";
                model.topRight = "";
                model.topLeft = "";
                model.compose = function() {
                    if (model.value)
                        return model.name + '=' + model.value;
                    if (model.bottomLeft && model.bottomRight && model.topRight && model.topLeft)
                        return model.name + '=' + model.topLeft + '.' + model.topRight + '.' + model.bottomLeft + '.' + model.bottomRight;
                };

                return model;
            }
        }

        function EffectsModel(){
            var model = new StageModelBase("Effects", "effects-accordion");
            model.blur = new SliderOptionModelBase("blur");
            model.shadowEnabled = new ShadowEnabledModel();
            model.shadowBlur = new SliderOptionModelBase("shadow.blur");
            model.shadowColor = new ColorOptionModelBase("shadow.color");
            model.shadowDirection = new ShadowDirectionOptionModel();
            model.flip = new FlipOptionModel();
            model.rotate = new RotateOptionModel();
            model.invert = new OptionModelBase("invert");
            model.mask = new OptionModelBase("mask");

            model.optionModels = [ model.blur, model.shadowEnabled, model.shadowBlur, model.shadowColor,
                model.shadowDirection, model.flip, model.rotate, model.invert, model.mask ];

            function RotateOptionModel(){
                var model = new OptionModelBase("rotate");
                model.prefix = "";
                model.compose = function() {
                    if (model.value)
                        return model.name + '=' + model.prefix + model.value;
                };

                return model;
            }

            function FlipOptionModel(){
                var model = new OptionModelBase("flip");
                model.compose = function() {
                    if (model.value)
                        return model.name + '=' + model.value;
                };

                return model;
            }

            function ShadowDirectionOptionModel(){
                var model = new OptionModelBase("shadow.direction");
                model.X = "";
                model.Y = "";
                model.compose = function() {
                    if (model.X && model.Y)
                        return model.name + '=' + model.X + '.' + model.Y;
                };

                return model;
            }

            function ShadowEnabledModel(){
                var shadowEnabledModel = new OptionModelBase("shadow.enabled");
                shadowEnabledModel.compose = function() {
                    if(model.shadowDirection.X || model.shadowDirection.Y)
                        return shadowEnabledModel.name + '=true';
                };

                return shadowEnabledModel;
            }

            return model;
        }

        function SmartFillModel(){
            var model = new StageModelBase("Smart Fill", "smart-fill-accordion");

            model.floodFillThreshold = new SliderOptionModelBase("floodFill.threshold");
            model.floodFillTargetPixel = new FloodFillTargetPixelModel();
            model.floodFillColor = new ColorOptionModelBase("floodFill.color");
            model.edgeFillReplaceColor = new ColorOptionModelBase("edgeFill.replaceColor");
            model.edgeFillTargetColor = new ColorOptionModelBase("edgeFill.targetColor");
            model.edgeFillThreshold = new SliderOptionModelBase("edgeFill.threshold");
            model.edgeFillEnabled = new EdgeFillEnabledModel();

            model.optionModels = [model.floodFillTargetPixel, model.floodFillColor, model.floodFillThreshold,
                model.edgeFillEnabled, model.edgeFillReplaceColor, model.edgeFillTargetColor, model.edgeFillThreshold];

            function EdgeFillEnabledModel(){
                var edgeFillEnabledModel = new OptionModelBase("edgeFill.enabled");
                edgeFillEnabledModel.compose = function() {
                    if(model.edgeFillReplaceColor.value || model.edgeFillTargetColor.value || (model.edgeFillThreshold.value && model.edgeFillThreshold.value > 0))
                        return edgeFillEnabledModel.name + '=true';
                    //else
                    //    return edgeFillEnabledModel.name + '=false';
                };

                return edgeFillEnabledModel;
            }

            function FloodFillTargetPixelModel(){
                var model = new OptionModelBase("floodFill.targetPixel");
                model.X = "";
                model.Y = "";
                model.compose = function() {
                    if (model.X && model.Y)
                        return model.name + '=' + '.' + model.X + '.' + model.Y;
                };

                return model;
            }

            return model;
        }

        function OutputModel(parentModel){
            var model = new StageModelBase("Output", "output-accordion");
            model.parentModel = parentModel;
            model.format = new OptionModelBase("format");
            model.optimize = new OptionModelBase("optimize");
            model.compression = new OptionModelBase("compression");
            model.bitsPerPixel = new BitsPerPixelOptionModel();

            model.optionModels = [model.format, model.optimize, model.compression, model.bitsPerPixel];

            function BitsPerPixelOptionModel(){
                var model = new OptionModelBase("bitsPerPixel");

                model.compose = function() {
                    if (model.value && model.value != "none")
                        return model.name + '=' + model.value;
                };

                return model;
            }

            return model;
        }
    }]);
