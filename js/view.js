var view = {
    $content: null,
    
    init: function() {
        view.$content = document.getElementById('content');
    },
    
    login: function() {
        core.show('login');
		document.getElementById('username').focus();
    },

    list: function(model) {
        for(var i = 0; i < model.length; i++) {
            var listItem = model[i];           
            var $listItem = listItem.$listItem;
            if($listItem == null) {
                $listItem = document.createElement('div');
            }

            $listItem.classList.add('list-item');

            // create and fill header
            var $header = document.createElement('header');
            $header.innerText = listItem.title;
            $header.onclick = function() {
                this.parentElement.classList.toggle('expanded')
            };

            // add header info span
            var $span = document.createElement('span');
            $span.classList.add('header-info');
            $header.appendChild($span);

            // append header to list-item
            $listItem.appendChild($header);

            for(var j = 0; j < listItem.childs.length; j++) {
                var child = listItem.childs[j];

                // create and fill list-item-child
                var $child = document.createElement('div');
                $child.classList.add('list-item-child');

                // set child content
                if(core.isEmpty(child.url)) {
                    // HTML content
                    if(child.isHtml) {
                        $child.innerHTML = child.content;
                    }
                    // text only
                    else {
                        $child.innerText = child.content;
                    }
                }
                // or add link if url is set
                else {
                    var $a = document.createElement('a');
                    $a.innerText = child.content;
                    $a.href = child.url;
                    $a.target = '_blank';
                    $child.appendChild($a);
                }

                // append list-item-child to list-item
                $listItem.appendChild($child);
            }

            // append list-item to content
            view.$content.appendChild($listItem);
        }
    },

    error: function() {
        view.disableLoading();

        var $error = document.createElement('div');
        $error.classList.add('error');
        $error.innerText = 'Es ist ein Fehler aufgetreten! Bitte laden Sie die Seite neu.';

        view.$content.appendChild($error);
    },

    enableLoading: function(text) {
		core.show('loading'); 
	},

	disableLoading: function() {
		core.hide('loading'); 
	},
};