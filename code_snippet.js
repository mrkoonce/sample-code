// creates namespace
Namespace('site', {

	// Attach collaspe function to targets
	collapsible:function(){

		//Find all collapsible 
		$('.collapsible-btn').unbind('click.collapsible').bind('click.collapsible',function(){
			site.collapsibleToggle(this);
		});
	},

	// show or hide collaspe content
	collapsibleToggle: function(o){
		var collaspeMe = $('.collapsibleContent', $(o).parent().parent().parent()); 
		collaspeMe.slideToggle('slow');
	},

	//Uploader config options
	uploaderOptions:function()	{
		return {

			// General settings
			runtimes : 'html5,flash,silverlight,html4',
			url : '/myAdmin/gallery/upload',
			chunk_size : '2mb',
			rename : true,
			dragdrop: true,
			unique_names:true,
			multi_selection :true,
			multiple_queues:true,		
			filters : {

				// Maximum file size
				max_file_size : '5mb',

				// Specify what files to browse for
				mime_types: [
					{title : "Image files", extensions : "jpg,gif,png"}
				]
			},

			flash_swf_url : '/vendor/plupload/js/Moxie.swf',
			silverlight_xap_url : '/vendor/plupload/js/Moxie.xap',
			init : {
				UploadComplete:function(o){

					//Create  img fields
					$('#uploaderFiles').html('');
					for (var i = 0; i < o.files.length; i++) {
						$('#uploaderFiles').append('<div class="form-inline"> <span class="badge">'+(i+1)+'</span> <input name="img['+i+'][name]" value="" type="text"  placeholder="File Name" class="input-small"> <input name="img['+i+'][title]" value="" type="text"  placeholder="Title" class="input-small"> <input value="'+o.files[i].name+'" name="img['+i+'][origFileName]" type="text" readonly="readonly"> <input name="img['+i+'][tempFileName]" value="'+o.files[i].target_name+'" type="hidden"><i class="icon-remove-sign removeMe"></i></div>');
					};
					$('.removeMe',$('#uploaderFiles')).css('cursor','pointer').click(function(){
						$(this).parent().remove();
					});

				}
			}
		}
	
	},

	//Only can call global function
	dynamFuncCall:function(func){		
		if(typeof func != 'undefined'){

			//function have to be in the global namespace.
	    	window[func].apply(null, Array.prototype.slice.call(arguments, 1));			
		}
	},

	// Select2 options
	select2Options:function(){
		return  {
			width:'100%',
			placeholder: "Search...",
			allowClear: true,
			minimumInputLength: 1,
			ajax: {
				url: "/myAdmin/ajax/field_search",
				dataType: 'json',
				quietMillis: 100,
				data: function (term, page) { // page is the one-based page number tracked by Select2
					dataOptions = {
						q: term, //search term
						page_limit: 10, // page size
						page: page, // page number
						model: $(this).data('model'),
						field_name:$(this).data('field_name'),
						search_field:$(this).data('search_field'),
						conditions:$(this).data('conditions'),
						exclude: $(this).data('exclude')					
					};
				

					return dataOptions;
				},
				results: function (data, page) {
					var more = (page * 10) < data.total; // whether or not there are more results available
					 
					// notice we return the value of more so Select2 knows if more results can be loaded
					return {results: data.gallery, more: more};
				}
			},
			initSelection: function(element, callback) {
				// the input tag has a value attribute preloaded that points to a preselected movie's id
				// this function resolves that id attribute to an object that select2 can render
				// using its formatResult renderer - that way the movie name is shown preselected
				var id=$(element).val();
				if (id !== "") {
					$.ajax("/myAdmin/ajax/field_search_by_id", {
						data: {
							id: id, //search term
							model: $(element).data('model'),
							field_name:$(element).data('field_name'),
							search_field:$(element).data('search_field'),
							conditions:$(element).data('conditions')					
						},
						dataType: "json"
					}).done(function(data) { callback(data); });
				}
			},			
			formatResult: site.select2FormatResult, // omitted for brevity, see the source of this page
			formatSelection: site.select2FormatSelection, // omitted for brevity, see the source of this page
			// dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
			escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
		};
	},

	//Select2 Format Results
    select2FormatResult:function (gallery) {         	
        return gallery.name;
    },

    //Select2 Format Selection
    select2FormatSelection:function(gallery) {
        return gallery.name;
    },	

    //Format gallery
	select2FormatGallery:function (gallery) {
		var name;

		//Check to see if the object has a property called element, select 2
		//only adds this when orignal field is a select.
		if(typeof  gallery.text != 'undefined' ){
			name =  gallery.text;
		}else{
			name = gallery.name;
		}		
		return '<img src="/imgs/backend_thumbs/'+ name[0] + '/' + name[1] + '/' +name + '" />';
	},

	//Selecting event
	select2Selecting:function(){ 
		return	function(e){
			var excludeList = '';
			var selectedVals = $('#modelField' + $(this).data('model')).select2('val');
			if(selectedVals.length > 0){
				excludeList = selectedVals .toString() + ',' + e.val;
			}else{
				excludeList =  e.val;
			}
			$(this).data('exclude', excludeList);			
		}
	},

	//Change event
	select2Change:function(){
		return function(e) { 
			$('#' + $(this).data('selected_id')).append($('<option />').attr('selected', 'selected').text(e.added.name).val(e.added.id)).trigger("change");
		}
	},

	//bootstrap modal set header
	bootstrapModalSetHeader:function(){	
		return function(){
			$('#myModal').data('title', $(this).data('title'));
			if($(this).data('event_shown') != 'undefined'){
				$('#myModal').data('event_shown', $(this).data('event_shown'));
			}
		}
		
	},	

	select2FormatGalleryTracker:''











});




