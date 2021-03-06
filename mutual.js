var request = require('request');
request = request.defaults({jar: true})

process.on('uncaughtException', (err) => {
    console.log(err);
});

module.exports.login = function login(uname, passwd) {
    request.post({
        url:    'https://osu.ppy.sh/forum/ucp.php?mode=login',
        form: {
            username: uname,
            password: passwd,
            autologin: 'on',
            login: 'login'
        },
        headers: {
            'user-agent': 'Mozilla/99.99 (compatible; MSIE 99.99; Windows XP 99.99)'
        }
    }, (error, response, body) => {
        console.log('Login success');
    });
}

module.exports.mutual = function try_mutual(uid, resp) {
    request.get({
        url:    'http://osu.ppy.sh/u/' + uid,
        headers: {
            'user-agent':   'Mozilla/99.99 (compatible; MSIE 99.99; Windows XP 99.99)',
        }
    }, (error, response, body) => {
        if (body.indexOf('Mutual') > 0) {
            resp.send('We are already mutual friend.');
        }
        else {
            var luc = body.match(/var localUserCheck = \"(.*?)\"/)[1];
            request.get({
                url:    'http://osu.ppy.sh/u/' + uid,
                headers: {
                    'user-agent':   'Mozilla/99.99 (compatible; MSIE 99.99; Windows XP 99.99)',
                },
                form: {
                    'a':                'add',
                    'localUserCheck':   luc
                }
            }, (error, respond, body) => {
                if (body.indexOf('Mutual') > 0) {
                    resp.send('We are mutual friend now!');
                }
                else {
                    // seems that he didn't add me as friend, so we need to revoke.
                    request.post({
                        url:    'http://osu.ppy.sh/u/' + uid,
                        headers: {
                            'user-agent':   'Mozilla/99.99 (compatible; MSIE 99.99; Windows XP 99.99)',
                        },
                        form: {
                            'a':                'remove',
                            'localUserCheck':   luc
                        }
                    }, (error, respond, body) => {
                        // Doing nothing.
                    });
                    resp.send('I\'m not your friend!');
                }
            });
        }
    });
}