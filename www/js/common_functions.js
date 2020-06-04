var blnDebug = false;

var strTimeZone = "Los Angeles/London";
try
{
	strTimeZone = (Intl.DateTimeFormat().resolvedOptions().timeZone);
}catch(e)
{
}

var interval = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

var strUUID = 0;
var intUtil = 0;
var intNotification = 0;
var arrBackScreen = [];//new Array();
var blnAddBack = true;
var blnMenuOut = false;
var arrTouches = [];//new Array();
var intTouchCount = 0;
var	blnStart = false;
var blnInBackground = false;
var	blnPushed = false;
var strCurrentScreen;
var objResizeTimer = null;
var objAppStartInterval = null;
var blnReload = true;
var blnBackgroundReload = true;
var objLoading = null;
var objAlertOverlay = null;
var arrAlertBoxPoll = [];//new Array();
var blnInAction = false;
var strAlertOnScreen = '';
var int24Hours = 86400;
//var objWaitingTimer = null;
var intScreenHeight =  $(window).height();
var intScreenWidth =  $(window).width();
var intStandardScrollSpeed = 600;
var blnIgnoreNav = false;
var objFailSafeTimer = null;
var blnAppOnline = false;
var strVersion = 0;


var strMobiscrollClass = 'material';

var strDeviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";


if (blnDebug) 
{
	//strDeviceType = 'iPhone';
	//strDeviceType = 'Android';

	var device = [];
	device['model'] = "iPhone10,5";
	//device['model'] = "iPhone11";//5,1";
	
}
var blnIPhoneX = false;



var intMinutesToAdd = 0;// isDST(new Date()) == true ? (60 * 60000) : 0;

var blnApple = strDeviceType == "iPhone" ? true : false;


var localStorageCleanUp = function()
{
//TAKES CARE OF ANY USER RELOAD ISSUES.
	for(ii in localStorage)
	{
		if (localStorage[ii] == '999' || localStorage[ii] == 'null' || localStorage[ii] == 'undefined' || localStorage[ii] == 'NaN') localStorage.removeItem(ii);
	}

	
}



function fadeScreen (strWhichScreen, objCallbackFunction)
{
	
	strCurrentScreen = $('.current_screen').attr('id');
	var blnForce = strCurrentScreen == 'fake_loading' ? true : false;
	$('.disable').removeClass('disable');
		
	var beforeScreenFade = function()
	{
//		$('#alert_box').mobiscroll('hide'); 
		
		$('#app').removeClass('disable');
	
		if (strCurrentScreen != null) arrBackScreen.push(strCurrentScreen);
			
		
	}
	
	var afterScreenFade = function() //AFTER FADE
	{ 
		strCurrentScreen = $('.current_screen').attr('id');
	
		if (objCallbackFunction != null) objCallbackFunction();
		
	}

 
	if (strCurrentScreen != strWhichScreen && !blnIgnoreNav)
	{
	
		beforeScreenFade();
	
		var intTime = 0;//100;
		var intInnerTime = 10;//intTime + 30;


		//ANDROID IS TOO SLOW FOR NATIVE SCREEN TRANSITIONING
		blnForce = true;//!blnApple ? true : blnForce;
		
	
	//var goScreenFade = function()
	//{
		setTimeout(function()
		{
			//REMOVE OPACITY ON CURRENT SCREEN, AND PUT IT BACK IN THE HOLDING AREA
			$('#'+strCurrentScreen).animate(
			{
				'opacity' : 0
				
			}, intInnerTime, function()
			{
				$('#holding_area').prepend($(this));
				$('.current_screen').removeClass('current_screen');
 				
			});
	
		
			//RETRIEVE THE NEW SCREEN AND PUT IT IN THE APP, THEN ADD OPACITY
			$('#app').prepend($('#'+strWhichScreen));
			$('#'+strWhichScreen).animate(
			{
				'opacity' : 1
				
			}, intInnerTime, function()
			{
				//GO TO TOP.
				//scrollTo("app", null, null, 100);
				$('#'+strWhichScreen).addClass('current_screen');
				afterScreenFade();
			});
		
			removeLoading(intTime);
		
		}, intTime);
		
	//}
	
	

	  
			
		
		
	}else
	{
		if (objCallbackFunction != null) objCallbackFunction();
	}

}



var goBack = function(objCallbackFunction)
{
	
	var strMostRecentBackScreen = arrBackScreen[arrBackScreen.length-1];
		
	strCurrentScreen = $('.current_screen').attr('id');
		
	if (strMostRecentBackScreen != '' && strMostRecentBackScreen != null && !$('#waiting_screen').hasClass('show'))
	{
		strMostRecentBackScreen = arrBackScreen.pop();		
		fadeScreen(strMostRecentBackScreen, objCallbackFunction);
		removeLoading();

	}


}

var keyboardShowHandler = function(objEvent)
{
	

	var intKeyboardHeight = objEvent.keyboardHeight;	
	
	var objInput = $('.current_input');
	var offset = objInput.offset();
	var posY = offset.top - $(window).scrollTop();
	posY = (objInput.height() + posY);

	var fltKeyboardBottom = (intScreenHeight - parseFloat(intKeyboardHeight));


	if (posY >= fltKeyboardBottom )
	{
		$('#no_scroll_overlay').show();
		$('#app').animate(
		{
			top: "-"+((posY-fltKeyboardBottom)+50)+"px"
		}, 100);
	}
	
}