//Set up ajax defaults
$.ajaxSetup({
	type: 'GET',
	dataType: 'json',
	// this is where we append a loading image
	beforeSend:function(){
		
	},

	// failed request; give feedback to user
	error:function(jqXHR, textStatus){
		if(textStatus == 'abort'){

		}else if(textStatus == 'error'){
			var data =  jqXHR.responseJSON;

			//Check for error from an exception, woops error handler
			if(typeof data.error != 'undefined'){
				var cDiv = '#rowSectionMain';
				

				//Check ajax mode
				if($(this).data('ajax') == 'yes'){
					cDiv ='#modal-body';					
				}	

				var div = $('<div>').addClass('alert alert-error').append('<a class="close" data-dismiss="alert" href="#">&times;</a>').delay(20000).fadeOut('slow');;
				var dl = $('<dl>').addClass('dl-horizontal'), pTag;

				dl.append('<dt>' + data.error.type + '</dt>');
				dd = $('<dd>');								
				var pTag = $('<p>');
				var decode = pTag.html(data.error.message + '<p> File: ' + data.error.file + '</p> <p>Line: ' + data.error.line + '</p>').text();
				pTag.html(decode);
				dd.append(pTag);
				dl.append(dd);

				div.append(dl);						
				$(cDiv).before(div);							
			}

		}else{
			alert( "Request failed: " + jqXHR.statusText);			
		}
	}
});

//Set up modal events
$('#myModal').on('show', function () {

	//change title
	$('#myModalLabel').html($(this).data('title'));
});
$('#myModal').on('shown', function () {

	//force form id, this is for the custom gallery input. we will have to chaneg this later
	$(this).find('form').attr('id', 'addAjax') 
	

	//Add ajax form submitter
	$('#addAjax').crud();
	
	//activate collapse
	site.collapsible();
	

	//call custom code for this event
	site.dynamFuncCall($(this).data('event_shown'));		
	
			
});

$('#myModal').on('hidden', function () {

	//Clear content
	$('#modal-body').html('');	

	// destroy the Modal object before subsequent toggles
	$(this).removeData('modal');
});

//activate collapse
site.collapsible();

