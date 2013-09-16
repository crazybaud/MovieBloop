$(function(){

    'use strict';
    var Utils = {
		store: function (namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		}
	};

    var App = {
        init: function(){
            this.movies = Utils.store('movies');
            
            $('.datepickerstart')
              .datepicker({format: 'yyyy'})
              .on('changeDate', function(ev){
                  console.log("new start date:"+ev.date.valueOf());
                  $('.datepickerstart').datepicker('hide');
                });
            $('.datepickerend')
              .datepicker({format: 'yyyy'})
              .on('changeDate', function(ev){
                  console.log("new en date:"+ev.date.valueOf());
                  $('.datepickerend').datepicker('hide');
                });
            $('#note-slide-green')
              .slider({
                range: true,
                min: 0,
                max: 10,
                values: [ 6.7, 10 ],
                step: 0.1,
                slide: function(event, ui) {
                  $("#note-range").html("From "+ ui.values[0] + " to " + ui.values[1]);
                },
                change: function(event, ui) {
                  console.log( "The value has changed from "+ ui.values[0] + " to " + ui.values[1]);
                }
              });
            $('#search-button')
              .on('click', this.getResult);
            $('#theaterFeature')
              .on('click', { name: "theaterFeature" },this.showModal);
            $('#addpersonFeature')
              .on('click', { name: "addpersonFeature" },this.showModal);
            $('#orderListFeature')
              .on('click', { name: "orderListFeature" },this.showModal);
            $('#orderListFeatureFNAC')
              .on('click', { name: "orderListFeature" },this.showModal);
            $('#exportFeature')
              .on('click', { name: "exportFeature" },this.showModal);
            $('#exportFeatureCSV')
              .on('click', { name: "exportFeature" },this.showModal);
        },
        showModal: function(event){
        	if (event.data.name.search("theaterFeature")>-1) {
        		$('#featureUnderDevelopmentDescription')
	        		  .text('This link will bring you directly to movie available at your theater right now.');
	        }
        	if (event.data.name.search("addpersonFeature")>-1) {
        		$('#featureUnderDevelopmentDescription')
	        		  .text('Your search results could be filtered with as many people as you want (actors, producers, costume designers, ...)');
	        }
        	if (event.data.name.search("orderListFeature")>-1) {
        		$('#featureUnderDevelopmentDescription')
	        		  .text('The basket of this site will be filled with associated DVD.');
	        }
        	if (event.data.name.search("exportFeature")>-1) {
        		$('#featureUnderDevelopmentDescription')
	        		  .text('To download your result as .xls or .csv file.');
	        }	        
	        $('#featureUnderDevelopment').modal('show');
        },
        initTable: function(){
	        /*
		        // adviced for bootstrap style
		        // remove pagination, scrool
		        "bScrollInfinite": true,
	            "bScrollCollapse": true,
	            "sScrollY": "600px",
	                "sDom": "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>",
	                "aoColumns": [
	                    { "mData": "title" },
	                    { "mData": "year" },
	                    { "mData": "note" },
	                    { "mData": "voters" }
	                ],	         */
	       // TODO ADD HTML in rows 
           // TODO ADD torrent http://torrentz.eu/search?f=test
           var ex = document.getElementById('example');
           if ( ! $.fn.DataTable.fnIsDataTable( ex ) ) {
	           
	           $('#tableBox').fadeIn(1500); // to be correct, it should be $('#tableBox').css('display','block');
	           var mytable=$('#example').dataTable({
	                "bProcessing": true,
	                "bAutoWidth": false, /* width:100% for table */
	                "bLengthChange": false,
	                "aaData": [],
	                "aoColumnDefs": [
	                	{ 
	                		"mData": "title",
	                		"sClass": "my-cell my-cell-left", 
	                		"aTargets": [0],
	                		"mRender": function ( data, type, row ) {
		                		return '<a href="http://www.imdb.com/find?q='+data+'&exact=true">'+data+'</a>';
                    		}
	                	 },
	                	{ "mData": "year", "sClass": "my-cell my-cell-center", "aTargets": [1] },
	                	{ "mData": "note","sClass": "my-cell my-cell-left", "aTargets": [2] },
	                	{ "mData": "voters", "sClass": "my-cell my-cell-right", "aTargets": [3] }
	                ],
	                "iDisplayLength": 20,
	                "sDom": '<"top"f>rt<"bottom"p><"clear">',  /* change place of boes around */
	                "sPaginationType": "bootstrap",
	                "oLanguage": {
	                	"sLengthMenu": "_MENU_ records per page",
	                	"sSearch": "Filter:" /* change filter box name */
	                }
	           });
	           return mytable;
	        } else return $('#example').dataTable();
	        
        },
        getResult: function(e){
            console.log("getResult");
            var searchData={
                noteMin:$('#note-slide-green').slider('values',0),
                noteMax:$('#note-slide-green').slider('values',1),
                dateMin:$('.datepickerstart').val(),
                dateMax:$('.datepickerend').val()
            };
            $('#search-button').html("Loading ...")
                .addClass("btn-warning")
                .removeClass("btn-primary");
            $.ajax({
                url: 'http://'+$('#hiddenRESTServer').text()+'/search',
                type: "POST",
                data: JSON.stringify(searchData),
                contentType: "application/json; charset=utf-8", 
                dataType: 'json',
                success: App.updateResult,
                error: function(jqXHR,status,eT) {
                    try
                    {
                      console.log("POST request error :"+jqXHR.responseText);
                      App.updateResult(jqXHR.responseText,status,jqXHR);
                    }
                    catch(e)
                    {
                      console.log("POST /search failed, sendedData="+JSON.stringify(searchData));
                      $('#search-button')
                        .html("Come back later.")
                        .addClass("btn-danger").removeClass("btn-warning");
                    }
                }
            });
            // this.movies = Utils.store('movies');
        },
        updateResult: function(data,status,jqXHR) {
            console.log( "POST /search data="+status+JSON.stringify(data));
            // alert(jqXHR.responseText);
            //$('#search-result-table-t').html(jqXHR.responseText);
            // this.movies = Utils.store('movies',JSON.parse(jqXHR.responseText));
            // for(var i in localStorage) { console.log(localStorage[i]);}

            // var jsonObject = JSON.parse(jqXHR.responseText);
            
            //fuelux $('#search-result-table').datagrid({ dataSource: jsonObject, stretchHeight: true });

            var mytab=App.initTable();
            mytab.fnDestroy(); // TODO supprimer les données plustot que le tableau
            var mytab=App.initTable();
            $('#resultMessageNb').text(JSON.parse(jqXHR.responseText).length);
            $('#resultMessage').show();
            $('#resultMessage').alert();
            mytab.fnAddData(JSON.parse(jqXHR.responseText));
            
            $('#search-button').html("Search again").addClass("btn-success").removeClass("btn-warning");
          }
    };
    
    App.init();
    /*		requirejs.config({
			paths: {
				'jquery': '../public/js/jquery-1.9.1',
				'jquery-ui': '../public/js/jquery-ui',
				'underscore': '../public/js/underscore',
				'bootstrap': '../public/js/bootstrap.min',
				'bootstrap-datepicker': '../public/js/bootstrap-datepicker',
				'bootstrap-transition': '../public/js/bootstrap-transition',
				'fuelux': '../public/js/fuelux'
			}
		});
		require(['jquery','bootstrap-transition', 'fuelux','jquery-ui','bootstrap-datepicker'], function ($, sampleData, StaticDataSource, DataSourceTree) {
		*/
    /*
		var dataSource = new StaticDataSource({
			columns: [
				{
					property: 'toponymName',
					label: 'Name',
					sortable: true
				},
				{
					property: 'countrycode',
					label: 'Country',
					sortable: true
				},
				{
					property: 'population',
					label: 'Population',
					sortable: true
				},
				{
					property: 'fcodeName',
					label: 'Type',
					sortable: true
				}
			],
			data: sampleData.geonames,
			delay: 250
		});

		$('#MyStretchGrid').datagrid({
			dataSource: dataSource,
			stretchHeight: true
		});*/
    /*
            [
                        {"distrib":"0000000016","voters":296024,"note":9,"title":"\"Game of Thrones\"","year":2011,"_id":"516cb3fdd21410841300ce49"},
                        {"distrib":"0000000008","voters":43420,"note":9,"title":"\"Leyla ile Mecnun\"","year":2011,"_id":"516cb419d214108413013b56"},
                        {"distrib":"1000000025","voters":6783,"note":9,"title":"\"Life\"","year":2009,"_id":"516cb419d214108413013d73"},
                        {"distrib":"0000000026","voters":135897,"note":9,"title":"\"Sherlock\"","year":2010,"_id":"516cb43dd21410841301d582"},
                        {"distrib":"0000000017","voters":7261,"note":9,"title":"\"Sherlock\"","year":2010,"_id":"516cb43dd21410841301d583"},
                        {"distrib":"0000000017","voters":6115,"note":9,"title":"\"Sherlock\"","year":2010,"_id":"516cb43dd21410841301d588"}]
            
            [
            {"0000000016",296024,9,"\"Game of Thrones\"",2011},
            {"0000000008",43420,9,"\"Leyla ile Mecnun\"",2011},
            {"1000000025",6783,9,"Life",2009}],              
*/
    /*
    //console.log("tout roule");
    //jQuery.ajaxSetup()
                $.post('http://127.0.0.1:3000/search',JSON.stringify(searchData)+"\n", function(data,status) {
                     console.log( "POST /search OK data="+status+JSON.stringify(data));
                     $('#search-button').val("Search again ?").addClass("btn-success").removeClass("btn-warning");
                }).fail(function() { console.log("POST /search failed, data="+JSON.stringify(searchData)); });
                */


});
