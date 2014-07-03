$("form[parsley-validate]").submit(function (e) {
    var isValid = $(this).parsley('validate');
    var isDomainsValid = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}(,[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6})*$/.test($('#domains').val());
    if(!isDomainsValid){
        $('div.bootstrap-tagsinput').addClass('parsley-error');
    } else {
        $('div.bootstrap-tagsinput').removeClass('parsley-error');
    }
    isValid &= isDomainsValid || !$('#frm_register').is(":visible");
    if (!isValid) e.preventDefault();
    return isValid;
});
