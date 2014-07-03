/**
 * Created by ASUS on 21.05.2014.
 */
var urlutil = require('url');
exports.preprocessors = [
    function(url, menuItem){
        var p = urlutil.parse(url);
        if(menuItem.url.lastIndexOf('/') == menuItem.url.length -1)
            menuItem.url = menuItem.url.substring(0, menuItem.url.length -1);
        if(menuItem.url == url || menuItem.url == p.pathname)
        {
            menuItem.attributes = [{name: 'ng-disabled', value: true}, { name: "class", value: "text-success menu-highlight" }]
            menuItem.url = 'javascript:;';
        }
        return menuItem;
    },
    function(url, menuItem){
        var suffix = ')';
        if(menuItem.url.indexOf(suffix, menuItem.url - suffix.length) !== -1){
            menuItem.attributes = [{ name: 'ng-click', value: menuItem.url }];
            menuItem.url = 'javascript:;';
        }
        return menuItem;
    },
    function(url, menuItem){
        if (menuItem.attributes) {
            if (menuItem.attributes.length) {
                menuItem.attributes = (function (attrs) {
                    var attrsString = '';
                    for (var i = 0; i < attrs.length; i++) {
                        attrsString += ' ' + attrs[i].name + '="' + attrs[i].value + '"';
                    }
                    return attrsString;
                })(menuItem.attributes);
            }
        }
        return menuItem;
    }
];

exports.pages = [
    { url: 'openProfileEditor()', text: 'My Profile' },
    { url: "/dashboard/", text: "My Dashboard" },
    { url: "/tariffs/index", text: "My Plans" },
    { url: "/dashboard/api-docs", text: "API Documentation" },
    { url: "/dashboard/external-libs", text: "Explanation of external libraries" },
    { url: "/imageManagement", text: "Image Management" }
];