var keyboardHideHandler = function(objEvent)
{
	$('#no_scroll_overlay').hide();
	$('#app').animate(
	{	
		top: 0
	}, 100);
}

var hideScreensWhenNotInUse = function (strException)
{

	var debounceHideScreensWhenNotInUse = function()
	{
		$('.standard_card:not(.current_screen)').addClass('opacity_dimmed');
		
	
	}
	
	var goDebounce = debounce(function(e)
	{
		debounceHideScreensWhenNotInUse();
	}, 450, true);
	
	goDebounce();
	

}


var commonSetup = function()
{
	if(!blnDebug)
	{
		try
		{
			windowSoftManager.setMode("adjustPan");
		}catch(e)
		{
			
		}
	}

	
		
	switch (strDeviceType)
	{
		case 'iPhone':
			//strMobiscrollClass = 'ios';
			
			$('.android_only').hide();
			$('.hide_apple').addClass('hidden');
			
			switch (device.model)
			{
				case 'iPhone5,1':
				case 'iPhone5,2':
				case 'iPhone5,3':
				case 'iPhone5,4':
				case 'iPhone6,1':
				case 'iPhone6,2':
				case 'iPhone7,1':
				case 'iPhone7,2':
				case 'iPhone8,1':
				case 'iPhone8,2':
				case 'iPhone8,4':
				case 'iPhone9,1':
				case 'iPhone9,2':
				case 'iPhone9,3':
				case 'iPhone9,4':
				case 'iPhone10,1':
				case 'iPhone10,2':
				case 'iPhone10,4':
				case 'iPhone10,5':
					//$('#app').addClass('app_ios');
					$('.ios_spacer').addClass('active');
				break;
				
				default:
					$('nav').addClass('app_nav_ios_x2');
					//$('#app').addClass('app_ios_x2');
					$('.ios_spacer').addClass('active_x2');
					
			}

		//	$('.main_logo_image').removeClass('opacity_hidden');
			
			try
			{
				if (!blnDebug) cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
			}catch(e)
			{
				
			}
	
		break;

		default:
		
			//strMobiscrollClass = 'material';
			
			$('.main_logo_image').removeClass('opacity_hidden');
			
			$('.prevent_keyboard_cover').blur(function()
			{
				$(this).removeClass("current_input");
			});
			
			$('.prevent_keyboard_cover').focus(function()
			{
				$(this).addClass("current_input");
			});

			window.addEventListener('native.keyboardshow', keyboardShowHandler);
			window.addEventListener('native.keyboardhide', keyboardHideHandler);
		
		
		
			//document.addEventListener("backbutton", goBack);
			document.addEventListener("backbutton", function(){});

			
			if(!blnDebug)
			{
				try
				{
					$(document).on ('keydown', function (e) 
					{
				
						switch (e.which)
						{
							case 13:
							case '13':
							case 9:
							case '9':
								cordova.plugins.Keyboard.close();
								keyboardHideHandler();
							break;
						
						}
					});
				}catch(e)
				{
					
				}
			}
	

		break;
	}
	


	$('input').on('focus', function()
	{
		var strID = $(this).attr('id');
		if ($('#'+strID+"_error").hasClass('error_red'))
		{
			$('#'+strID+"_error").removeClass('error_red');
		}
		
	});

}

/*

function resetAllErrors()
{


	$('input').each(function()
	{
		strID = $(this).attr('id');
		resetErrors(strID+"_holder");
	})
	
	
}

function resetErrors(strID)
{
		//var strErrorID = $(objElement).attr('id')+"_holder";
		if ($('#'+strID).hasClass('error_red'))
		{
			$('#'+strID).removeClass('error_red');
		}
}
*/

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
}

function toTimestamp(strDate)
{
	
	//MUST REMOVE th, st, nd
	strDate = strDate.replace("nd", "");
	strDate = strDate.replace("th", "");
	strDate = strDate.replace("st", "");
	strDate = strDate.replace("rd", "");
	
   var datum = Date.parse(strDate);
   
   return datum/1000;
}


var chopText = function(strSelectedText, intLength)
{
	strSelectedText = strSelectedText == null ? "..." : strSelectedText;
	strSelectedText = strSelectedText.length > intLength ? strSelectedText.substr(0, intLength-3)+"..." : strSelectedText;
	return(strSelectedText);
}

var changeSelectText = function(strDiv, strOverideText)
{
	var objThis = strWhich = '';

	objThis = strDiv.returnValue != true ? $('#'+strDiv) : $(this);
	
	var strSelectedText = strOverideText != '' &&  strOverideText != null && strOverideText != 'undefined' ? strOverideText : objThis.find('option:selected').text();

	strSelectedText = chopText(strSelectedText, 35);
	var strID;

	if (strSelectedText == '')
	{
		strSelectedText = objThis.val();
		strID = objThis.data('text_id');
	}else
	{
		strID = objThis.closest('select').data('text_id');
	}

	if (strSelectedText != '' && strSelectedText != 'null' && strSelectedText != null && strSelectedText != 'NOT_ANSWERED')	
	{
		$('#'+strID).html(strSelectedText);
		$('#'+strID).attr('data-answer', objThis.val());
		$('#'+strID).removeClass('light_grey_text');
		
		var strErrorID = strID+"_holder";

		if ($('#'+strErrorID).hasClass('error_red')) $('#'+strErrorID).removeClass('error_red');
		
	}

}	

