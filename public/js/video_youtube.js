$('document').ready(function() {
	if( !device.tablet() && !device.mobile() ) {
		
		var options = { videoId: 'qkfGP4UTpjE', mute: false};
		$('#video').tubular(options);

} else {
	
	$('body').addClass('poster-image');
	
}

});


