$(function(){
    var autoLoadModals = $('.modal-autoload');
    setTimeout(
        function(){
            if(autoLoadModals.length > 0){
                _.each(autoLoadModals, function(modal){
                    $(modal).modal();
                })
            }
        },
        1000
    )

})