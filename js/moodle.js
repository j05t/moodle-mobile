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
			moodle.assignments();
		}
		else {
			moodle.login();
		}		
	},
	
	isAuthenticated: function() {
		if(core.session.getItem('token') === null)
			return false;

		if(core.session.getItem('userid') === null)
			return false;

		return true;
	},

	authenticate: function() {
		core.setText('state-text', '')
		core.setText('login-error', '')

		// TODO: encode user parameter
		var username = core.getValue('username');
		var password = core.getValue('password');

		// TODO: use POST if possible
		var url = urls.getToken + '?username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password) + '&service=moodle_mobile_app';
		
		if(isEmpty(username) || isEmpty(password)) {
			core.setText('login-error', 'Please enter username and password.');
			return;
		}

		moodle.enableLoading('Auhentication in progress ..');
		
		core.getJSON(url, function(state, data) {
			// moodle.disableLoading();
			
			if(state == responseState.ERROR) {
				core.setText('login-error', 'Something went wrong during login.');
				return;
			}

			if(data && !isEmpty(data.error)) {
				core.setText('login-error', data.error);
				return;
			}

			var auhtenticationToken = data.token;
			var url = urls.api + '?moodlewsrestformat=json&wsfunction=core_user_get_users_by_field' 
				+'&wstoken=' + auhtenticationToken 
				+'&field=username&values[0]=' + encodeURIComponent(username);

			core.getJSON(url, function(state, userdata) {
				moodle.disableLoading();
			
				if(state == responseState.ERROR) {
					console.err('Couldn\'t receive data.');
					return;
				}

				console.log(userdata);

				var user = userdata[0];

				core.session.token = auhtenticationToken;
				core.session.userid = user.id;
				core.session.fullname = user.fullname;
				core.session.profileimageurl = user.profileimageurl;
				core.session.profileimageurlsmall = user.profileimageurlsmall;
				core.session.email = user.email;

				core.redirect('index.html');			
			});
		});
	},

	enableLoading: function(text) {
		clearTimeout(moodle.loadingTimer);
		moodle.loadingTimer = setTimeout(moodle.disableLoading, 10000);

		// core.setText('state-text', text)
		core.removeClass('loading', 'hide');
	},

	disableLoading: function() {
		clearTimeout(moodle.loadingTimer);

		core.setText('state-text', '')
		core.addClass('loading', 'hide');
	},

    showTable: function (data, keys) {
        var content = document.getElementById('content');
        var table = document.createElement('table');

        for (var j = 0; j < data.length; j++) {
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];

                if (data[j].hasOwnProperty(key) && keys.indexOf(key) > -1) {

                    var tr = document.createElement('tr');
                    var tdKey = document.createElement('td');
                    var tdValue = document.createElement('td');

					if (key == "Name")
						tr.id = "assignmentheader"; // = "background-color: blue";

					tdKey.innerText = key;
                    tr.appendChild(tdKey);

                    tdValue.innerHTML = data[j][key];
                    tr.appendChild(tdValue);

                    table.appendChild(tr);
                }
            }
        }

        core.setHtml('content', '');
        content.appendChild(table);
    },

	login: function() {
		core.session.removeItem('token');
		core.show('login');
		document.getElementById('username').focus();
	},

	logout: function(e) {
		e.preventDefault();
		core.session.removeItem('token');
		core.reload();
	},

	// home: function() {
	// 	moodle.enableLoading('Loading user data ..');

	// 	var url = urls.api + '?moodlewsrestformat=json&wsfunction=core_user_get_users_by_field' 
	// 		+'&wstoken=' + core.session.token 
	// 		+'&field=username&values[0]=' + core.session.username;

	// 	core.getJSON(url, function(state, data) {
	// 		moodle.disableLoading();
		
	// 		if(state == responseState.ERROR) {
	// 			console.err('Couldn\'t receive data.');
	// 			return;
	// 		}
	// 		moodle.showTable(data, ['id', 'username', 'fullname']);
	// 	});
	// },

    assignments: function () {
        moodle.enableLoading('Loading user data ..');

        var url = urls.api + '?moodlewsrestformat=json&wsfunction=mod_assign_get_assignments&wstoken=' + core.session.token;

        core.getJSON(url, function (state, data) {
            moodle.disableLoading();

            if (state == responseState.ERROR) {
                console.err('Couldn\'t receive data.');
                return;
            }

            var assignments = [];
            var now = Math.floor(Date.now() / 1000);

            for (var i = 0; i < data.courses.length; i++) {
                for (var j = 0; j < data.courses[i].assignments.length; j++) {
                    var name = data.courses[i].assignments[j].name;
                    var intro = data.courses[i].assignments[j].intro;
                    var duedate = data.courses[i].assignments[j].duedate;

                    if (duedate > now)
                        assignments.push({Name: name, Beschreibung: intro, Fällig: duedate});
                }
            }

			// sort and convert timestamps to date
            assignments.sort(core.orderBy('Fällig', false, parseInt));
            for (var i = 0; i < assignments.length; i++)
            	assignments[i].Fällig = new Date(assignments[i].Fällig * 1000)

            moodle.showTable(assignments, ['Name', 'Beschreibung', 'Fällig']);
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
	},

	lvs: function() {
		moodle.enableLoading('Loading LVs ..');

		var url = urls.api + '?moodlewsrestformat=json&wsfunction=core_enrol_get_users_courses'
			+'&userid=' + core.session.userid
			+'&wstoken=' + core.session.token;

		core.getJSON(url, function(state, data) {
			moodle.disableLoading();
		
			if(state == responseState.ERROR) {
				console.err('Couldn\'t receive data.');
				return;
			}

			var content = document.getElementById('content');
			content.innerHTML = '';

			var ignoredLvs = [
				'Sekretariat (ITM)', 
				'Sekretariat (SWD)', 
				'Sekretariat (IMS)', 
				'Sekretariat (IRM)', 
				'Secretariat (ASE)', 
				'Online Rooms', 
				'Support'];

			for (var i = 0; i < data.length; i++) {
				var lv = data[i];

				// skip ignored lvs
				if(ignoredLvs.includes(lv.fullname))
					continue;

				var div = document.createElement('div');
				div.classList.add('lv');

				var h3 = document.createElement('h3');
				h3.innerText = lv.fullname;
				h3.onclick = function() {
					this.parentElement.classList.toggle('expanded')
				};

				div.appendChild(h3);
				content.appendChild(div);	

				var detailsUrl = urls.api + '?moodlewsrestformat=json&wsfunction=core_course_get_contents'
					+'&courseid=' + lv.id
					+'&wstoken=' + core.session.token;

				core.getJSON(detailsUrl, function(state, data, element) {

					if(state == responseState.ERROR) {
						console.err('Couldn\'t receive data.');
						return;
					}

					var numberOfFiles = 0;

					for(var i = 0; i < data.length; i++) {
						var modules = data[i].modules;
						for(var j = 0; j < modules.length; j++) {
							var module = modules[j];
							if(module.modname !== 'resource')
								continue;

							var contents = module.contents[0];

							var img = document.createElement('img');
							img.src = module.modicon;

							var span = document.createElement('span');
							span.innerText = contents.filename;	

							var a = document.createElement('a');
							a.href = contents.fileurl +'&token=' + core.session.token;
							a.target = '_blank';					

							a.appendChild(img);
							a.appendChild(span);

							element.appendChild(a);
							numberOfFiles++;
						}
					}

					var h3 = element.childNodes[0];
					h3.innerText = h3.innerText + '(' + numberOfFiles +')'

				}, div);
			}
		});
	}
};

moodle.init();