var console_log = function (strMessage)
{
	
	if (localStorage['company_id'] == '1')
	{
		if (!blnDebug)
		{	
			$('#console').append(strMessage+"<br></br>");
		}else
		{
			
			console.log(strMessage);
		}
	}
	
}


/*function getAge(born, now) 
{
	var birthday = new Date(now.getFullYear(), born.getMonth(), born.getDate());
	if (now >= birthday) 
	return now.getFullYear() - born.getFullYear();
	else
	return now.getFullYear() - born.getFullYear() - 1;
}*/

function getAge() 
{
	var strDOB = localStorage['dob'];
	
	if (strDOB.indexOf('/')> -1)
	{
		var arrBirthdate = strDOB.split("/");		
		strDOB = arrBirthdate[2]+"/"+arrBirthdate[0]+"/"+arrBirthdate[1];
		
	}else
	{
		var arrBirthdate = strDOB.split("-"); 
		strDOB = arrBirthdate[0]+"/"+arrBirthdate[1]+"/"+arrBirthdate[2];
	}

  var today = new Date();
  var birthDate = new Date(strDOB);
  var age = today.getFullYear() - birthDate.getFullYear();
  
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }


 	localStorage['age'] = age;
  return age;
  
}

var dateForDisplay = function(strDate)
{
	if (strDate.indexOf('/')> -1)
	{
		var arrBirthdate = strDate.split("/");		
		strDate = arrBirthdate[0]+"/"+arrBirthdate[1]+"/"+arrBirthdate[2];
		
	}else
	{
		var arrBirthdate = strDate.split("-"); 
		strDate = arrBirthdate[1]+"/"+arrBirthdate[2]+"/"+arrBirthdate[0];
	}
		
	return(strDate);	
}



function flushAlertBox()
{
	arrAlertBoxPoll = [];//new Array();
}


function checkAlert(intID)
{
	arrAlertBoxPoll = [];
	
	/*if (intID != null) arrAlertBoxPoll.splice(intID, 1);
	
	//ALERTS WAITING
	if(arrAlertBoxPoll.length>0)
	{
		var objAlert = arrAlertBoxPoll.shift();
		setTimeout(function()
		{
			alert_box(objAlert.strText, objAlert.strTitle, objAlert.strSet, objAlert.strCancel, objAlert.objCallbackFunction, objAlert.intTimeout, true)		
		
		}, 350);

	}*/
	
	
}

function alert_box(strText, strTitle, strSet, strCancel, objCallbackFunction, blnDataFunction)
{
	strPosition = "modal";
	blnDataFunction = blnDataFunction == null ? false : blnDataFunction;
	
	strTitle = strTitle == null ? "" : '<p><bf class="white_text standard_drop_shadow">'+strTitle+'</b></p><div class="large_spacer"></div>';

	 $('#alert_box').html('<div class="md-body">'+
		strTitle+
		'<p class="normal_text white_text">'+strText+'</p>'+
		'</div>');

	var objButtons;
	
	switch (true)
	{
		case strSet == null || strSet == '':
			objButtons = [{text:'<button class="green_background"><fa>&#xf00c;</fa></button>', handler:'set'}];
		break;

		case strSet == 1 && strCancel == 1:
				objButtons = [{text:'<button class="green_background"><fa>&#xf00c;</fa></button>', handler:'set'},{text:'<button class="pink_background"><fa>&#xf00d;</fa></button>', handler:'cancel'}];
		break;

		case strCancel == null:
			objButtons = [{text:strSet, handler:'set'}];
		break;

		default:
			objButtons = [{text:strSet, handler:'set'},{text:strCancel, handler:'cancel'}];
		break;
	}
	
	strTitle = '';
	
	$('#alert_box').mobiscroll().widget(
	{
		theme: strMobiscrollClass,
		display: strPosition,
		buttons: objButtons,
		headerText: '',
		closeOnOverlay: false,
		touchUI : true,
		dataFunction : blnDataFunction ? objCallbackFunction : null,
		onClose: function(valueText, btn, inst)
		{
			//strAlertOnScreen = '';
			//checkAlert(intID);
			
			if (objCallbackFunction != null) objCallbackFunction(btn);
			
		}
	});

	
	
	$('#alert_box').mobiscroll('show'); 
	if($('.login_only').length > 0) $('.dw-persp').addClass('full_size');

}

