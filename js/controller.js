var controller = {
    courseIdRooms: 1198,
    urls: {
        getToken: 'https://elearning.fh-joanneum.at/login/token.php',
        api: 'https://elearning.fh-joanneum.at/webservice/rest/server.php'
    },

    base: function () {
        core.init();
        view.init();

        if (!controller.isAuthenticated()) {
            core.session.removeItem('token');
            core.session.removeItem('userid');
            view.login();
            return;
        }

        // page is the optional GET-parameter used to define which site view
        var page = core.getParameterByName('page');
        if (page === 'files') {
            controller.files();
        }
        else if (page == 'rooms') {
            controller.rooms();
        }
        else {
            controller.home();
        }
    },

    isAuthenticated: function () {
        if (core.session.getItem('token') === null)
            return false;

        if (core.session.getItem('userid') === null)
            return false;

        return true;
    },

    authenticate: function (e) {
        e.preventDefault();
        core.setText('login-error', '')

        var username = encodeURIComponent(core.getValue('username'));
        var password = encodeURIComponent(core.getValue('password'));

        var url = controller.urls.getToken + '?username=' + username + '&password=' + password + '&service=moodle_mobile_app';

        if (core.isEmpty(username) || core.isEmpty(password)) {
            core.setText('login-error', 'Please enter username and password.');
            return;
        }

        view.enableLoading('Auhentication in progress ..');

        core.getJSON(url, function (state, data) {

            if (state == responseState.ERROR) {
                core.setText('login-error', 'Something went wrong during login.');
                return;
            }

            if (data && !core.isEmpty(data.error)) {
                core.setText('login-error', data.error);
                return;
            }

            var auhtenticationToken = data.token;
            var url = controller.urls.api + '?moodlewsrestformat=json&wsfunction=core_user_get_users_by_field'
                + '&wstoken=' + auhtenticationToken
                + '&field=username&values[0]=' + encodeURIComponent(username);

            core.getJSON(url, function (state, userdata) {
                view.disableLoading();

                if (state == responseState.ERROR) {
                    console.err('Couldn\'t receive data.');
                    return;
                }

                var user = userdata[0];

                core.session.token = auhtenticationToken;
                core.session.userid = user.id;
                core.session.fullname = user.fullname;
                core.session.profileimageurl = user.profileimageurl;
                core.session.profileimageurlsmall = user.profileimageurlsmall;
                core.session.email = user.email;
                core.redirect('./index.html');
            });
        });
    },

    logout: function (e) {
        e.preventDefault();
        core.session.removeItem('token');
        core.reload();
    },

    home: function () {
        view.enableLoading();

        // set offline model first
        var offlineModel = localStorage.getItem('model.home');
        if (offlineModel) {
            view.list(JSON.parse(offlineModel));
        }

        var url = controller.urls.api
            + '?moodlewsrestformat=json&wsfunction=mod_assign_get_assignments&wstoken='
            + core.session.token;

        core.getJSON(url, function (state, data) {
            view.disableLoading();

            if (state == responseState.ERROR) {
                view.error();
                return;
            }

            var assignments = [];
            var now = Math.floor(Date.now() / 1000);

            for (var i = 0; i < data.courses.length; i++) {
                var course = data.courses[i];

                for (var j = 0; j < course.assignments.length; j++) {
                    var assignment = course.assignments[j];

                    if (assignment.duedate > now) {
                        assignments.push({
                            name: assignment.name,
                            course: course.shortname,
                            description: assignment.intro,
                            date: new Date(assignment.duedate * 1000)
                        });
                    }
                }
            }

            // sort and convert timestamps to date
            assignments.sort(core.orderBy('date', false, parseInt));

            var model = [];

            for (var i = 0; i < assignments.length; i++) {
                var assignment = assignments[i];
                var date = assignment.date;

                model.push({
                    title: date.ddmmyyyy() + ' | ' + assignment.name,
                    childs: [{
                        content: assignment.description,
                        isHtml: true
                    }]
                });
            }

            // save model to offline storage
            localStorage.setItem('model.home', JSON.stringify(model));

            view.list(model);
        });
    },

    rooms: function () {
        view.enableLoading();

        // set offline model first
        var offlineModel = localStorage.getItem('model.rooms');
        if (offlineModel) {
            view.list(JSON.parse(offlineModel));
        }

        var url = controller.urls.api
            + '?moodlewsrestformat=json&wsfunction=core_course_get_contents'
            + '&courseid=' + controller.courseIdRooms
            + '&wstoken=' + core.session.token;

        var model = [];

        core.getJSON(url, function (state, data) {
            view.disableLoading();

            if (state == responseState.ERROR) {
                view.error();
                return;
            }

            var div = document.createElement('div');
            div.innerHTML = data[0].summary;

            var childs = div.getElementsByTagName('ul');

            for (var i = 0; i < childs.length; i++) {
                var child = childs[i];
                var previousElement = child.previousElementSibling;
                var text = previousElement.innerText.trim();

                var listItem = {
                    title: text,
                    childs: []
                };

                model.push(listItem);

                var links = child.getElementsByTagName('a');

                for (var j = 0; j < links.length; j++) {
                    var link = links[j];

                    listItem.childs.push({
                        content: link.innerText.trim(),
                        url: link.href
                    });
                }
            }

            localStorage.setItem('model.rooms', JSON.stringify(model));

            view.list(model);
        });
    },

    files: function () {
        view.enableLoading();

        // set offline model first
        var offlineModel = localStorage.getItem('model.files');
        if (offlineModel) {
            view.list(JSON.parse(offlineModel));
        }

        var url = controller.urls.api
            + '?moodlewsrestformat=json&wsfunction=core_enrol_get_users_courses'
            + '&userid=' + core.session.userid
            + '&wstoken=' + core.session.token;

        var model = [];

        core.getJSON(url, function (state, data) {
            if (state == responseState.ERROR) {
                view.error();
                return;
            }

            var ignoredLvs = [
                'Sekretariat (ITM)',
                'Sekretariat (SWD)',
                'Sekretariat (IMS)',
                'Sekretariat (IRM)',
                'Secretariat (ASE)',
                'Online Rooms',
                'Support'];

            var numberOfLvs = data.length - ignoredLvs.length;
            var numberOfLoadedLvs = 0;

            for (var i = 0; i < data.length; i++) {
                var lv = data[i];

                // skip ignored lvs
                if (ignoredLvs.includes(lv.fullname)) {
                    continue;
                }

                var listItem = {
                    title: lv.fullname,
                    childs: []
                };
                model.push(listItem);

                var detailsUrl = controller.urls.api
                    + '?moodlewsrestformat=json&wsfunction=core_course_get_contents'
                    + '&courseid=' + lv.id
                    + '&wstoken=' + core.session.token;

                core.getJSON(detailsUrl, function (state, data, element) {

                    numberOfLoadedLvs++;

                    if (numberOfLvs === numberOfLoadedLvs) {
                        view.disableLoading();
                    }

                    if (state == responseState.ERROR) {
                        return;
                    }

                    var numberOfItems = 0;

                    for (var i = 0; i < data.length; i++) {
                        var modules = data[i].modules;
                        for (var j = 0; j < modules.length; j++) {
                            var module = modules[j];
                            if (module.modname !== 'resource')
                                continue;

                            numberOfItems++;

                            var content = module.contents[0];

                            element.childs.push({
                                content: content.filename,
                                url: content.fileurl + '&token=' + core.session.token
                            });
                        }
                    }

                    if (numberOfLvs === numberOfLoadedLvs) {
                        localStorage.setItem('model.files', JSON.stringify(model));
                        view.list(model);
                    }
                }, listItem);
            }
        });
    },
};

controller.base();