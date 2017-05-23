var site = {
	init: function() {
		if(moodle.isAuthenticated()) {
			core.hide('login');
			core.show('navigation');
			site.home();
		}
		else {
			site.login();
		}		
	},
	home: function() {
		moodle.enableLoading('Benutzerdaten werden geladen ..');

		var url = urls.api + '?moodlewsrestformat=json&wsfunction=core_user_get_users_by_field' 
			+'&wstoken=' + core.session.token 
			+'&field=username&values[0]=' + core.session.username;

		core.getJSON(url, function(state, data) {
			moodle.disableLoading();
		
			if(state == responseState.ERROR) {
				console.err('Couldn\'t receive user data.');
				return;
			}

			var user = data[0];

			console.log(user);
			core.setText('displayname', user.fullname);

			moodle.showTable(user, ['id', 'username', 'fullname']);
		});
	},

	login: function() {
		core.session.removeItem('token');
		core.show('login');
	},

	logout: function(e) {
		e.preventDefault();
		core.session.removeItem('token');
		core.reload();
	}
};

site.init();