function alert_box_OLD(strText, strTitle, strSet, strCancel, objCallbackFunction, intTimeout, blnDisplay, strPosition, blnDummy)
{
	
	try
	{
			cordova.plugins.Keyboard.close();
	}catch(e)
	{
		
	}
	
	
	
	
	var intTimeoutTime = intTimeout != null ? intTimeout : 0;
	var blnShowWaiting = $('#waiting_screen').css('z-index') > 0 ? true : false;
	var blnOtherAlert = !arrAlertBoxPoll.length ? false : true;
	var intID;
	var strCheckText;
	
	blnOtherAlert = strAlertOnScreen != '' ? true : blnOtherAlert;
	strPosition = strPosition == null ? "modal" : strPosition;
	blnDummy = blnDummy == null ? false : blnDummy;
	
	setTimeout(function()
	{
	
		if (blnShowWaiting || strAlertOnScreen != '')
		{	
	
				if (!blnOtherAlert)
				{
					arrAlertBoxPoll.push({'strText': strText, 'strTitle': strTitle, 'strSet': strSet, 'strCancel': strCancel, 'objCallbackFunction': objCallbackFunction, 'intTimeout': intTimeout});
				}else
				{
				
					var blnMatched = false;
					for(ii in arrAlertBoxPoll)
					{
						strCheckText = arrAlertBoxPoll[ii].strText;
						if (strText == strCheckText)
						{ 
							blnMatched = true;
							break;
						}
					}
	
					if (!blnMatched) arrAlertBoxPoll.push({'strText': strText, 'strTitle': strTitle, 'strSet': strSet, 'strCancel': strCancel, 'objCallbackFunction': objCallbackFunction, 'intTimeout': intTimeout});
	
				}
	
			}else if (blnOtherAlert && !blnDisplay)
			{
			
				arrAlertBoxPoll.push({'strText': strText, 'strTitle': strTitle, 'strSet': strSet, 'strCancel': strCancel, 'objCallbackFunction': objCallbackFunction, 'intTimeout': intTimeout});
			
			}else
			{
			
				strAlertOnScreen = strText;
				
				arrAlertBoxPoll.push({'strText': strText, 'strTitle': strTitle, 'strSet': strSet, 'strCancel': strCancel, 'objCallbackFunction': objCallbackFunction, 'intTimeout': intTimeout});
				intID = (arrAlertBoxPoll.length)-1;
	
				strTitle = strTitle == null ? "" : '<p><bf class="white_text standard_drop_shadow">'+strTitle+'</b></p><div class="large_spacer"></div>';
	
				 $('#alert_box').html('<div class="md-body">'+
					strTitle+
					'<p class="normal_text white_text">'+strText+'</p>'+
					'</div>');
	
				var objButtons;
				
				switch (true)
				{
					case strSet == null || strSet == '':
						objButtons = [{text:'<button class="green_background"><fa>&#xf00c;</fa></button>', handler:'set'}];
					break;
	
					case strSet == 1 && strCancel == 1:
							objButtons = [{text:'<button class="green_background"><fa>&#xf00c;</fa></button>', handler:'set'},{text:'<button class="pink_background"><fa>&#xf00d;</fa></button>', handler:'cancel'}];
					break;
	
					case strCancel == null:
						objButtons = [{text:strSet, handler:'set'}];
					break;
	
					default:
						objButtons = [{text:strSet, handler:'set'},{text:strCancel, handler:'cancel'}];
					break;
				}
				
				strTitle = '';
				
				$('#alert_box').mobiscroll().widget(
				{
					theme: strMobiscrollClass,
					display: strPosition,
					buttons: objButtons,
					headerText: '',
					closeOnOverlay: false,
					touchUI : true,
					onClose: function(valueText, btn, inst)
					{
						strAlertOnScreen = '';
						checkAlert(intID);
						
						if (objCallbackFunction != null) objCallbackFunction(btn);
						
					}
				});
	
				
				$('#alert_box').mobiscroll('show'); 
				if (blnDummy) $('.dwo').addClass('dummy_box');
				
		}

	}, intTimeoutTime);

}

 function isDST(t) { //t is the date object to check, returns true if daylight saving time is in effect.
    var jan = new Date(t.getFullYear(),0,1);
    var jul = new Date(t.getFullYear(),6,1);
    return Math.min(jan.getTimezoneOffset(),jul.getTimezoneOffset()) == t.getTimezoneOffset();  
}

function convertDateToTimestamp(strDate, strSeperator)
{
	var arrDate = strDate.split(strSeperator);
	var objNewDate = arrDate[0]+"/"+arrDate[1]+"/"+arrDate[2];
	return(new Date(objNewDate).getTime());

}

	
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}


function toAppleDate(strDate)
{
	//CONVERT FROM NORMAL TO US APPLE

	
	
	var strNewDate = strDate;
	
	if (blnApple)
	{
		if (strDate.indexOf('-')> -1)
		{
			var arrNewDate = strDate.split("-");
			 strNewDate = padDate(arrNewDate[1])+"/"+padDate(arrNewDate[2])+"/"+padDate(arrNewDate[0]);
		}
	}
	return(strNewDate);


}

function toNormalDate(strDate)
{
	var strNewDate = strDate;

	if (strDate.indexOf('/')> -1)
	{
		var arrNewDate = strDate.split("/");
		strNewDate = padDate(arrNewDate[2])+"-"+padDate(arrNewDate[1])+"-"+padDate(arrNewDate[0]);
	}

	return(strNewDate);


}

function padDate(intNumber)
{

	return (intNumber<10 ? '0'+intNumber : intNumber)
}


function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function showWaiting(strWaitingMessage, blnFailSafe, intWaitingTime)
{
	
	$('#waiting_screen').addClass('show');
	
	
}

