/**
 * Created by ASUS on 19.05.2014.
 */
$(document).ready(function() {
    $.editable.addInputType('fsedior', {
        element : function(settings, original) {
            var textarea = $('<textarea>');
            $(this).append(textarea);
            return(textarea);
        },
        content : function(string, settings, original) {
            $(this).find('textarea').val(string);
        },
        buttons : function(settings, original) {
            $(this).append('<button type="submit" style="display:none" />');
            $(this).append('<button type="cancel" style="display:none" />');
        },
        submit  : function(settings, original) {

        },
        plugin  : function(settings, original) {
            var $this = $(this);
            $this.find('textarea').fseditor();
            $('.fs-editable').on('blur', function(){
                $this.find('button[type="submit"]').click();
            });
            $('.fs-editable').focus();
        },
        reset   : function(settings, original) {

        }
    });

    $('.edit').editable(function(value, settings){
        var currentCodeId = $(this).attr('id'),
            $form = $(this).find('form');
        value = $('.fs-editable').text();
        $form.find('textarea').editable('destroy');
        $form.find('textarea').remove();
        $(this).text(value);
        renderImages(currentCodeId);
    },{
        tooltip   : 'Click to edit...',
        type      : 'fsedior'
    });

    function renderImages(codeId){
        if(codeId){
            var holderId = codeId.replace('code', 'holder');
            $('#' + holderId).empty();
            $('#' + holderId).append($('#' +codeId).text());
            if(makeImagesResponsive && codeId == 'example-2-code')
                makeImagesResponsive();
            return;
        }
        $('#example-1-holder').empty();
        $('#example-1-holder').append($('#example-1-code').text());
        $('#example-2-holder').empty();
        $('#example-2-holder').append($('#example-2-code').text());
    };
    renderImages();
});