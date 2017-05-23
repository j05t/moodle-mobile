var urls = {
	getToken: 'https://elearning.fh-joanneum.at/login/token.php',
	api: 'https://elearning.fh-joanneum.at/webservice/rest/server.php'
};

var moodle = {
	loadingTimer: null,
	init: function() {
		core.init();

		if(moodle.isAuthenticated()) {
			core.hide('login');
			core.show('navigation');
			moodle.home();
		}
		else {
			moodle.login();
		}		
	},
	
	isAuthenticated: function() {
		if(core.session.getItem('token') === null)
			return false;

		return true;
	},

	authenticate: function() {
		core.setText('state-text', '')
		core.setText('login-error', '')

		var username = core.getValue('username');
		var password = core.getValue('password');
		var url = urls.getToken + '?username=' + username + '&password=' + password + '&service=moodle_mobile_app';
		
		if(isEmpty(username) || isEmpty(password)) {
			core.setText('login-error', 'Please enter username and password');
			return;
		}

		moodle.enableLoading('Auhentication in progress ..');
		
		core.getJSON(url, function(state, data) {
			moodle.disableLoading();
			
			if(state == responseState.ERROR) {
				core.setText('login-error', 'Something went wrong during login');
				return;
			}

			if(data && !isEmpty(data.error)) {
				core.setText('login-error', data.error);
				return;
			}

			core.session.username = username;
			core.session.token = data.token;
			core.redirect('index.html');
		});
	},

	enableLoading: function(text) {
		clearTimeout(moodle.loadingTimer);
		moodle.loadingTimer = setTimeout(moodle.disableLoading, 10000);

		core.setText('state-text', text)
		core.removeClass('loading', 'hide');
	},

	disableLoading: function() {
		clearTimeout(moodle.loadingTimer);

		core.setText('state-text', '')
		core.addClass('loading', 'hide');
	},

	showTable: function(data, keys) {
		var content = document.getElementById('content');
		var table = document.createElement('table');

		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];

			if (data.hasOwnProperty(key) && keys.indexOf(key) > -1) {

				var tr = document.createElement('tr');
				var tdKey = document.createElement('td');
				var tdValue = document.createElement('td');

				tdKey.innerText = key.toUpperCase();;
				tr.appendChild(tdKey);

				tdValue.innerText = data[key];
				tr.appendChild(tdValue);
				
				table.appendChild(tr);
			}			
		}
		
		core.setHtml('content', '');
		content.appendChild(table);	
	},

	login: function() {
		core.session.removeItem('token');
		core.show('login');
	},

	logout: function(e) {
		e.preventDefault();
		core.session.removeItem('token');
		core.reload();
	},

	home: function() {
		moodle.enableLoading('Loading user data ..');

		var url = urls.api + '?moodlewsrestformat=json&wsfunction=core_user_get_users_by_field' 
			+'&wstoken=' + core.session.token 
			+'&field=username&values[0]=' + core.session.username;

		core.getJSON(url, function(state, data) {
			moodle.disableLoading();
		
			if(state == responseState.ERROR) {
				console.err('Couldn\'t receive data.');
				return;
			}

			moodle.showTable(data[0], ['id', 'username', 'fullname']);
		});
	},
	
	rooms: function() {
		moodle.enableLoading('Loading online rooms ..');

		var url = urls.api + '?moodlewsrestformat=json&wsfunction=core_course_get_contents'
			+'&courseid=1198' 
			+'&wstoken=' + core.session.token;

		core.getJSON(url, function(state, data) {
			moodle.disableLoading();
		
			if(state == responseState.ERROR) {
				console.err('Couldn\'t receive data.');
				return;
			}

			var div = document.createElement('div');
			div.innerHTML = data[0].summary;

			var wrapper = document.createElement('div');
			wrapper.classList.add('rooms');

			var childs = div.getElementsByTagName('ul');

			for(var i = 0; i < childs.length; i++) {
				var child = childs[i];
				var previousElement = child.previousElementSibling;
				var text = previousElement.innerText.trim();

				var h2 = document.createElement('h2');
				h2.innerText = text;
				h2.onclick = function() {
					this.classList.toggle('expanded')
				};
				wrapper.appendChild(h2);

				var ul = document.createElement('ul');
				wrapper.appendChild(ul);

				var links = child.getElementsByTagName('a');

				for(var j = 0; j < links.length; j++) {
					var li = document.createElement('li');
					ul.appendChild(li);

					var link = links[j];
					var a = document.createElement('a');
					a.href = link.href;
					a.innerText = link.innerText.trim();
					a.target = '_blank';

					li.appendChild(a);
				}
			}

			var content = document.getElementById('content');
			content.innerHTML = '';
			content.appendChild(wrapper);
		});
	}
};

moodle.init();