function removeLoading(intTimeout, blnCheckAlert, objCallbackFunction)
{

	
		if ($('#waiting_screen').hasClass('show'))
		{	

			fadeOutWaiting('waiting_screen', null, null, objCallbackFunction);
			
		}

}

function hasLoaded (strDiv, objCallbackFunction)
{
	
	
	$(strDiv).imagesLoaded().done( function( instance ) 
	{
  	var intWidth = 0;//instance['images'][0]['img'].width;
  	var intHeight = 0;//instance['images'][0]['img'].height;
  	
  	if(objCallbackFunction !=null) objCallbackFunction(strDiv, intWidth, intHeight);	
		
		
	});

/*
	var $objImage = $(strDiv).imagesLoaded( function(objImage) 
	{
		console.log(objImage);
		if(objCallbackFunction !=null) objCallbackFunction(strDiv);	
		
	});
*/

}


function showCorrectOverlay(objCallbackFunction)
{
	//console_log("WAITING");

	try
	{
		cordova.plugins.Keyboard.close();
	}catch(e)
	{
		
	}
	
	$('#crushed_photos').html('');
	$('#crushed_photos_holder').hide();
	
	$('#correct_overlay').addClass('show');
	
	setTimeout(function()
	{
		$("#correct_trigger").addClass("drawn");
	}, 200);
	
	
			
	setTimeout(function()
	{
		$("#correct_trigger").removeClass("drawn");
		setTimeout(function()
		{
				$('#correct_overlay').animate(
				{
					'opacity': 0
					
				}, 125, 'swing', function()
				{
					$('#correct_overlay').removeClass('show');
					$('#correct_overlay').attr('style', '');
					
					setTimeout(function()
					{
						if(objCallbackFunction != null) objCallbackFunction();
					}, 300);
					
				});
			
		}, 1100);
		
		
	}, 1100);
		
}



var timeOut = function(strResponse)
{
	
	location.reload();

	if (strResponse == 'set') 
	{
		location.reload();
	}else
	{
		showWaiting();
		failSafeTimer();
	}
}

var failSafeTimer = function(blnShowError, intWaitingTime)
{
	
	blnShowError = blnShowError == null ? true : blnShowError;
	intWaitingTime = intWaitingTime == null ? 30000 : intWaitingTime;  
	
	if (objFailSafeTimer == null)
	{
		//console_log("FAILSAFE ACTIVATED")
		objFailSafeTimer = setTimeout(function()
		{
			removeLoading();
			//console_log("FAILSAFE TIMEOUT")
			clearTimeout(objFailSafeTimer);
			objFailSafeTimer = null;
			
			if (blnShowError) alert_box('This action is taking longer than expected to respond.', "Timeout", null, null, timeOut, true);
			
		}, intWaitingTime);

	}
}

function fmod(a,b) 
{
	return a % b;
}


function titleCase(str) 
{

	if (str != '')
	{
	  var newstr = str.split(" ");
	  for(i=0;i<newstr.length;i++)
	  {
	    var copy = newstr[i].substring(1).toLowerCase();
	    try
	    {
	    	newstr[i] = newstr[i][0].toUpperCase() + copy;
	    }catch(e)
	    {
	    }
	    
	  }
	   newstr = newstr.join(" ");
	   return newstr;
	}else
	{
		return(str);	
	}
	
}  


function checkFirstNameSurname(strFullname)
{
	
	try
	{
		var strPattern = /(\w.+\s).+/;  // /(.*)\s(.*)/;
	
		if (strFullname.match(strPattern)) 
		{
			return(true);
		}else
		{
			return(false)
		}
	}catch(e)
	{
		return(false);
	}

	
}

var restart = function()
{
	location.reload();		
		
}

function instantFadeOutWaiting(strDiv)
{
	clearTimeout(objFailSafeTimer);
	objFailSafeTimer = null;
	$('#'+strDiv).css('opacity', 0);	
	$('#'+strDiv).removeClass('show');
	$('#'+strDiv).attr('style', '');
		
}

function fadeOutWaiting(strDiv, intSpeed, intWait, objCallbackFunction)
{
	intSpeed = intSpeed != null ? intSpeed : 125;
	intWait = intWait != null ? intWait : 125;
	
	
	setTimeout(function()
	{
			
			
		$('#'+strDiv).animate(
		{
			'opacity': 0
			
		}, intSpeed, 'swing', function()
		{
			$('#'+strDiv).removeClass('show');
			
			setTimeout(function()
			{
				
				$('#'+strDiv).attr('style', '');
			
			}, 55);
			
			if (objCallbackFunction != null) objCallbackFunction();
		});
		
	}, intWait);
			
}

var getStartOfWeek = function (d) 
{
	d = new Date(d);
	var day = d.getDay(),
	diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
	return new Date(d.setDate(diff));	
}


function deDupeArray(arr) 
{
  return arr.reduce(function (p, c) 
  {

    // create an identifying id from the object values
    var id = c.ig_id;//[c.x, c.y].join('|');

    // if the id is not found in the temp array
    // add the object to the output array
    // and add the key to the temp array
    if (p.temp.indexOf(id) === -1) 
    {
      p.out.push(c);
      p.temp.push(id);
    }
    return p;

  // return the deduped array
  }, { temp: [], out: [] }).out;
}


