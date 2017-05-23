function isEmpty(text) {
	return (!text || 0 === text.trim().length);
}

var responseState = {
	UNKNOWN: "UNKNOWN",
	SUCCESS: "SUCCESS",
	ERROR: 	 "ERROR"
};

var core = {
	session: null,
	init: function() {
		core.session = null;

		if(typeof(Storage) !== "undefined") {
			core.session = sessionStorage;
			return;
		}
		console.err("Couldn't init storage.");
	},
	
	getJSON: function(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'json';
		xhr.onload = function() {
			var status = xhr.status;
			if (status == 200) {
				callback(responseState.SUCCESS, xhr.response);
			} else {
				callback(responseState.ERROR, null);
			}
		};
		xhr.send();
	},
	
	redirect: function(url) {
		window.location = url;
	},
	reload: function() {
		window.location.reload();
	},	
	getValue: function(id) {
		return document.getElementById(id).value.trim();
	},
	getText: function(id) {
		return document.getElementById(id).innerText.trim();
	},
	setText: function(id, text) {
		return document.getElementById(id).innerText = text;
	},
	getHtml: function(id) {
		return document.getElementById(id).innerHTML;
	},
	setHtml: function(id, html) {
		return document.getElementById(id).innerHTML = html;
	},
	addClass: function(id, classname) {
		document.getElementById(id).classList.add(classname);
	},
	removeClass: function(id, classname) {
		document.getElementById(id).classList.remove(classname);
	},
	show: function(id) {
		core.removeClass(id, 'hide');
	},
	hide: function(id) {
		core.addClass(id, 'hide');
	}
};