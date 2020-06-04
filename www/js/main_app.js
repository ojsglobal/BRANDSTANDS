

var objMain = 
{
  strToday : '',
	blnMainInitialized : false,
	objTimer : null,
	objInterval : null,
	blnShownAd : false,
	intSizeMulti : 1,
	blnChopped : false,
	intBodyPositionIndex : 0,
	intCurrentQuestion : -1,
	intCurrentTimes : randBetween(2,12),
	intCurrentScore : 0,
	arrCurrentQuestions : [],
	intCurrentKnifeID : 0,
	blnRandomTimes : false,
	intCorrectAnswers : 0,
	arrLevelsCompleted : [],
	arrVideosWatched : [],
	blnResized : false,
	objFullData : null,
	strCurrentBrand : '',

	
	initialize: function() 
	{
	
		
			//NEVER START THIS MORE THAN ONCE.
		if(!objMain.blnMainInitialized)
		{
		
			objMain.blnMainInitialized = true;
			objMain.getAllData();
			
		
			
			if(!blnDebug)
			{
				
				
				try
				{	
					if (localStorage['uuid'] == null) localStorage['uuid'] = device.uuid; 	
					window.plugins.insomnia.keepAwake();	
				}catch(e)
				{
					
				}
				
				
			}else
			{
				alert("DEBUG_ON");
				localStorage['uuid'] = 1;//"b5855a0461e3ed2e";//;//"730735de22e9da4d";//"b5855a0461e3ed2e";// '87139C0A-045A-458A-846C-542894F0B999';//strUUID; 
			}
	
		
			//localStorage['hi_score'] = localStorage['hi_score'] == null ? 	0 : localStorage['hi_score'];
			
			
	
			
			commonSetup();
		
			
			
			
			//TAKES CARE OF ANY USER RELOAD ISSUES.
			for(var i in localStorage)
			{
				if (localStorage[i] == 'undefined' || localStorage[i] == 'NaN') localStorage.removeItem(i);
			}
			
			//localStorageCleanUp();
			
	
				
			//FAKE LOAD SCREEN
			
			var objStartFailSafe = null;
			
			$('#fake_progress_bar').one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(event)
			{	
			
				
				$('#app').removeClass('full_fake_screen');	
				
				if (localStorage['help'] != null)
				{
					fadeScreen('dashboard');
					
				}else
				{
					localStorage['help'] = 1;
					fadeScreen('help');
					$('#home_link').removeClass('disabled');
				}
    	});
    	
			$('#fake_progress_bar').addClass('fully_fake_loaded');
			
				
			
	  	this.bindEvents();	
	  	

	  	if (!blnDebug)
	  	{
	  		try
	  		{
	  			initAds();
	  		}catch(e)
	  		{
	  			alert("AD ERROR");	
	  		}
	  	}
		} 
		
		
	},

	bindEvents : function()
	{
		
	
		$('#home_link_icon').hammer().on('click', function(event)
		{
			if (!$('#home_link').hasClass('disabled'))
			{
				event.preventDefault();
				objMain.buildPage('options_0');
			}
		});
		
		
		$('.back_button').hammer().on('click', function(event)
		{
			event.preventDefault();
			goBack();
			
		});
		
		
		
		document.addEventListener("resume", inForeground, false);
		document.addEventListener("pause", inBackground, false);
		
	},
	
	watchedVideo : function()
	{
				
		var intVideosWatched = (objMain.arrVideosWatched[objMain.intCurrentKnifeID]*1);
		intVideosWatched = isNaN(intVideosWatched) ? 0 : intVideosWatched;
		intVideosWatched++;
		objMain.arrVideosWatched[objMain.intCurrentKnifeID] = intVideosWatched;
		localStorage['videos_watched'] = JSON.stringify(objMain.arrVideosWatched);
		
		var intVideoViews = objWeapons[objMain.intCurrentKnifeID].video_views - intVideosWatched;
		var strLevel = '';
		
		if (!intVideoViews)
		{
			$('#weapon_'+objMain.intCurrentKnifeID).removeClass('locked').removeClass('videos');
			strLevel = 'LEVEL : '+objWeapons[objMain.intCurrentKnifeID].level;	
		}else
		{
			
			strLevel = "WATCH "+intVideoViews+" VIDEO"+(intVideoViews == 1 ? "" : "S");
			strLevel = '<span id="level_'+objMain.intCurrentKnifeID+'">'+strLevel+'</span>';
			$('#level_'+objMain.intCurrentKnifeID).html(strLevel);
		}
		
		$('#level_'+objMain.intCurrentKnifeID).html(strLevel);
		
							
		
	},

	getAllData : function()
	{
		$.ajax(
		{
			url: "http://brand.schwartzer.uk/AJAX/get_all_data_ajax.php",
			data : { 
				"rand" : Math.random(), 
				"uuid" : localStorage['uuid'],  
				"timezone" : strTimeZone
			},
			type: "POST",
			dataType : "JSON",
			error : function(objError)
			{
				alert("ERROR: getAllData");
				alert(JSON.stringify(objError));
			}
		}).done(function(objFullData) 
		{
			objMain.objFullData = objFullData;
			objMain.buildPage("options_0");
			
		});
		

	},
	
	buildPage : function(strCrumbTrail)
	{
		
		if(strCrumbTrail == 'options_0' && $('#options_text').hasClass('home'))
		{
			if($('.current_screen').attr('id') == 'help')
			{
				//objMain.slideIn('dashboard');
				fadeScreen('dashboard');
			}else
			{
				objMain.slideIn('dashboard', 'right');
			}
			
		}else
		{
		
				
				
			arrCrumbTrails = strCrumbTrail.split(",");
			var intIndex = 0;
			var blnBuildWhich;
			var objOptions = [];
		
		
			var getData = function(objData, strNewCrumbTrail)
			{
				
				for(var strIndex in objData)
				{
					
					switch(true)
					{
						case (strIndex.includes("options_")):
							//NEW PAGE
							blnBuildWhich = 'options';
							for(var strOption in objData[strIndex])
							{
								objOptions[strOption] = strNewCrumbTrail+''+strIndex+','+strOption;
							}
							$('#home_link').removeClass('disabled');
							
						break;
						
						case strIndex.includes("brands"):
							//NEW PAGE
							blnBuildWhich = 'brands';
							for(var strBrand in objData[strIndex])
							{
								objOptions[strBrand] = objData[strIndex][strBrand];
							}
							$('#home_link').removeClass('disabled');
							
						break;
						
						default:
							blnBuildWhich = 'home';
							objOptions[strIndex] = strNewCrumbTrail+''+strIndex;
							$('#home_link').addClass('disabled');
						
					}
						
					
				}
				
				var strBrowserLink = "objMain.openBrowser('https://www.schwartzer.uk/brand/add')";
				
				switch(blnBuildWhich)
				{
					case 'brands':
						//BUILD BRANDS
						
						var arrVotes = [];
						var intTotalVotes = 0;
						var strBrands = '';
						
						strBrands = '';
						for(var strIndex in objOptions)
						{
							//strBrands += "<div class='brand_bar flex_centre left_align'>"+strIndex+"</div>";	
						
							arrVotes[strIndex] = (objOptions[strIndex]*1);
							intTotalVotes += (objOptions[strIndex]*1);
							
							var strData = strNewCrumbTrail;//.replace(/options_\d,/g,"");
							
							strBrands += '<div class="brand_bar_holder" onClick="objMain.vote(\''+strData+'\',\''+strIndex+'\')">'+
								'<div id="vote_'+strIndex+'" class="vote"><img src="img/thumb_up.png" style="max-height:100%;"></div>'+
							
					      '<div id="'+strIndex+'" class="brand_bar flex_centre left_align">'+
					      '<span>'+strIndex+'</span>'+
					      '</div>'+
					      '<div class="brand_bar underscore flex_centre left_align">'+
					      '<span>'+strIndex+'</span>'+
					      '</div>'+
					  	'</div>';
						
						
						
						
						}
						
						strBrands += "<div class='options_bar flex_centre left_align white_text add_new_padding' onClick=\""+strBrowserLink+"\">+ Add New</div>";	
						
						objMain.slideIn('dashboard', null, strBrands, function()
						{
						
							//$('#home_options').html(strBrands);
		
							
							setTimeout(function()
							{
			
								for(var strIndex in arrVotes)
								{
									$('#'+strIndex).width((arrVotes[strIndex] / intTotalVotes) * 100+'%');
									
								}
							},300);
						
						});
						
						
					break;
					
					case 'options':
					case 'home':
						var strAlign = $('#options_text').hasClass('left_align') ? "right_align" : "left_align";
						strAlign = blnBuildWhich == 'home' ?  "left_align" : strAlign;
						
						var strOptions = '';
						
						strOptions = '<div id="options_text" class="options '+strAlign+' '+blnBuildWhich+'">';
						for(var strIndex in objOptions)
						{
							strOptions += "<div class='options_bar flex_centre "+strAlign+"' onClick='objMain.buildPage(\""+objOptions[strIndex]+"\")'>"+strIndex+"</div>";	
						}
						//$('#home_options').html(strOptions+'</div>');
						
						if (blnBuildWhich == 'options') strOptions += "<div class='options_bar flex_centre "+strAlign+" white_text' onClick=\""+strBrowserLink+"\">+ Add New</div>";	

						
						
						if (strCrumbTrail == 'options_0' && $('.current_screen').attr('id') != 'fake_loading')
						{
							objMain.slideIn('dashboard', 'right', strOptions+'</div>');
						}else if (strCrumbTrail != 'options_0')
						{
							objMain.slideIn('dashboard', null, strOptions+'</div>');
						}else
						{
							//AFTER HELP
							$('#home_options').html(strOptions+'</div>');
						}
						
					break;
					
					
				}
				
			}
			
			var objNewData;
			var strNewCrumbTrail = '';
			
			for(ii=0; ii<arrCrumbTrails.length; ii++)
			{
				if(!ii)
					objNewData = objMain.objFullData[arrCrumbTrails[ii]];
				else
					objNewData = objNewData[arrCrumbTrails[ii]];
					
					
					
				strNewCrumbTrail += arrCrumbTrails[ii]+",";
			}
		
			getData(objNewData, strNewCrumbTrail);
		}
		
	},
	
		
	vote : function(strData, strBrand)
	{
		//CHOP OFF COMMA
		strData = strData.substring(0, strData.length - 1);
		//strData = strData.replace(/,/g, '|');
		
		var arrVotes = [];
		if (localStorage['votes'] != null) arrVotes = JSON.parse(localStorage['votes']);
	
		objMain.strCurrentBrand = strBrand;
		
		var uploadVote = function()
		{
			
			$.ajax(
			{
				url: "http://brand.schwartzer.uk/AJAX/vote_ajax.php",
				data : { 
					"rand" : Math.random(), 
					"uuid" : localStorage['uuid'],  
					"timezone" : strTimeZone,
					"data" : strData+","+strBrand
				
				},
				type: "POST",
				dataType : "JSON",
				error : function(objError)
				{
					alert(JSON.stringify(objError));
				}
			}).done(function(objFullData) 
			{
			
				objMain.objFullData = objFullData;
				objMain.buildPage(strData);
				
			
				
			});
		}
		
		if ($.inArray(strData, arrVotes) < 0)
		{
			arrVotes.push(strData);
			localStorage['votes'] = JSON.stringify(arrVotes);
			objMain.showThumbsUp();
			setTimeout(function()
			{
			
				//SHOW ADVERT	
				//FIRST VOTE IN THIS CATEGORY
				uploadVote();
				
			}, 3300);
			
		
			
		}else
		{
			if(blnDebug)
			{
				console.log('SHOW ADVERT');
				uploadVote();
			}else
			{
				showWaiting()
				setTimeout(function()
				{
					showInterstitial();
					uploadVote();
					
				},300);
			}
		}
		
		
	
		
	

		
	},
	
	showThumbsUp : function(strBrand)
	{
		$('.vote img').attr('src', 'img/thumb_up.png');
		$('#vote_'+objMain.strCurrentBrand+' img').attr('src', 'img/thumb_up_voted.gif');
		
	},
	
	slideIn : function slideIn(strDivTo, strDirection, strData, objCallbackFunction)
	{
		$('#home_link').off();
		$('#home_link').addClass('hide');
		
		$('#home_link').one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(event)
		{
			$('#home_link').off();
			if(!blnDebug)// && !blnForce)
			{
		
				strDirection = strDirection == null ? 'left' : strDirection;
				
				window.plugins.nativepagetransitions.slide(
				{
				  'direction': strDirection,
				  'iosdelay': -1,
				  'androiddelay': -1,
				  'duration': 333,
		      'slowdownfactor' : 3,
		      'fixedPixelsBottom' : $('nav').innerHeight(),
		      'fixedPixelsTop' : 0,
				  'href': null
				},
		    function (msg) 
		    {
		    	
		    //	swapPages();
					$('#home_options').html(strData);
					
					window.plugins.nativepagetransitions.executePendingTransition
					(
					  function (msg)
					  {
					  	$('#home_link').removeClass('hide');
					  	if (objCallbackFunction != null)
					  	{
								objCallbackFunction();
					  	} // called when the animation has finished
					  },
					  function (msg)
					  {
					  	$('#home_link').removeClass('hide');
					  	if (objCallbackFunction != null) 
					  	{
					  		objCallbackFunction();
					  	} // called in case you pass in weird values
					  }
					);
		
			
					
		    },
		    function (msg) 
		    {
		      alert('error: ' + msg);
		    });
		       
			}else
			{
				$('#home_link').removeClass('hide');
				$('#home_options').html(strData);
				if(objCallbackFunction != null) objCallbackFunction();
			
			}
		});
	
	},

	
			
	openBrowser : function(strURL)
	{
	
		if(!blnDebug)
		{
			cordova.InAppBrowser.open(strURL,  '_system', 'location=yes');
			
		}else
		{
			window.open(strURL);
		}	
		
	
 	},
	


}