var imageDownloaded = function (strImage)
{
		$('#'+strImage).load(function() 
		{
		  //console.log("IMAGE LOADED - RESIZE");
		  
		}).each(function()
		{
			//console.log("IMAGE LOADING");
		  if(this.complete) $(this).load();
		});
	
	
}

function timeConverter(UNIX_timestamp)
{
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();

	min = min < 10 ? 0+''+min : min;
	
  
  var time = date + '-' + month + '-' + year + ' @ ' + hour + ':' + min;
  return time;
}

var percentOfANumber = function(intValue1, intValue2)
{

//	var intPercent = ((parseInt(intValue2*1) * 100) / parseInt(intValue1*1));
	
	var intPercent = (parseInt(intValue1*1) / parseInt(intValue2*1)*100);
	
	intPercent = intPercent > 100 ? 100 : intPercent;
	intPercent = intPercent < 0 ? 0 : intPercent;
	intPercent = isNaN(intPercent) ? 0 : intPercent;
	

	return(intPercent)
}


var convertMinuteToTime = function(intMinutes, blnGraphFormat)
{
	
	blnGraphFormat = blnGraphFormat == null ? false : blnGraphFormat;
	
	var intHours = Math.floor((intMinutes*1) / 60); 
	var strAMPM = intHours >= 12 ?  "pm" :  "am";
	intHours =  intHours > 12 ?  intHours - 12 :  intHours;
	 
	if (!blnGraphFormat)
	{
		var intMinutes = (intMinutes*1) % 60;
		intMinutes = intMinutes < 10 ? ":0"+intMinutes : ":"+intMinutes;
		return(intHours+intMinutes+" "+strAMPM);
	}else
	{
			return(intHours+""+strAMPM);
	}

}

var animateOpacity = function(strDiv, intOpacity)
{
	$('#'+strDiv).animate(
		{
			opacity: intOpacity
		}, 100);
}

function length(obj) 
{
	if (obj != null)
	{
  	return ((Object.keys(obj).length));
	}else
	{
		return(0);
	}
	
}


