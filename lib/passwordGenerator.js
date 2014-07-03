
//alphabet is optional. Default alphabet is
//abcdefghigklm!@#stuvwxyz$%^&*()-=+12345nopqr67890.,|~
exports.PasswordGenerator = function(length, alphabet){
    this.length = length;
    this.alphabet = alphabet || 'abcdefghigklm!@#stuvwxyz$%^&*()-=+12345nopqr67890.,|~';
    this.Generate = function(length){
        this.length = length || this.length;
        password = '';
        for (var i = 0; i < this.length; i++){
            var next = getRandomArbitary(0, this.alphabet.length -1)
            var ch = this.alphabet.charAt(next);
            if (next > getRandomArbitary(0, this.alphabet.length - 1))
                ch = ch.toUpperCase();
            password = password + ch;
        }
        return password;
    };

    function getRandomArbitary (min, max) {
        return Math.random() * (max - min) + min;
    }
};