function debounce(func, wait, immediate) 
{
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function getSortedKeys(obj) 
{
    var keys = []; for(var key in obj) keys.push(key);
    return keys.sort(function(a,b){return obj[b]-obj[a]});
}

//ONSCREEN
function inView(strObject) 
{
	
	/*
	var intAppleAdjust = $('#app').hasClass('app_ios_x2') ? 40 : $('#app').hasClass('app_ios') ? 20 : 0; 
  var intAppHeight = $('#app').height() - intAppleAdjust;
	var docViewTop = intAppleAdjust; //$('#app').scrollTop();
  var docViewBottom = intAppHeight;//docViewTop - intAppHeight;
   						*/
	
	
//	var intAppleAdjust = $('#app').hasClass('app_ios_x2') ? 40 : $('#app').hasClass('app_ios') ? 20 : 0; 
 // var intAppHeight = $('#app').height();// - intAppleAdjust;
	var docViewTop = $('#app').offset().top;//scrollTop();
  var docViewBottom = $('#app').height() + docViewTop;
  
  						
  try
  {
    
    var elem = $(strObject);
    var elemTop = elem.offset().top + elem.height();
    console.log(elem.offset().top+" "+elem.height());
    var blnInView = ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
    //console.log("IN VIEW:"+ docViewTop+" "+blnInView+" "+docViewBottom+" "+elemTop);
    console.log(docViewBottom / elemTop);
    elemTop = !elemTop ? 1 : elemTop;
    
    if (!blnInView)
    {
    	return(docViewBottom / elemTop)
    }else
    {
    	return (0);
    }
    
  }catch(e)
  {
  	return (0.2);
  }
  
}




jQuery.fn.rotate = function(degrees) 
{
	//console.log("DEGREES:"+degrees)
    $(this).css({'transition': '0.5s',
    						'-webkit-transform' : 'rotate('+ degrees +'deg)',
                 '-moz-transform' : 'rotate('+ degrees +'deg)',
                 '-ms-transform' : 'rotate('+ degrees +'deg)',
                 'transform' : 'rotate('+ degrees +'deg)'});
    return $(this);
};


var inBackground = function()
{

	//ADMOB
	if (isAppForeground) 
  {
   // admob.destroyBannerView();
    isAppForeground = false;
  }
  
}
 

var inForeground = function()
{
	
	
		checkAppOnline(null, function()
		{
			objMain.checkPushNotifications();
			objMain.getNotifications(false);
			
			objMain.getCurrentLocation(function()
			{
				objMain.getGames();
			});
			
		});
		
		
	
		//ADMOB
		if (!isAppForeground) 
	  {
	   // setTimeout(admob.createBannerView, 1);
	    //setTimeout(admob.requestInterstitialAd, 1);
	    isAppForeground = true;
	  }
	  
	  
		
}


var scrollTo = function(strDiv, strScrollToDiv, intTimeout, objCallbackFunction)
{

	intTimeout = intTimeout == null ? 0 : intTimeout;
	
	setTimeout(function()
	{

	  try
	  {
	    //I THIKNK I MIGHT NEED TO HIDE THE QUICK LINKS?
	    
	    var intSpeed = 500;// intSpeed == null ? 500 : intSpeed;
	    var intOffsetAdjustment = 0;//intOffsetAdjustment == null ? 0 : intOffsetAdjustment;
	  	if (strDiv.indexOf(".")<0) strDiv = "#"+strDiv;
	  	
	  	if (typeof(strScrollToDiv) == 'string')
	  	{
	  		if(strScrollToDiv.indexOf(".")<0) strScrollToDiv = "#"+strScrollToDiv;
	  	}
	  
	  
	    				
	  	if (strScrollToDiv != null)
	  	{
	  	  try
	  	  {
	    		var top = ($(strScrollToDiv).offset().top*1),
	    		currentScroll = ($(strDiv).scrollTop()*1);
	    		var intScrollTo = currentScroll+top;
	    		intScrollTo = intScrollTo.toFixed(0);
	    	
	    	    
	    		$(strDiv).stop().animate(
	    		{
	    			 scrollTop: intScrollTo-intOffsetAdjustment
	    		}, 
	    		intSpeed, 
	    		'swing',
	    		function()
	    		{
	  
	    		  if (objCallbackFunction != null) objCallbackFunction(intScrollTo);
	    			
	    		});
	  	  }catch(e)
	  	  {
	  	    console_log("ERROR SCROLL")
	  	    if (objCallbackFunction != null) objCallbackFunction(0);
	  	  }
	  
	  
	  	}else
	  	{
	  		
	  		$(strDiv).stop().animate(
	  		{
	  			scrollTop:$(strDiv).offset().top
	  		}, 0, function()
	  		{
	  		   if (objCallbackFunction != null) objCallbackFunction($(strDiv).offset().top);
	  		});
	  	}
	  }catch(e)
	  {
	    console_log("ERROR SCROLL2");
	    if (objCallbackFunction != null) objCallbackFunction(1);    
	  }
	  
  
	}, intTimeout);
	
}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function convertDMSToDD(degrees, minutes, seconds, direction)
{
  var dd = degrees + minutes/60 + seconds/(60*60);

  if (direction == "S" || direction == "W") {
      dd = dd * -1;
  } // Don't do anything for N or E
    return dd;
}

function rgb2hex(colour)
{
	var arrColour = colour.split(',');
	var red = arrColour[0];
	var green = arrColour[1];
	var blue = arrColour[2];
	
	red = red.replace("rgb(", "");
	blue = blue.replace(")", "");

	var rgb = blue | (green << 8) | (red << 16);
	return  (0x1000000 + rgb).toString(16).slice(1)
}

function hexToDec(s) {
    var i, j, digits = [0], carry;
    for (i = 0; i < s.length; i += 1) {
        carry = parseInt(s.charAt(i), 16);
        for (j = 0; j < digits.length; j += 1) {
            digits[j] = digits[j] * 16 + carry;
            carry = digits[j] / 10 | 0;
            digits[j] %= 10;
        }
        while (carry > 0) {
            digits.push(carry % 10);
            carry = carry / 10 | 0;
        }
    }
    return digits.reverse().join('');
}

function decToHex(number)
{
  if (number < 0)
  {
    number = 0xFFFFFFFF + number + 1;
  }

  return number.toString(16).toUpperCase();
}

function colorLuminance(hex, lum) 
{

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}


function breakDownRGB(colour)
{
	var arrColour = colour.split(',');
	var red = arrColour[0];
	var green = arrColour[1];
	var blue = arrColour[2];
	
	red = red.replace("rgb(", "");
	blue = blue.replace(")", "");
	
	var objRGB = {'r': red, 'g': green, 'b': blue};

	var rgb = blue | (green << 8) | (red << 16);
	return  (objRGB);
}

var getDay = function(intForwarBack, strFormat, blnTime)
{
	var objToday = new Date();

	if (intForwarBack != null)
	{
		objToday.setDate(objToday.getDate() + intForwarBack);		
	}
	
	var dd = objToday.getDate();
	var mm = objToday.getMonth()+1; //January is 0!
	var yyyy = objToday.getFullYear();
	var time = objToday.getHours() + ":" + objToday.getMinutes() + ":" + objToday.getSeconds();

	strFormat = strFormat == null ? "mm_dd_yyyy" : strFormat;
	
	var strDate;
	
	
	 var strFullMonth = "January,February,March,April,May,June,July,August,September,October,November,December"
      .split(",")[mm-1];

   var nth = function(d) 
   {
      if(d>3 && d<21) return 'th'; // thanks kennebec
      switch (d % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    } 
    
	
	switch(strFormat)
	{
		case 'nth': 
			  strDate = dd+nth(dd)+" "+strFullMonth+", "+yyyy;
    break;
    
		case 'Ymd':
			strDate = (yyyy+''+mm+''+dd);
		break;
		
		case 'Y-m-d':
			strDate = (yyyy+'-'+mm+'-'+dd);
		break;
		
		default:	
			strDate = (mm + '_' + dd + '_' + yyyy);
	}
	
	
	if (blnTime) strDate = strDate +" "+time;
		
	return(strDate);
	
}

var replaceImage = function(strImage, blnAwait)
{
	var strReplacementImage = blnAwait == null ? "img/default_image.jpg" : "img/awaiting_image.jpg";
	$('#'+strImage).attr('src', strReplacementImage);
}

	

var checkAppOnline = function(blnShowError, objSuccessCallbackFunction, objFailCallbackFunction)
{
	
	var blnShowError = blnShowError == null ? true : blnShowError;
	
	var xhr = new XMLHttpRequest();
  var file = "https://www.schwartzer.uk/blank.png";
  var randomNum = Math.round(Math.random() * 10000);

  xhr.open('HEAD', file + "?rand=" + randomNum, true);
  xhr.send();
   
  xhr.addEventListener("readystatechange", processRequest, false);

  function processRequest(e) 
  {
  	if (xhr.readyState == 4) 
    {
      if (xhr.status >= 200 && xhr.status < 304)
      {
      	clearInterval(objAppStartInterval); 
        if (objSuccessCallbackFunction != null) objSuccessCallbackFunction()
				
      }else 
      {
      	removeLoading();
      	clearInterval(objAppStartInterval);
      	if(blnShowError) 
      	{
      		alert_box('Go Stuckerz! needs an active internet connection.<br><br>Please ensure either your wifi or mobile data is enabled.', "No Connection", null, null, restart);
      	}
				if (objFailCallbackFunction != null) objFailCallbackFunction()
				
      }
    }
  }
  
}
	
function countArray(arrData)
{
	var intCount = 0;
	
	for(intIndex in arrData)
	{
		if (arrData[intIndex] != null) intCount++	
	}
	
	return(intCount);
	
	
}

			
$.fn.slowCount = function( options ) 
{
    var settings = $.extend(
    {
        start:  0,
        end:    100,
        easing: 'swing',
        duration: 400,
        plusMinus : true,
        complete: ''
    }, options );

    var thisElement = $(this);

    $({
  		count: settings.start
  	}).animate(
  	{
  		count: settings.end
  	}, 
    {
			duration: settings.duration,
			easing: settings.easing,
			step: function() 
			{
				var mathCount = Math.ceil(this.count);
				
				if (settings.plusMinus)
				{
					var strSymbol = settings.end <= settings.start ? "-" : "+"; 
					thisElement.text(strSymbol+mathCount);
				}else
				{
					thisElement.text(mathCount);
				}
			},
			complete: settings.complete
		});
};

Number.prototype.round = function(places) 
{
  return +(Math.round(this + "e+" + places)  + "e-" + places);
}

var formatPhone = function(strPhoneNumber)
{
	strPhoneNumber = strPhoneNumber.replace(" ", "");
	for(jj in arrCodes)
	{
		if (strPhoneNumber.indexOf(arrCodes[jj]) >= 0)
		{
			strPhoneNumber = strPhoneNumber.replace(arrCodes[jj], 0);
			break;
		}
	}
	
	strPhoneNumber = strPhoneNumber.replace(/[^\d]/g,'');
	return(strPhoneNumber);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var resetAllTimers = function()
{
	var id = window.setTimeout(function() {}, 0);
	
	while (id--) {
	    window.clearTimeout(id); // will do nothing if no timeout with id is present
	}
}

var randBetween = function (min, max) 
{ 
	// min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

$.fn.warGames = function(content, objCallbackFunction) 
{
    var contentArray = content.split(""),
        current = 0,
        strChar = '',
        objInterval = null,
        elem = this;
        
    objInterval = setInterval(function() 
    {
        if(current < contentArray.length) 
        {
        	strChar = contentArray[current++];
        	switch(strChar)
        	{
        		case '|':
        			//elem.text(elem.text() + '\n\n');
        			$(elem).append("<br>");
        		break;
        		
        		default:
            	//elem.text(elem.text() + strChar);
            	$(elem).append(strChar);
        	}
        	
        }else
        {
        	clearInterval(objInterval);
        	if(objCallbackFunction != null) objCallbackFunction();	
        	
        }
    }, 75);
};

function setBackgrounds(strDiv)
{

	strDiv = strDiv == null ? '' : strDiv;

	if (localStorage['card_background'] != null)
	{
		$(strDiv+'.wood_bg').attr('style', '');
		$(strDiv+'.wood_bg').attr('style', 'background-image: url('+localStorage['card_background']+'); background-repeat: no-repeat; background-position: center; background-size: 100% 100%');
		$(strDiv+'.brown_background').attr('style', 'background-image: url('+localStorage['card_background']+');');
	
	}
	

	
}

var blnClick = false;
function clickColor(hex) 
{

	localStorage.removeItem('card_background');

	if (hex != '')
	{
		if (hex == "#FFFFFF") //STANDARD ORIGINAL COLOUR
		{
			localStorage['skin'] = '#FFFFFF';	
			localStorage['dark_skin'] = '#FAFAFA';
		
				
		}else
		{
		
			var intDarkerHex = colorLuminance(hex, -0.15);
			//var intLighterHex = colorLuminance(hex, 1.1);
			
			//intLighterHex = intLighterHex == hex ? intDarkerHex : intLighterHex;
			intDarkerHex = intDarkerHex == hex ? intLighterHex : intDarkerHex;
			
			localStorage['skin'] = hex;
			localStorage['dark_skin'] = intDarkerHex
			//localStorage['light_skin'] = intLighterHex;
			
		}
		
		window.unityads.showVideoAd();
		
		setBackgrounds();

	}


}





